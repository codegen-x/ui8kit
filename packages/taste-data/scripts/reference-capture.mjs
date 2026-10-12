import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const output = resolve(root, 'plan/reference-catalog');
const catalog = JSON.parse(readFileSync(resolve(root, 'packages/taste-data/content/reference-catalog.v0.1.json'), 'utf8'));
const base = process.env.REFERENCE_BASE ?? 'http://127.0.0.1:5185/magazine/';
const browserPath = process.env.REFERENCE_BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser = await chromium.launch({ executablePath: browserPath, headless: true });
const records = [];
const variants = process.argv.includes('--variants');
mkdirSync(resolve(output, 'captures'), { recursive: true });
writeFileSync(resolve(output,'capture-input.catalog.json'), readFileSync(resolve(root,'packages/taste-data/content/reference-catalog.v0.1.json')));
const hash = path => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const fingerprints = ['apps/magazine/src/app.css','apps/magazine/src/reference/App.svelte','apps/magazine/src/reference/main.ts','packages/taste-screens/src/frame.css','packages/taste-data/content/reference-copy.v0.1.json'].map(path => ({ path, sha256:hash(path) }));
try {
  const context = await browser.newContext({ deviceScaleFactor:1, reducedMotion:'reduce', colorScheme:'light', locale:'en-US' });
  const page = await context.newPage();
  for (const c of catalog.concepts) {
    const cases = [
      { mode:'authored', probe:'desktop', width:1440, height:1080 },
      { mode:'normalized', probe:'desktop', width:1440, height:1080 },
      { mode:'authored', probe:'narrow', width:390, height:844 },
      { mode:'normalized', probe:'narrow', width:390, height:844 },
      { mode:'long', probe:'narrow', width:390, height:844 },
      ...(variants ? ['colour','font','radius'].map(mode => ({mode, probe:'desktop',width:1440,height:1080})) : []),
    ];
    for (const setup of cases) {
      await page.setViewportSize({ width:setup.width, height:setup.height });
      const url = new URL('reference.html', base);
      url.search = new URLSearchParams({ concept:c.id,mode:setup.mode,probe:setup.probe }).toString();
      const runtimeErrors = [];
      const onError = error => runtimeErrors.push(error.message);
      page.on('pageerror', onError);
      await page.goto(url.toString(), { waitUntil:'networkidle', timeout:60000 });
      await page.waitForSelector('html[data-capture-ready="true"]', { timeout:60000 });
      const metrics = await page.evaluate(() => {
        const frame = document.querySelector('.taste-frame');
        const boundary = frame.getBoundingClientRect();
        const visible = e => { const s=getComputedStyle(e); return s.display!=='none' && s.visibility!=='hidden' && s.clipPath==='none' && (s.clip==='auto' || !s.clip) && !e.closest('.sr-only'); };
        const texts = [...frame.querySelectorAll('h1,h2,h3,p,a,button,label,input')].filter(visible);
        const describe = e => ({ tag:e.tagName.toLowerCase(), text:(e.textContent || e.getAttribute('placeholder') || '').trim().slice(0,100) });
        const outside = texts.filter(e => {const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && (r.left < boundary.left-1 || r.right > boundary.right+1 || r.top < boundary.top-1 || r.bottom > boundary.bottom+1);}).map(describe);
        const textOverflow = texts.filter(e => e.scrollWidth > e.clientWidth+1 && e.clientWidth>0).map(describe);
        const unnamedInputs = [...frame.querySelectorAll('input')].filter(e => !e.labels?.length && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby')).map(describe);
        const smallTargets = [...frame.querySelectorAll('a,button,input')].filter(e => {const r=e.getBoundingClientRect(); return r.width>0 && r.height>0 && (r.width<24 || r.height<24);}).map(describe);
        const occludedControls = [...frame.querySelectorAll('a,button,input')].filter(visible).filter(e => { const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2; if(x<0||y<0||x>=innerWidth||y>=innerHeight)return false; const hit=document.elementFromPoint(x,y); return hit!==e && !e.contains(hit); }).map(describe);
        const title = frame.querySelector('h1');
        const r = title?.getBoundingClientRect();
        const fonts = [...new Set([...frame.querySelectorAll('h1,p')].map(e => getComputedStyle(e).fontFamily))];
        return { key:document.querySelector('#capture').dataset.key, outside, textOverflow, unnamedInputs, smallTargets, occludedControls, fonts,
          frame:{width:boundary.width,height:boundary.height,scrollWidth:frame.scrollWidth,scrollHeight:frame.scrollHeight},
          title:r?{text:title.textContent,width:r.width,height:r.height,fontSize:getComputedStyle(title).fontSize}:null,
          fontsLoaded: fonts.every(f => document.fonts.check('600 24px '+f)),
          fontFaces:[...document.fonts].filter(f=>fonts.some(name=>name.includes(f.family))).map(f=>({family:f.family,status:f.status})),
          focusableCount:frame.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]').length,
        };
      });
      const focus = [];
      for (let i=0;i<Math.min(metrics.focusableCount,12);i++) {
        await page.keyboard.press('Tab');
        focus.push(await page.evaluate(() => {
          const e=document.activeElement, s=getComputedStyle(e), r=e.getBoundingClientRect();
          return {tag:e.tagName.toLowerCase(),text:(e.textContent || e.getAttribute('placeholder') || '').trim().slice(0,80),x:r.x,y:r.y,width:r.width,height:r.height,outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow};
        }));
      }
      // Remove focus paint before the comparison screenshot; keyboard observations remain in the record.
      await page.evaluate(() => { document.activeElement?.blur(); for(const e of document.querySelectorAll('*')) { if(e.scrollTop)e.scrollTop=0; if(e.scrollLeft)e.scrollLeft=0; } window.scrollTo(0,0); });
      const image = `captures/${c.id}-${setup.mode}-${setup.probe}.png`;
      await page.locator('#capture').screenshot({ path:resolve(output,image), animations:'disabled' });
      page.off('pageerror',onError);
      if (runtimeErrors.length || !metrics.fontsLoaded) throw new Error(`${c.id}/${setup.mode}/${setup.probe}: ${JSON.stringify({runtimeErrors,fontsLoaded:metrics.fontsLoaded})}`);
      records.push({ conceptId:c.id, ...setup, url:url.toString(), image, imageSha256:createHash("sha256").update(readFileSync(resolve(output,image))).digest("hex"), metrics, keyboard:focus, runtimeErrors });
    }
    console.log(`Captured ${c.id}: ${cases.length} cases`);
  }
  const result = {format:1,capturedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),browser:await browser.version(),browserPath,base,theme:'light',deviceScaleFactor:1,reducedMotion:'reduce',sourceFingerprints:fingerprints,catalogSha256:hash('packages/taste-data/content/reference-catalog.v0.1.json'),limitations:['Narrow capture overrides the fixed frame width: diagnostic reflow, not production mobile layout.','Geometric bounds are flags for review; they do not detect all overlaps or prove accessibility.','Keyboard focus recorded; component buttons and links are demonstration content.','Contrast over procedural media requires separate review.','No human research results are included.'],records};
  writeFileSync(resolve(output,'capture-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(`Saved ${records.length} captures and capture-results.json`);
} finally { await browser.close(); }