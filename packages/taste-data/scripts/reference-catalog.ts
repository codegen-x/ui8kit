import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { TASTES } from '../src/tastes';
import { parseStyleKey, styleKey, encodePicks, decodePicks, MIN_PICKS } from '../src/picks';
import { COMPOSITION_OF } from '../src/compositions';
import { EXCLUDED_SCREENS, EXCLUDED_SCREENS_2 } from '../src/curated';

// Editorial checks and artifact rendering. No app imports, DOM, network, or dependencies.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const dataPath = 'packages/taste-data/content/reference-catalog.v0.1.json';
const catalog = JSON.parse(readFileSync(resolve(root, dataPath), 'utf8'));
const errors: string[] = [];
const check = (condition: unknown, message: string) => { if (!condition) errors.push(message); };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
// Hash with LF line endings so the check does not depend on the checkout's EOL (core.autocrlf).
const hash = (path: string) => createHash('sha256').update(readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
const unique = (values: string[], label: string) => check(new Set(values).size === values.length, `Duplicate ${label}`);
const validStyle = (s: any, label: string) => {
  const parsed = parseStyleKey(s.key);
  check(parsed && styleKey(s) === s.key, `Invalid style: ${label}`);
};
check(catalog.format === 1 && catalog.version === '0.1.0', 'Unsupported catalog version');
check(catalog.concepts.length === 12, 'Expected 12 concepts');
check(catalog.scope.authoredScreenCount === TASTES.length, 'Authored screen count is stale');
const ids = new Set<string>(catalog.concepts.map((c: any) => c.id));
unique(catalog.concepts.map((c: any) => c.id), 'concept IDs');
unique(catalog.concepts.map((c: any) => c.source.screen), 'concept screens');
check(new Set(catalog.concepts.map((c: any) => c.layoutFamily)).size === 10, 'Expected ten layout families');
const templates = new Set([...readFileSync(resolve(root, 'apps/magazine/src/templates/registry.ts'), 'utf8').matchAll(/\{ id: "([a-z-]+)"/g)].map(m => m[1]));
const excluded = new Set([...EXCLUDED_SCREENS, ...EXCLUDED_SCREENS_2]);
for (const p of catalog.provenance) check(hash(p.path) === p.sha256, `Stale provenance: ${p.path}`);
const variantIds: string[] = [], variantKeys: string[] = [];
for (const c of catalog.concepts) {
  const taste = TASTES.find(t => t.id === c.source.screen);
  check(!!taste, `Unknown screen: ${c.id}`);
  if (!taste) continue;
  const base = c.source.authoredStyle;
  validStyle(base, c.id);
  check(same(base.fonts, taste.fonts) && base.skin === taste.skin && base.radius === taste.radius && base.screen === taste.id, `Authored style mismatch: ${c.id}`);
  check(c.layoutFamily === taste.composition && c.source.nativeDeckIndex === taste.deck, `Authored structure mismatch: ${c.id}`);
  check(same(c.source.legacyComposition, COMPOSITION_OF[taste.id]), `Legacy composition mismatch: ${c.id}`);
  check(!excluded.has(taste.id) && c.source.curation.excluded === false, `Excluded screen: ${c.id}`);
  check(hash(c.source.path) === c.source.sha256, `Stale screen review: ${c.id}`);
  check(ids.has(c.distinction.against) && c.distinction.against !== c.id, `Invalid distinction: ${c.id}`);
  check(catalog.vocabulary.contentPatterns.includes(c.composition.contentPattern), `Unknown composition: ${c.id}`);
  check(c.variants.length === 3, `Expected three variants: ${c.id}`);
  unique(c.variants.map((v: any) => v.axis), `variant axes in ${c.id}`);
  for (const v of c.variants) {
    variantIds.push(v.id); variantKeys.push(v.style.key); validStyle(v.style, v.id);
    const changed = ['skin', 'fonts', 'radius'].filter(k => !same(base[k], v.style[k]));
    const axis = { colour: 'skin', font: 'fonts', radius: 'radius' }[v.axis as 'colour' | 'font' | 'radius'];
    check(v.style.screen === base.screen && changed.length === 1 && changed[0] === axis, `Variant changes wrong axes: ${v.id}`);
  }
  for (const probe of c.templateProbes) check(templates.has(probe.id) && probe.status === 'planned', `Invalid probe: ${c.id}/${probe.id}`);
  const [w, h] = c.schematic.coordinateSpace;
  for (const [x, y, bw, bh] of c.schematic.elements) check(x >= 0 && y >= 0 && bw > 0 && bh > 0 && x + bw <= w && y + bh <= h, `Schematic bounds: ${c.id}`);
}
unique(variantIds, 'variant IDs'); unique(variantKeys, 'variant keys');
check(variantIds.length === 36, 'Expected 36 variants');
unique(catalog.relations.map((r: any) => r.id), 'relation IDs');
unique(catalog.relations.map((r: any) => [r.from, r.to].sort().join(':')), 'relation pairs');
check(catalog.relations.length === 20, 'Expected 20 relations');
for (const r of catalog.relations) {
  check(ids.has(r.from) && ids.has(r.to) && r.from !== r.to, `Invalid relation: ${r.id}`);
  check(catalog.vocabulary.relationTypes.includes(r.type) && r.bidirectional === true && r.reason.length > 0, `Invalid relation metadata: ${r.id}`);
  if (r.type === 'same-layout-family') check(catalog.concepts.find((c: any) => c.id === r.from)?.layoutFamily === catalog.concepts.find((c: any) => c.id === r.to)?.layoutFamily, `Family relation mismatch: ${r.id}`);
}
for (const f of catalog.families) check(same(f.conceptIds, catalog.concepts.filter((c: any) => c.layoutFamily === f.id).map((c: any) => c.id)), `Family index mismatch: ${f.id}`);
const entry = catalog.fixtures.entry;
check(entry.styleKeys.length === MIN_PICKS && new Set(entry.styleKeys).size === MIN_PICKS, 'Entry requires exactly ten distinct styles');
check(same(decodePicks(entry.query), entry.styleKeys) && encodePicks(entry.styleKeys) === entry.query, 'Picks roundtrip mismatch');
check(entry.route === `/magazine/?picks=${entry.query}`, 'Entry route mismatch');
check(same(decodePicks(new URL('https://fixture.invalid' + entry.route).searchParams.get('picks')), entry.styleKeys), 'URL decoding mismatch');
const comparison = catalog.fixtures.comparison;
check(comparison.styles.length === 12, 'Expected twelve normalized styles');
unique(comparison.styles.map((s: any) => s.conceptId), 'normalized concept IDs');
for (const s of comparison.styles) {
  const concept = catalog.concepts.find((c: any) => c.id === s.conceptId);
  check(concept && s.key === styleKey({ screen: concept.source.screen, skin: comparison.skin, fonts: comparison.fonts, radius: comparison.radius }), `Invalid normalized style: ${s.conceptId}`);
}
const copy = JSON.parse(readFileSync(resolve(root, catalog.fixtures.comparison.commonDeckPath), 'utf8'));
for (const k of ['brand','eyebrow','title','accent','lead','cta','secondary','input','note']) check(typeof copy[k] === 'string', `Missing copy field: ${k}`);
for (const k of ['nav','stats','items','tags']) check(Array.isArray(copy[k]) && copy[k].length > 0, `Missing copy array: ${k}`);
for (const k of ['nav','tags']) check(copy[k].every((s: unknown) => typeof s === 'string'), `Invalid copy strings: ${k}`);
for (const s of copy.stats) check(typeof s.value === 'string' && typeof s.label === 'string', 'Invalid copy stat');
for (const s of copy.items) check(typeof s.title === 'string' && typeof s.text === 'string', 'Invalid copy item');
check(catalog.scenarios.length === 5, 'Expected five scenarios');
for (const s of catalog.scenarios) {
  for (const id of s.candidateConcepts ?? []) check(ids.has(id), `Unknown scenario concept: ${s.id}/${id}`);
  if (s.expectedVariantId) check(variantIds.includes(s.expectedVariantId), `Unknown scenario variant: ${s.id}`);
  if (s.relationId) check(catalog.relations.some((r: any) => r.id === s.relationId), `Unknown scenario relation: ${s.id}`);
  if (s.templateId) check(templates.has(s.templateId), `Unknown scenario template: ${s.id}`);
}
unique(catalog.scenarios.map((s: any) => s.id), 'scenario IDs');
// The JSON Schema is an editor contract. These checks validate semantic cross-references;
// they do not claim to implement a general JSON Schema validator.
const schema = JSON.parse(readFileSync(resolve(root, 'packages/taste-data/content/reference-catalog.schema.json'), 'utf8'));
check(schema.$schema === 'https://json-schema.org/draft/2020-12/schema', 'Missing schema contract');
if (errors.length) { for (const e of errors) console.error(e); process.exit(1); }
console.log('Catalog checks passed: 12 concepts, 10 layout families, 36 variants, 20 relations, 5 scenarios. Source hashes and style keys match.');
const args = process.argv.slice(2);
if (args.some(a => a !== '--check' && a !== '--render')) throw new Error('Usage: bun packages/taste-data/scripts/reference-catalog.ts [--check | --render]');
if (!args.includes('--render')) process.exit(0);
const esc = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const svg = (c: any) => `<svg viewBox="0 0 320 240" role="img" aria-label="${esc(c.title)}: schematic of masses"><rect width="320" height="240" fill="#faf9f6"/>${c.schematic.elements.map(([x,y,w,h,k]: any[]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${k === 'title' || k === 'action' ? '#282824' : k === 'media' ? '#a2a59b' : '#d3d5cc'}"/>`).join('')}</svg>`;
const embedded = JSON.stringify(catalog).replace(/</g, '\\u003c');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Magazine — reference catalog v0.1</title><style>
*{box-sizing:border-box}body{margin:0;background:#f7f6f2;color:#252722;font:16px/1.55 system-ui,sans-serif}header,main,footer{max-width:1320px;margin:auto;padding:32px}header{padding-top:54px}h1{font-size:clamp(32px,5vw,64px);line-height:1.05;max-width:900px;letter-spacing:-.04em}h2{font-size:27px}h3{margin:12px 0 5px}p{max-width:900px}small,.muted{color:#62675d}.meta{letter-spacing:.12em;font-size:12px;text-transform:uppercase}.counts{display:flex;gap:30px;flex-wrap:wrap;margin:30px 0}.counts strong{font-size:32px;display:block}label{display:inline-block;margin:0 22px 16px 0}select,button{font:inherit;padding:10px;border:1px solid #b4b9aa;border-radius:5px;background:#fff;color:inherit}button{cursor:pointer}button:hover{border-color:#252722}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #54634a;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}.card{text-align:left;padding:12px;background:#fff;display:block;width:100%}.card svg{width:100%;display:block;border:1px solid #e0e2da}.card p{font-size:14px;margin:6px 0}.tag{font-size:12px;color:#58624c}.notice{border-left:3px solid #68765a;padding:10px 18px;background:#eeefe8}.detail{margin-top:36px;padding:28px;background:white;border:1px solid #d0d4c7;scroll-margin-top:20px}.detail .columns{display:grid;grid-template-columns:minmax(230px,1fr) 2fr;gap:28px}.detail svg{width:100%;max-width:420px}li{margin-bottom:8px}code{overflow-wrap:anywhere;font-size:12px}.relation{padding:14px 0;border-top:1px solid #e1e3da}.scenario{padding:18px 0;border-top:1px solid #cdd2c3}a{color:#415d31}section{margin-bottom:36px}[hidden]{display:none!important}@media(max-width:700px){header,main,footer{padding:20px}.detail{padding:18px}.detail .columns{grid-template-columns:1fr}}
</style></head><body><header><div class="meta">UI8Kit / magazine / reference v0.1</div><h1>Twelve ways to assemble meaning.</h1><p>An editorial set for choosing a direction, comparing compositions and making controlled style changes. Free, no sign-in.</p><div class="counts"><div><strong>12</strong>concepts</div><div><strong>10</strong>families</div><div><strong>36</strong>variants</div><div><strong>20</strong>relations</div></div><p class="notice">Sources and keys are checked. The images below are schematics of masses. <a href="visual-review.html">Real previews and visual findings</a> are available separately. Full accessibility checks and human scenarios are not finished yet.</p></header><main><section aria-labelledby="catalog-heading"><h2 id="catalog-heading">Compare structure</h2><label>Family <select id="family"><option value="">All</option>${catalog.scope.layoutFamilies.map((f: string) => `<option>${esc(f)}</option>`).join('')}</select></label><label>Composition <select id="pattern"><option value="">All</option>${catalog.vocabulary.contentPatterns.map((p: string) => `<option>${esc(p)}</option>`).join('')}</select></label><p id="result" aria-live="polite"></p><div class="grid">${catalog.concepts.map((c: any) => `<button class="card" data-id="${esc(c.id)}" data-family="${esc(c.layoutFamily)}" data-pattern="${esc(c.composition.contentPattern)}" aria-controls="detail">${svg(c)}<h3>${esc(c.title)}</h3><span class="tag">${esc(c.layoutFamily)} · ${esc(c.composition.contentPattern)}</span><p>${esc(c.artDirection.intent)}</p><small>${esc(c.id)} / schematic, not a preview</small></button>`).join('')}</div><article class="detail" id="detail" tabindex="-1" hidden></article></section><section><h2>Five scenarios for a future benchmark</h2>${catalog.scenarios.map((s: any) => `<div class="scenario"><h3>${esc(s.id)} · ${esc(s.title)}</h3><p>${esc(s.start)}</p><p><strong>Observed outcome:</strong> ${esc(s.outcome)}</p><small>Research plan; no measurement results yet.</small></div>`).join('')}</section><section><h2>How to run a comparison</h2><ol><li>First capture real previews at 1440 × 1080 and on a mobile screen; check wrapping and actions.</li><li>For a structural comparison use one palette, one font pair and one radius. The shared copy is wired to a separate research renderer.</li><li>Change one axis at a time. Count composition rebuilds separately from token changes.</li><li>Record the choice, the participant's explanation, task success, time and backtracking. Do not count speed without choice quality as success.</li></ol><p class="notice">The entry fixture holds ten preselected styles. Opening its URL replaces the saved picks in magazine. Use a separate browser profile for research.</p><details><summary>Show the fixture route</summary><p><code>${esc(catalog.fixtures.entry.route)}</code></p></details><p><a href="README.md">Full passports and protocol</a> · <a href="../../packages/taste-data/content/reference-catalog.v0.1.json">Source JSON data</a></p></section></main><footer><small>Status: source-reviewed. Source: ${esc(catalog.sourceRevision.slice(0,12))}. The schematics express an editorial interpretation; they do not prove the uniqueness of the whole corpus.</small></footer><script type="application/json" id="catalog-data">${embedded}</script><script>
const data=JSON.parse(document.getElementById('catalog-data').textContent);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=xs=>'<ul>'+xs.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>';
const detail=document.getElementById('detail');
function show(id){const c=data.concepts.find(x=>x.id===id);if(!c)return;const links=data.relations.filter(r=>r.from===id||r.to===id);const thumbnail=document.querySelector('[data-id="'+id+'"]').querySelector('svg').outerHTML;detail.innerHTML='<div class="meta">'+escapeHtml(c.id)+' / passport</div><h2>'+escapeHtml(c.title)+'</h2><div class="columns"><div>'+thumbnail+'<p class="muted">'+escapeHtml(c.schematic.description)+'</p><code>'+escapeHtml(c.source.authoredStyle.key)+'</code></div><div><h3>Task and focal point</h3><p>'+escapeHtml(c.artDirection.task)+'</p><p>'+escapeHtml(c.artDirection.focus)+'</p><h3>Why this composition</h3><p>'+escapeHtml(c.composition.rationale)+'</p><p>'+escapeHtml(c.composition.mediaRole)+'</p><details><summary>Relation to the source markup</summary><p>'+escapeHtml(c.composition.differenceFromLegacy)+'</p></details><h3>Preserved traits</h3>'+list(c.invariants)+'<h3>What to check on a real screen</h3>'+list(c.risks)+'<h3>Controlled variants</h3>'+c.variants.map(v=>'<p><strong>'+escapeHtml(v.axis)+'</strong> — '+escapeHtml(v.expectation)+'<br><code>'+escapeHtml(v.style.key)+'</code></p>').join('')+'<h3>Template probes</h3><p>'+c.templateProbes.map(p=>escapeHtml(p.id)).join(', ')+' — planned. Carrying tokens over needs a separate composition review.</p></div></div><h3>Explainable relations</h3>'+links.map(r=>{const other=r.from===id?r.to:r.from;const target=data.concepts.find(x=>x.id===other);return '<div class="relation"><button data-related="'+escapeHtml(other)+'">'+escapeHtml(target.title)+'</button> <span class="tag">'+escapeHtml(r.type)+'</span><p>'+escapeHtml(r.reason)+'</p><small>'+escapeHtml(r.condition)+'</small></div>';}).join('');detail.hidden=false;detail.querySelectorAll('[data-related]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.related)));detail.focus();detail.scrollIntoView({behavior:'smooth',block:'start'});}
document.querySelectorAll('.card').forEach(b=>b.addEventListener('click',()=>show(b.dataset.id)));
function filter(){let count=0;const family=document.getElementById('family').value,pattern=document.getElementById('pattern').value;document.querySelectorAll('.card').forEach(b=>{b.hidden=!!((family&&b.dataset.family!==family)||(pattern&&b.dataset.pattern!==pattern));if(!b.hidden)count++;});document.getElementById('result').textContent='Showing '+count+' of 12';detail.hidden=true;}
document.getElementById('family').addEventListener('change',filter);document.getElementById('pattern').addEventListener('change',filter);filter();
</script></body></html>`;
const md = `# Magazine reference catalog v0.1\n\nA free showcase of directions built in UI8Kit. 12 concepts cover the 10 existing layout families. Each has a passport and three single-axis changes: palette, fonts, radius. 20 relations explain similarity or useful contrast.\n\n## Status and limits\n\nSources, curated exclusions, metadata and keys are checked. The visual review of 12 concepts is complete with findings; accessibility and usability reviews remain open. The required gate stays **source-reviewed** until the findings are resolved.\n\n${catalog.scope.limitations.map((s: string)=>'- '+s).join('\n')}\n\nLayout family, content composition and background motifs are separate traits. The passports keep the source composition markup and add an independent editorial interpretation. The production classifier and recommender are unchanged. The panorama's 820 style keys do not prove 820 unique concepts.\n\n## Files and commands\n\n- [Browser with schematics](index.html) — standalone HTML, open in a browser.\n- [Catalog JSON](../../packages/taste-data/content/reference-catalog.v0.1.json) — the single source of passports, relations and scenarios.\n- [JSON Schema](../../packages/taste-data/content/reference-catalog.schema.json) — the structure contract for editors.\n- [Shared copy](../../packages/taste-data/content/reference-copy.v0.1.json) — fixture for the separate research renderer; it does not change the authored deck in magazine.\n\nFrom the repository root:\n\n\`\`\`powershell\nbun packages/taste-data/scripts/reference-catalog.ts --check\nbun packages/taste-data/scripts/reference-catalog.ts --render\n\`\`\`\n\nThe first command checks semantic relations, keys, the single changed axis of each variant and the source SHA256 hashes. It is a specialized check, not a full JSON Schema validator. The second checks the catalog first, then updates this README and the browser. Edited sources need another review before the hashes are updated.\n\n## Passports\n\n${catalog.concepts.map((c: any)=>`### ${c.id} · ${c.title}\n\n- Source: [${c.source.screen}](../../${c.source.path}), deck ${c.source.nativeDeckIndex}.\n- Family: **${c.layoutFamily}**. Content composition: **${c.composition.contentPattern}**.\n- Intent: ${c.artDirection.intent}\n- Task: ${c.artDirection.task}\n- Focal point: ${c.artDirection.focus}\n\n${c.composition.rationale}\n\nMedia: ${c.composition.mediaRole}\n\nRelation to legacy: ${c.composition.differenceFromLegacy}\n\n**Invariants**\n\n${c.invariants.map((s: string)=>'- '+s).join('\n')}\n\n**Risks to check**\n\n${c.risks.map((s: string)=>'- '+s).join('\n')}\n\n**Difference from ${c.distinction.against}:** ${c.distinction.reason}\n\nAuthored key: \`${c.source.authoredStyle.key}\`.\n\n${c.variants.map((v: any)=>'- '+v.axis+': `'+v.style.key+'`. '+v.expectation).join('\n')}\n\nTemplate probes: ${c.templateProbes.map((p: any)=>p.id).join(', ')} — planned; the source screen's composition is not guaranteed when tokens are carried over.\n`).join('\n')}\n## Relations\n\nThe types have no numeric ranking and do not claim user fitness. task-counterexample helps tell visual similarity apart from a shared task.\n\n${catalog.relations.map((r: any)=>`- **${r.id}: ${r.from} ↔ ${r.to}** (${r.type}). ${r.reason} ${r.condition}`).join('\n')}\n\n## Measurement scenarios\n\n${catalog.scenarios.map((s: any)=>`### ${s.id} · ${s.title}\n\nStart: ${s.start}\n\nOutcome: ${s.outcome}\n\nFull specification:\n\n\`\`\`json\n${JSON.stringify(s,null,2)}\n\`\`\`\n`).join('\n')}\n## Real previews and research\n\n- [Comparison of 96 frames](visual-review.html).\n- [Visual findings](visual-review.md).\n- [Protocol for designers and art directors](research-protocol.md).\n- [Conditions and observations](capture-results.json).\n\nCapture and the separate renderer are already implemented. Commands: start magazine dev, then \`node packages/taste-data/scripts/reference-capture.mjs --variants\` and \`node packages/taste-data/scripts/reference-review.mjs\`. PNGs stay local in the ignored captures/.\n\n## Criteria for the next gate\n\n1. Repeat the capture after changes: desktop 1440 × 1080 and a diagnostic narrow frame 390 × 844; the latter is not a production mobile layout. Check keyboard, text contrast, long text, wrapping and clipping. Record viewport, theme, key, revision and result.\n2. Use the implemented separate renderer with a shared deck that leaves authored content unchanged. For comparisons apply the normalized styles from the JSON: modern-minimal, inter/inter, radius 8, light. Compare with the authored versions.\n3. Run a visual similarity review; merge duplicates by structure and task. A different name, color or radius does not prove a new concept.\n4. Run the human scenarios REF-B1–B5; record outcome, explanation, time, backtracking and errors. Set the timing start and completion criterion in advance; exclude hidden-tab periods. Distinguish abandonment from failure and from an unfinished session.\n5. Refine the passports based on the results, and only then connect the UX harness and grow the catalog. Do not count a successful preset copy as using it in a project.\n\n## Entry fixture\n\nExactly ten valid picks; they serve as a deterministic entry, not a taste profile. The URL from \`fixtures.entry.route\` will replace the locally saved magazine picks. Use a separate browser profile. Whether specific styles belong to the current panorama wall is not yet measured.\n\n## Reproducibility\n\nReview source: \`${catalog.sourceRevision}\`. SHA256 hashes are stored for the shared index files and for each component. The document and HTML are generated from the JSON and are not wired into the production runtime.\n`;
const output = resolve(root, 'plan/reference-catalog'); mkdirSync(output, { recursive:true });
writeFileSync(resolve(output, 'index.html'), html); writeFileSync(resolve(output, 'README.md'), md);
console.log('Rendered plan/reference-catalog/index.html and README.md');