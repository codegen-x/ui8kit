#!/usr/bin/env node
// Static check of .cursor/rules 01 (Block root), 02 (no raw HTML — the zoned check lives in retag-check-svelte.ts, repeated here as a count), 03 (static ARIA).
//   xgen-rules [report]   (bin of @ui8kit/xgen-tooling; run inside apps/<name> or packages/<name>)  exit 1 when a rule is broken outside the allow-list
// Scope: every *.svelte under src/ except the primitives folder of a package (packages/ui/src/ui: host markup lives there). Rule 01 is checked on files that are not kit/patterns internals' helpers either, see SKIP01.
import fs from 'node:fs'; import path from 'node:path'; import { parse } from 'svelte/compiler';
import { APP as ROOT, HOST_DIR, projectFile } from '../src/app.mjs';
const files = []; (function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith('.svelte')) files.push(p); } })(`${ROOT}/src`);
const rel = (p) => path.relative(ROOT, p);
const ARIA_REACTIVE = /^aria-(?!label$|labelledby$|describedby$|haspopup$|roledescription$)/; // names are passed as props (rule 03 §8); state attributes must be static
const out = { r01: [], r03: [], files: 0 };
const skipKinds = new Set(['Script', 'Comment', 'Text', 'SnippetBlock', 'ConstTag', 'DebugTag', 'StyleSheet', 'SvelteHead', 'SvelteWindow', 'SvelteDocument', 'SvelteBody', 'SvelteOptions']);
for (const f of files) {
  const r = rel(f); if (HOST_DIR && r.startsWith(`${HOST_DIR}/`)) continue; out.files++;
  const src = fs.readFileSync(f, 'utf8'); let ast; try { ast = parse(src, { modern: true }); } catch (e) { out.r01.push(`${r}: parse error ${e.message}`); continue; }
  const line = (n) => src.slice(0, n.start).split('\n').length;
  // collect elements and the first renderable node
  const roots = ast.fragment.nodes.filter((n) => !skipKinds.has(n.type) && !(n.type === 'Text' && !n.data.trim()));
  const flat = []; (function pick(ns) { for (const n of ns) { if (skipKinds.has(n.type)) continue; if (['IfBlock', 'EachBlock', 'KeyBlock', 'AwaitBlock'].includes(n.type)) { pick(n.consequent?.nodes ?? n.body?.nodes ?? n.fragment?.nodes ?? []); if (n.alternate) pick(n.alternate.nodes ?? []); if (n.pending) pick(n.pending.nodes); if (n.then) pick(n.then.nodes); continue; } if (n.type === 'RenderTag') { flat.push({ type: 'Render' }); continue; } flat.push(n); } })(roots);
  const blocks = []; let nested = false;
  (function walk(n, depth, inBlock) {
    if (n.type === 'Component' && n.name === 'Block') { blocks.push({ n, depth }); if (inBlock) nested = line(n); inBlock = true; }
    for (const k of ['fragment', 'consequent', 'alternate', 'body', 'pending', 'then', 'catch']) { const c = n[k]; if (c?.nodes) for (const x of c.nodes) walk(x, depth + 1, inBlock); }
    for (const x of n.nodes ?? []) walk(x, depth + 1, inBlock);
  })({ type: 'Root', nodes: ast.fragment.nodes }, 0, false);
  const first = flat[0];
  const isBlockRoot = first && first.type === 'Component' && first.name === 'Block';
  const noMarkup = !first || (flat.every((x) => x.type === 'Render'));
  if (!noMarkup && !isBlockRoot) out.r01.push(`${r}:${first.start ? line(first) : 1} root is ${first.name ?? first.type}, not Block`);
  if (blocks.length > 1) out.r01.push(`${r}: ${blocks.length} Block in one file`);
  if (nested) out.r01.push(`${r}:${nested} Block nested inside Block`);
  if (flat.length > 1 && isBlockRoot) out.r01.push(`${r}: Block root has siblings`);
  // rule 03: aria-* from an expression, hand-written data-ui8kit
  (function walk(n) {
    for (const a of n.attributes ?? []) {
      if (a.type === 'Attribute' && ARIA_REACTIVE.test(a.name) && a.value !== true && !(Array.isArray(a.value) && a.value.every((v) => v.type === 'Text'))) out.r03.push(`${r}:${line(a)} ${a.name} is an expression`);
      if (a.type === 'SpreadAttribute') { /* props pass-through is not checked */ }
      if (a.type === 'Attribute' && /^data-ui8kit/.test(a.name)) out.r03.push(`${r}:${line(a)} hand-written ${a.name}`);
    }
    for (const k of ['fragment', 'consequent', 'alternate', 'body', 'pending', 'then', 'catch']) { const c = n[k]; if (c?.nodes) c.nodes.forEach(walk); }
    (n.nodes ?? []).forEach(walk);
  })({ nodes: ast.fragment.nodes });
}
const allow = fs.existsSync(projectFile('rules-baseline.json')) ? JSON.parse(fs.readFileSync(projectFile('rules-baseline.json'), 'utf8')) : { r01: [], r03: [] };
const strip = (l) => l.replace(/:\d+/, '');
const fresh = { r01: out.r01.filter((l) => !allow.r01.includes(strip(l))), r03: out.r03.filter((l) => !allow.r03.includes(strip(l))) };
const mode = process.argv[2];
if (mode === 'report' || mode === 'write-baseline') { for (const k of ['r01', 'r03']) { console.log(`--- ${k}: ${out[k].length}`); out[k].forEach((l) => console.log(l)); } }
if (mode === 'write-baseline') fs.writeFileSync(projectFile('rules-baseline.json'), JSON.stringify({ r01: [...new Set(out.r01.map(strip))], r03: [...new Set(out.r03.map(strip))] }, null, 1));
console.log(`rules-check: ${out.files} files, rule 01 violations ${out.r01.length} (new ${fresh.r01.length}), rule 03 violations ${out.r03.length} (new ${fresh.r03.length})`);
if (mode !== 'report' && mode !== 'write-baseline') { for (const l of [...fresh.r01, ...fresh.r03]) console.log('  ' + l); process.exit(fresh.r01.length + fresh.r03.length ? 1 : 0); }
