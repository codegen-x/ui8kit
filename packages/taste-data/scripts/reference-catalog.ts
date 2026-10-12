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
const hash = (path: string) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
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
const svg = (c: any) => `<svg viewBox="0 0 320 240" role="img" aria-label="${esc(c.title)}: условная схема масс"><rect width="320" height="240" fill="#faf9f6"/>${c.schematic.elements.map(([x,y,w,h,k]: any[]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${k === 'title' || k === 'action' ? '#282824' : k === 'media' ? '#a2a59b' : '#d3d5cc'}"/>`).join('')}</svg>`;
const embedded = JSON.stringify(catalog).replace(/</g, '\\u003c');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Magazine — эталонный каталог v0.1</title><style>
*{box-sizing:border-box}body{margin:0;background:#f7f6f2;color:#252722;font:16px/1.55 system-ui,sans-serif}header,main,footer{max-width:1320px;margin:auto;padding:32px}header{padding-top:54px}h1{font-size:clamp(32px,5vw,64px);line-height:1.05;max-width:900px;letter-spacing:-.04em}h2{font-size:27px}h3{margin:12px 0 5px}p{max-width:900px}small,.muted{color:#62675d}.meta{letter-spacing:.12em;font-size:12px;text-transform:uppercase}.counts{display:flex;gap:30px;flex-wrap:wrap;margin:30px 0}.counts strong{font-size:32px;display:block}label{display:inline-block;margin:0 22px 16px 0}select,button{font:inherit;padding:10px;border:1px solid #b4b9aa;border-radius:5px;background:#fff;color:inherit}button{cursor:pointer}button:hover{border-color:#252722}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #54634a;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}.card{text-align:left;padding:12px;background:#fff;display:block;width:100%}.card svg{width:100%;display:block;border:1px solid #e0e2da}.card p{font-size:14px;margin:6px 0}.tag{font-size:12px;color:#58624c}.notice{border-left:3px solid #68765a;padding:10px 18px;background:#eeefe8}.detail{margin-top:36px;padding:28px;background:white;border:1px solid #d0d4c7;scroll-margin-top:20px}.detail .columns{display:grid;grid-template-columns:minmax(230px,1fr) 2fr;gap:28px}.detail svg{width:100%;max-width:420px}li{margin-bottom:8px}code{overflow-wrap:anywhere;font-size:12px}.relation{padding:14px 0;border-top:1px solid #e1e3da}.scenario{padding:18px 0;border-top:1px solid #cdd2c3}a{color:#415d31}section{margin-bottom:36px}[hidden]{display:none!important}@media(max-width:700px){header,main,footer{padding:20px}.detail{padding:18px}.detail .columns{grid-template-columns:1fr}}
</style></head><body><header><div class="meta">UI8Kit / magazine / reference v0.1</div><h1>Двенадцать способов собрать смысл.</h1><p>Редакционный набор для выбора направления, сравнения композиций и контролируемых изменений стиля. Бесплатно, без авторизации.</p><div class="counts"><div><strong>12</strong>концептов</div><div><strong>10</strong>семейств</div><div><strong>36</strong>вариантов</div><div><strong>20</strong>связей</div></div><p class="notice">Проверены исходники и ключи. Изображения ниже — условные схемы масс. <a href="visual-review.html">Реальные превью и визуальные замечания</a> доступны отдельно. Полная проверка доступности и человеческие сценарии ещё не завершены.</p></header><main><section aria-labelledby="catalog-heading"><h2 id="catalog-heading">Сравнить структуру</h2><label>Семейство <select id="family"><option value="">Все</option>${catalog.scope.layoutFamilies.map((f: string) => `<option>${esc(f)}</option>`).join('')}</select></label><label>Композиция <select id="pattern"><option value="">Все</option>${catalog.vocabulary.contentPatterns.map((p: string) => `<option>${esc(p)}</option>`).join('')}</select></label><p id="result" aria-live="polite"></p><div class="grid">${catalog.concepts.map((c: any) => `<button class="card" data-id="${esc(c.id)}" data-family="${esc(c.layoutFamily)}" data-pattern="${esc(c.composition.contentPattern)}" aria-controls="detail">${svg(c)}<h3>${esc(c.title)}</h3><span class="tag">${esc(c.layoutFamily)} · ${esc(c.composition.contentPattern)}</span><p>${esc(c.artDirection.intent)}</p><small>${esc(c.id)} / схема, не превью</small></button>`).join('')}</div><article class="detail" id="detail" tabindex="-1" hidden></article></section><section><h2>Пять сценариев для будущего benchmark</h2>${catalog.scenarios.map((s: any) => `<div class="scenario"><h3>${esc(s.id)} · ${esc(s.title)}</h3><p>${esc(s.start)}</p><p><strong>Наблюдаемый исход:</strong> ${esc(s.outcome)}</p><small>План исследования; результатов измерений пока нет.</small></div>`).join('')}</section><section><h2>Как проводить сравнение</h2><ol><li>Сначала снять реальные превью при 1440 × 1080 и на мобильном экране, проверить переносы и действия.</li><li>Для структурного сравнения использовать одну палитру, пару шрифтов и радиус. Общий текст подключён к отдельному исследовательскому renderer.</li><li>Менять одну ось за раз. Перестройку композиции учитывать отдельно от смены токенов.</li><li>Фиксировать выбор, объяснение участника, успех задачи, время и возвраты. Скорость без качества выбора не считать успехом.</li></ol><p class="notice">Входная фикстура содержит десять заранее выбранных стилей. Открытие её URL заменяет сохранённые picks в magazine. Для исследований используйте отдельный браузерный профиль.</p><details><summary>Показать маршрут фикстуры</summary><p><code>${esc(catalog.fixtures.entry.route)}</code></p></details><p><a href="README.md">Полные паспорта и протокол</a> · <a href="../../packages/taste-data/content/reference-catalog.v0.1.json">Исходные данные JSON</a></p></section></main><footer><small>Статус: source-reviewed. Источник: ${esc(catalog.sourceRevision.slice(0,12))}. Схемы выражают редакционную интерпретацию; это не доказательство уникальности всего корпуса.</small></footer><script type="application/json" id="catalog-data">${embedded}</script><script>
const data=JSON.parse(document.getElementById('catalog-data').textContent);
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=xs=>'<ul>'+xs.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>';
const detail=document.getElementById('detail');
function show(id){const c=data.concepts.find(x=>x.id===id);if(!c)return;const links=data.relations.filter(r=>r.from===id||r.to===id);const thumbnail=document.querySelector('[data-id="'+id+'"]').querySelector('svg').outerHTML;detail.innerHTML='<div class="meta">'+escapeHtml(c.id)+' / паспорт</div><h2>'+escapeHtml(c.title)+'</h2><div class="columns"><div>'+thumbnail+'<p class="muted">'+escapeHtml(c.schematic.description)+'</p><code>'+escapeHtml(c.source.authoredStyle.key)+'</code></div><div><h3>Задача и доминанта</h3><p>'+escapeHtml(c.artDirection.task)+'</p><p>'+escapeHtml(c.artDirection.focus)+'</p><h3>Почему такая композиция</h3><p>'+escapeHtml(c.composition.rationale)+'</p><p>'+escapeHtml(c.composition.mediaRole)+'</p><details><summary>Соотношение с исходной разметкой</summary><p>'+escapeHtml(c.composition.differenceFromLegacy)+'</p></details><h3>Сохраняемые признаки</h3>'+list(c.invariants)+'<h3>Что проверить на реальном экране</h3>'+list(c.risks)+'<h3>Контролируемые варианты</h3>'+c.variants.map(v=>'<p><strong>'+escapeHtml(v.axis)+'</strong> — '+escapeHtml(v.expectation)+'<br><code>'+escapeHtml(v.style.key)+'</code></p>').join('')+'<h3>Пробы шаблонов</h3><p>'+c.templateProbes.map(p=>escapeHtml(p.id)).join(', ')+' — запланированы. Перенос токенов требует отдельной оценки композиции.</p></div></div><h3>Объяснимые связи</h3>'+links.map(r=>{const other=r.from===id?r.to:r.from;const target=data.concepts.find(x=>x.id===other);return '<div class="relation"><button data-related="'+escapeHtml(other)+'">'+escapeHtml(target.title)+'</button> <span class="tag">'+escapeHtml(r.type)+'</span><p>'+escapeHtml(r.reason)+'</p><small>'+escapeHtml(r.condition)+'</small></div>';}).join('');detail.hidden=false;detail.querySelectorAll('[data-related]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.related)));detail.focus();detail.scrollIntoView({behavior:'smooth',block:'start'});}
document.querySelectorAll('.card').forEach(b=>b.addEventListener('click',()=>show(b.dataset.id)));
function filter(){let count=0;const family=document.getElementById('family').value,pattern=document.getElementById('pattern').value;document.querySelectorAll('.card').forEach(b=>{b.hidden=!!((family&&b.dataset.family!==family)||(pattern&&b.dataset.pattern!==pattern));if(!b.hidden)count++;});document.getElementById('result').textContent='Показано: '+count+' из 12';detail.hidden=true;}
document.getElementById('family').addEventListener('change',filter);document.getElementById('pattern').addEventListener('change',filter);filter();
</script></body></html>`;
const md = `# Эталонный каталог magazine v0.1\n\nБесплатная витрина направлений, созданных в UI8Kit. 12 концептов покрывают 10 существующих семейств раскладки. Каждому соответствуют паспорт и три изменения по одной оси: палитра, шрифты, радиус. 20 связей объясняют сходство или полезный контраст.\n\n## Статус и границы\n\nПроверены исходники, кураторские исключения, метаданные и ключи. Визуальный review 12 концептов завершён с замечаниями; accessibility и usability review остаются открытыми. Обязательный gate остаётся **source-reviewed** до устранения замечаний.\n\n${catalog.scope.limitations.map((s: string)=>'- '+s).join('\n')}\n\nСемейство раскладки, композиция контента и фоновые мотивы — отдельные признаки. В паспортах сохранена исходная композиционная разметка и дана независимая редакционная интерпретация. Production классификатор и рекомендатель не изменены. 820 ключей стиля панорамы не доказывают наличие 820 уникальных концептов.\n\n## Файлы и команды\n\n- [Обозреватель с условными схемами](index.html) — автономный HTML, открыть в браузере.\n- [Каталог JSON](../../packages/taste-data/content/reference-catalog.v0.1.json) — единый источник паспортов, связей и сценариев.\n- [JSON Schema](../../packages/taste-data/content/reference-catalog.schema.json) — контракт структуры для редакторов.\n- [Общий текст](../../packages/taste-data/content/reference-copy.v0.1.json) — фикстура отдельного исследовательского renderer; не изменяет authored deck в magazine.\n\nИз корня репозитория:\n\n\`\`\`powershell\nbun packages/taste-data/scripts/reference-catalog.ts --check\nbun packages/taste-data/scripts/reference-catalog.ts --render\n\`\`\`\n\nПервая команда проверяет семантические связи, ключи, одну изменённую ось каждого варианта и SHA256 источников. Это специализированная проверка, не полный JSON Schema validator. Вторая сначала проверяет каталог, затем обновляет этот README и обозреватель. Отредактированные исходники требуют повторного review перед обновлением хешей.\n\n## Паспорта\n\n${catalog.concepts.map((c: any)=>`### ${c.id} · ${c.title}\n\n- Источник: [${c.source.screen}](../../${c.source.path}), deck ${c.source.nativeDeckIndex}.\n- Семейство: **${c.layoutFamily}**. Композиция контента: **${c.composition.contentPattern}**.\n- Замысел: ${c.artDirection.intent}\n- Задача: ${c.artDirection.task}\n- Доминанта: ${c.artDirection.focus}\n\n${c.composition.rationale}\n\nМедиа: ${c.composition.mediaRole}\n\nСвязь с legacy: ${c.composition.differenceFromLegacy}\n\n**Инварианты**\n\n${c.invariants.map((s: string)=>'- '+s).join('\n')}\n\n**Риски для проверки**\n\n${c.risks.map((s: string)=>'- '+s).join('\n')}\n\n**Отличие от ${c.distinction.against}:** ${c.distinction.reason}\n\nАвторский ключ: \`${c.source.authoredStyle.key}\`.\n\n${c.variants.map((v: any)=>'- '+v.axis+': `'+v.style.key+'`. '+v.expectation).join('\n')}\n\nПробы шаблонов: ${c.templateProbes.map((p: any)=>p.id).join(', ')} — planned; композиция исходного screen при переносе токенов не гарантируется.\n`).join('\n')}\n## Связи\n\nТипы не имеют численного ranking и не утверждают пользовательскую пригодность. task-counterexample помогает отличать сходство оформления от совпадения задачи.\n\n${catalog.relations.map((r: any)=>`- **${r.id}: ${r.from} ↔ ${r.to}** (${r.type}). ${r.reason} ${r.condition}`).join('\n')}\n\n## Сценарии измерений\n\n${catalog.scenarios.map((s: any)=>`### ${s.id} · ${s.title}\n\nСтарт: ${s.start}\n\nИсход: ${s.outcome}\n\nПолная спецификация:\n\n\`\`\`json\n${JSON.stringify(s,null,2)}\n\`\`\`\n`).join('\n')}\n## Реальные превью и исследования\n\n- [Сравнение 96 кадров](visual-review.html).\n- [Визуальные выводы](visual-review.md).\n- [Протокол для дизайнеров и арт-директоров](research-protocol.md).\n- [Условия и наблюдения](capture-results.json).\n\nСъёмка и отдельный renderer уже реализованы. Команды: запустить magazine dev, затем \`node packages/taste-data/scripts/reference-capture.mjs --variants\` и \`node packages/taste-data/scripts/reference-review.mjs\`. PNG остаются локальными в ignored captures/.\n\n## Критерии следующего gate\n\n1. Повторять съёмку после изменений: desktop 1440 × 1080 и диагностический узкий кадр 390 × 844; последний не является production mobile layout. Проверить клавиатуру, текстовый контраст, длинный текст, переносы и clipping. Записать viewport, тему, ключ, revision и результат.\n2. Использовать реализованный отдельный renderer с общим deck, не меняющий авторский контент. Для сравнений применить normalized styles из JSON: modern-minimal, inter/inter, radius 8, light. Сравнить с авторскими версиями.\n3. Провести визуальный review сходства; объединить дубли по структуре и задаче. Различие названия, цвета или радиуса не доказывает новый концепт.\n4. Провести человеческие сценарии REF-B1–B5; фиксировать outcome, объяснение, время, возвраты и ошибки. Задавать время отсчёта и критерий завершения заранее; периоды скрытой вкладки исключать. Отделять отказ от неуспеха и незавершённой сессии.\n5. По результатам уточнить паспорта и только затем подключать UX harness и расширять каталог. Успешное копирование preset не считать его применением в проекте.\n\n## Входная фикстура\n\nРовно десять валидных picks; служат детерминированным входом, не профилем вкуса. URL из \`fixtures.entry.route\` заменит локально сохранённые picks magazine. Использовать отдельный браузерный профиль. Принадлежность конкретных стилей текущей стене панорамы пока не измерена.\n\n## Воспроизводимость\n\nИсточник review: \`${catalog.sourceRevision}\`. Для общих индексных файлов и каждого компонента сохранены SHA256. Документ и HTML генерируются из JSON и не подключены к production runtime.\n`;
const output = resolve(root, 'plan/reference-catalog'); mkdirSync(output, { recursive:true });
writeFileSync(resolve(output, 'index.html'), html); writeFileSync(resolve(output, 'README.md'), md);
console.log('Rendered plan/reference-catalog/index.html and README.md');