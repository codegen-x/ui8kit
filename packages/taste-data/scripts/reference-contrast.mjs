import { chromium } from '../../../node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../..');
const catalog=JSON.parse(readFileSync(resolve(root,'packages/taste-data/content/reference-catalog.v0.1.json'),'utf8'));
const base=process.env.REFERENCE_BASE??'http://127.0.0.1:5185/magazine/';
const browser=await chromium.launch({executablePath:process.env.REFERENCE_BROWSER??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const records=[];
try {
 const page=await browser.newPage({viewport:{width:1440,height:1080},reducedMotion:'reduce',colorScheme:'light'});
 for(const c of catalog.concepts)for(const mode of ['authored','normalized']){
  const url=new URL('reference.html',base);url.search=new URLSearchParams({concept:c.id,mode}).toString();
  await page.goto(url.toString(),{waitUntil:'networkidle'});await page.waitForSelector('html[data-capture-ready="true"]');
  const controls=await page.evaluate(()=>{
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
   const rgba=colour=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=colour;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
   const lum=rgba=>{const c=rgba.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
   return [...document.querySelectorAll('.taste-frame button,.taste-frame a')].filter(e=>e.textContent.trim()).map(e=>{
    const s=getComputedStyle(e), fg=rgba(s.color),bg=rgba(s.backgroundColor);
    const text=e.textContent.trim();
    if(fg[3]!==255||bg[3]!==255||s.backgroundImage!=='none'||s.opacity!=='1')return{text,status:'unresolved-background-or-alpha',foreground:s.color,background:s.backgroundColor};
    const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const size=parseFloat(s.fontSize),weight=parseFloat(s.fontWeight),large=size>=24||(size>=18.6667&&weight>=700),threshold=large?3:4.5;
    return{text,status:ratio<threshold?'below-threshold':'above-threshold',ratio,threshold,foreground:s.color,background:s.backgroundColor,foregroundSRGB:fg,backgroundSRGB:bg,fontSize:size,fontWeight:weight};
   });
  });
  records.push({conceptId:c.id,mode,controls});
 }
 const result={format:1,catalogSha256:createHash('sha256').update(readFileSync(resolve(root,'packages/taste-data/content/reference-catalog.v0.1.json'))).digest('hex'),measuredAt:new Date().toISOString(),browser:await browser.version(),theme:'light',viewport:[1440,1080],method:'Computed colours of text controls with their own opaque solid background, converted to sRGB using browser canvas; unresolved backgrounds are excluded.',source:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',limitations:['Not a whole-screen accessibility audit.','Procedural media, transparent backgrounds, states and ancestor opacity need separate review.','sRGB conversion is 8-bit; values near threshold require more precise confirmation.'],records};
 writeFileSync(resolve(root,'plan/reference-catalog/contrast-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log('Solid control colour checks: '+records.length+' cases.');
 for(const r of records){const bad=r.controls.filter(c=>c.status==='below-threshold');if(bad.length)console.log(r.conceptId,r.mode,JSON.stringify(bad.map(c=>({text:c.text,ratio:c.ratio}))));}
}finally{await browser.close();}