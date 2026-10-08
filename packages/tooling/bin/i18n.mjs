#!/usr/bin/env node
// Rule 06 gate: no Cyrillic in code, no free-form visible text in templates.
//   xgen-i18n      (bin of @ui8kit/xgen-tooling; run inside apps/<name> or packages/<name>)  exit 1 on any violation (file:line:col  rule  message)
//   xgen-i18n --self-test   checks the detectors on in-memory samples
// Rules:
//   cyrillic  any Cyrillic letter in src/**, bin/**, scripts/**, index.html (code, comments, strings); so the tooling package itself is checked too. No exceptions except .project/<apps|packages>/<name>/i18n-allow.json.
//   text      visible text that is not data: text nodes, text attributes (label, title, placeholder, alt, aria-label, ...),
//             string literals in text positions of a template, `label: "..."`-style properties and prose strings in scripts.
// Allowed: class/style/id/href/type/role/name/for/value, data-*, icon names, routes, numbers, symbols without letters,
//          dev diagnostics (throw/console), anything that comes from a prop, a fixture or the `t()` helper.
// Exceptions: .project/<apps|packages>/<name>/i18n-allow.json, one entry per path (file or folder prefix) with rules and a reason. Unused entries fail.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "svelte/compiler";
import ts from "typescript";

import { APP as ROOT, KIND, projectFile } from "../src/app.mjs";
// An app or a package: src, bin (tooling), its own scripts and index.html.
const CYR_ROOTS = ["src", "bin", "scripts", "index.html"];
const TEXT_ROOTS = ["src"];
const CYR = /[\u0400-\u052F\u1C80-\u1C8F\u2DE0-\u2DFF\uA640-\uA69F]/u;
const LETTER = /\p{L}/u;
// attributes / props / object keys that carry visible or announced text
const TEXT_NAMES = new Set(["label", "title", "text", "description", "placeholder", "hint", "caption", "heading", "subtitle", "message", "summary", "tooltip", "alt", "note", "lead", "meta", "legend", "eyebrow", "aria-label", "aria-description", "aria-placeholder", "aria-roledescription", "aria-valuetext"]);
// "Capital word + more words": prose, not an identifier, a class list or a route
const PROSE = /^\p{Lu}[\p{L}'’-]*(\s+[\p{L}\d'’.,:;!?()%&/-]+)+$/u;

const lineAt = (src, pos) => { let l = 1, c = 1; for (let i = 0; i < pos && i < src.length; i++) { if (src[i] === "\n") { l++; c = 1; } else c++; } return [l, c]; };

/** @returns {{line:number,col:number,rule:string,msg:string}[]} */
export function scanCyrillic(src) {
  const out = []; const lines = src.split("\n");
  lines.forEach((ln, i) => { const m = CYR.exec(ln); if (m) out.push({ line: i + 1, col: m.index + 1, rule: "cyrillic", msg: `Cyrillic text: ${ln.trim().slice(0, 70)}` }); });
  return out;
}

function tsStrings(code, baseOffset, src, out) {
  const sf = ts.createSourceFile("x.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const push = (node, msg, text) => { const [line, col] = lineAt(src, baseOffset + node.getStart(sf)); out.push({ line, col, rule: "text", msg: `${msg}: ${JSON.stringify(text.slice(0, 60))}` }); };
  const insideDiag = (n) => { for (let p = n.parent; p; p = p.parent) { if (ts.isThrowStatement(p)) return true; if (ts.isCallExpression(p) && p.expression.kind === ts.SyntaxKind.SuperKeyword) return true; if (ts.isNewExpression(p) && /Error$/.test(p.expression.getText(sf))) return true; if (ts.isCallExpression(p) && /^(console|assert)\b/.test(p.expression.getText(sf))) return true; if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isTypeNode(p)) return true; } return false; };
  const inKeyArg = (n) => { for (let c = n, p = n.parent; p; c = p, p = p.parent) if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && KEY_FN.test(p.expression.text) && p.arguments[0] === c) return true; return false; };
  const keyUse = (n) => { const p = n.parent; if (!p) return false; if (inKeyArg(n)) return true; if (typeof n.text === 'string' && KEY_SHAPE.test(n.text)) return true; if (ts.isCallExpression(p) && p.arguments.includes(n) && typeof n.text === 'string' && TOKEN_SHAPE.test(n.text)) return true; if (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind)) return true; if (ts.isElementAccessExpression(p) || ts.isCaseClause(p)) return true; return false; };
  const keyName = (p) => ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : "";
  (function visit(n) {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !insideDiag(n) && !keyUse(n)) {
      const text = n.text; const p = n.parent;
      if (LETTER.test(text)) {
        if (p && ts.isPropertyAssignment(p) && p.initializer === n && TEXT_NAMES.has(keyName(p))) push(n, `text in property "${keyName(p)}"`, text);
        else if (PROSE.test(text.trim())) push(n, "prose string", text);
      }
    } else if (ts.isTemplateExpression(n) && !insideDiag(n) && !inKeyArg(n)) {
      const parts = [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].join("");
      const p = n.parent;
      if (LETTER.test(parts) && ((p && ts.isPropertyAssignment(p) && TEXT_NAMES.has(keyName(p))) || PROSE.test(parts.replace(/\s+/g, " ").trim()))) push(n, "text in template literal", parts);
    }
    ts.forEachChild(n, visit);
  })(sf);
}

// a dotted lowerCamel path is a fixture key ("content.page.title", "theme.light"), not text; the UiKey type checks that it exists
const KEY_SHAPE = /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+\.?$/;
// one lowercase token ("pending", "grid") is a technical key when it is an argument of a call or a comparison operand
const TOKEN_SHAPE = /^[a-z][a-z0-9_-]*$/;
const KEY_FN = /^(t|tp|fmt)$/;
const CMP = new Set(["==", "===", "!=", "!=="]);
/** a string that is a key, not text: t("a.b"), x === "list", obj["key"], case "x": */
function isKeyUse(parent, node) {
  if (!parent) return false;
  if (typeof node.value === "string" && KEY_SHAPE.test(node.value)) return true;
  if (parent.type === "CallExpression" && parent.arguments?.includes(node) && typeof node.value === "string" && TOKEN_SHAPE.test(node.value)) return true;
  if (parent.type === "CallExpression" && parent.callee?.type === "Identifier" && /^(t|tp|fmt)$/.test(parent.callee.name) && parent.arguments[0] === node) return true;
  if (parent.type === "BinaryExpression" && CMP.has(parent.operator)) return true;
  if (parent.type === "MemberExpression" && parent.computed && parent.property === node) return true;
  if (parent.type === "SwitchCase" || (parent.type === "Property" && parent.key === node)) return true;
  return false;
}
function exprStrings(node, push, label) {
  // string literals inside a template expression (estree)
  (function walk(n, parent) {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach((x) => walk(x, parent));
    if (n.type === "CallExpression" && n.callee?.type === "Identifier" && KEY_FN.test(n.callee.name)) { walk(n.arguments.slice(1), n); return; } // the key argument of t() is not text
    if (n.type === "Literal" && typeof n.value === "string" && LETTER.test(n.value) && !isKeyUse(parent, n)) push(n, `${label}: ${JSON.stringify(n.value.slice(0, 60))}`);
    else if (n.type === "TemplateElement" && LETTER.test(n.value.cooked ?? "")) push(n, `${label}: ${JSON.stringify((n.value.cooked ?? "").slice(0, 60))}`);
    for (const k of Object.keys(n)) if (k !== "type" && k !== "start" && k !== "end" && k !== "loc") walk(n[k], n);
  })(node, null);
}

/** @returns {{line:number,col:number,rule:string,msg:string}[]} */
export function scanSvelteText(src) {
  const out = [];
  let ast; try { ast = parse(src, { modern: true }); } catch (e) { return [{ line: 1, col: 1, rule: "text", msg: `parse error: ${e.message}` }]; }
  const push = (n, msg) => { const [line, col] = lineAt(src, n.start ?? 0); out.push({ line, col, rule: "text", msg }); };
  for (const s of [ast.instance, ast.module]) if (s) tsStrings(src.slice(s.content.start, s.content.end), s.content.start, src, out);
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.type === "Text" && LETTER.test(n.data)) push(n, `visible text: ${JSON.stringify(n.data.trim().slice(0, 60))}`);
    else if (n.type === "ExpressionTag") exprStrings(n.expression, push, "string literal in {expression}");
    else if (n.type === "Attribute") {
      const name = n.name; const v = n.value;
      const parts = v === true ? [] : Array.isArray(v) ? v : [v];
      for (const p of parts) {
        if (p.type === "Text" && LETTER.test(p.data)) {
          if (TEXT_NAMES.has(name)) push(p, `text attribute ${name}="${p.data.trim().slice(0, 50)}"`);
          else if (!/^(class|style|id|href|src|type|role|name|for|value|d|viewBox|fill|stroke|tag|variant|size|shape|layout|gap|align|justify|autocomplete|inputmode|accept|target|rel|method|action|key|icon|lucide|slot|loading|decoding|fetchpriority|enterkeyhint|dir|lang|tabindex|pattern|min|max|step|width|height|as|kind|tone|side|mode)$/.test(name) && !name.startsWith("data-") && !name.startsWith("aria-") && PROSE.test(p.data.trim())) push(p, `prose in attribute ${name}="${p.data.trim().slice(0, 50)}"`);
        } else if (p.type === "ExpressionTag" && TEXT_NAMES.has(name)) exprStrings(p.expression, push, `string literal in ${name}={…}`);
      }
      return; // do not descend into attribute values
    } else if (n.type === "SpreadAttribute" || n.type === "ClassDirective" || n.type === "StyleDirective") return;
    for (const k of Object.keys(n)) if (!["type", "start", "end", "loc", "metadata", "parent"].includes(k)) walk(n[k]);
  })(ast.fragment);
  return out;
}

export function scanTsText(src) { const out = []; tsStrings(src, 0, src, out); return out; }

function readAllow() {
  const p = projectFile("i18n-allow.json");
  if (!fs.existsSync(p)) return [];
  const list = JSON.parse(fs.readFileSync(p, "utf8")).allow ?? [];
  for (const e of list) if (!e.path || !Array.isArray(e.rules) || !e.reason?.trim()) throw new Error(`i18n-allow.json: every entry needs path, rules[] and a non-empty reason (${JSON.stringify(e)})`);
  return list;
}

function* walkFiles(p) {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isFile()) { yield p; return; }
  for (const d of fs.readdirSync(abs, { withFileTypes: true })) {
    if (d.name === "node_modules" || d.name.startsWith(".")) continue;
    const rp = path.join(p, d.name);
    if (d.isDirectory()) yield* walkFiles(rp); else if (/\.(svelte|ts|js|mjs|css|html|json|md|txt)$/.test(d.name)) yield rp;
  }
}

function selfTest() {
  const must = (name, got, n) => { const ok = got.length === n; console.log(`${ok ? "PASS" : "FAIL"} ${name} (${got.length}/${n})`); if (!ok) { console.log(got); process.exitCode = 1; } };
  must("cyrillic", scanCyrillic("const a = 1;\n// \u043f\u0440\u0438\u0432\u0435\u0442\n"), 1);
  must("text node", scanSvelteText(`<script lang="ts"></script>\n<Block>Hello world</Block>`), 1);
  must("symbols only", scanSvelteText(`<Block>/ · — 12 …</Block>`), 0);
  must("text attribute", scanSvelteText(`<Button label="Save" aria-label="Close" />`), 2);
  must("class and data", scanSvelteText(`<Box class="flex gap-2 Hello world" data-name="Some Name" variant="outline" />`), 0);
  must("literal in {expr}", scanSvelteText(`<Block>{ok ? "Yes" : "No"}</Block>`), 2);
  must("t() is fine", scanSvelteText(`<script lang="ts">import { t } from "x";</script>\n<Block aria-label={t("a.b")}>{t("c")}</Block>`), 0);
  must("label literal in attr expr", scanSvelteText(`<Block label={on ? "Open menu" : t("x")} />`), 1);
  must("script property", scanTsText(`const a = { label: "Dashboard", icon: "home", href: "#/dashboard" };`), 1);
  must("script prose", scanTsText(`const m = "Page not found"; const k = "flex gap-2"; const r = "#/pages";`), 1);
  must("diagnostics allowed", scanTsText(`throw new Error("Unknown kind in the snapshot"); console.warn("Something went wrong here");`), 0);
  must("t() with ternary / template key", scanSvelteText(`<script lang="ts"></script>\n<Block>{t(on ? "a.on" : "a.off")}{t(\`role.\${r}\` as K)}</Block>`), 0);
  must("key-shaped strings", scanSvelteText(`<Block>{t(x, { n: count("pending") })}</Block>`) .concat(scanTsText(`const m = [{ label: "theme.light" }];`)), 0);
  must("ternary words are text", scanSvelteText(`<Block>{on ? "yes" : "no"}</Block>`), 2);
  must("class extends Error", scanTsText(`class E extends Error { constructor() { super(\`Invalid content snapshot: \${1}\`); } }`), 0);
  must("svelte script", scanSvelteText(`<script lang="ts">const items = [{ label: "Pages" }];</script>\n<Block />`), 1);
}

if (process.argv.includes("--self-test")) { selfTest(); process.exit(process.exitCode ?? 0); }

// run as a program (also through the symlink of node_modules/.bin), not when imported
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const allow = readAllow(); const used = new Set();
  const allowed = (file, rule) => { for (const e of allow) if ((file === e.path || file.startsWith(e.path.replace(/\/?$/, "/"))) && e.rules.includes(rule)) { used.add(e); return true; } return false; };
  const bad = []; const counts = { cyrillic: 0, text: 0 }; let files = 0;
  const seen = new Set();
  for (const root of [...CYR_ROOTS, ...TEXT_ROOTS]) for (const f of walkFiles(root)) {
    if (seen.has(f)) continue; seen.add(f); files++;
    const src = fs.readFileSync(path.join(ROOT, f), "utf8"); const hits = [];
    if (CYR_ROOTS.some((r) => f === r || f.startsWith(r + "/"))) hits.push(...scanCyrillic(src));
    if (TEXT_ROOTS.some((r) => f.startsWith(r + "/"))) {
      if (f.endsWith(".svelte")) hits.push(...scanSvelteText(src));
      else if (f.endsWith(".ts") && !f.endsWith(".d.ts")) hits.push(...scanTsText(src));
    }
    for (const h of hits) { if (allowed(f, h.rule)) continue; counts[h.rule]++; bad.push(`${f}:${h.line}:${h.col}  ${h.rule}  ${h.msg}`); }
  }
  const stale = allow.filter((e) => !used.has(e));
  for (const l of bad) console.log(l);
  for (const e of stale) console.log(`.project/${KIND}/<name>/i18n-allow.json  stale entry (nothing to allow): ${e.path} [${e.rules}]`);
  console.log(`i18n-check: ${files} files, cyrillic ${counts.cyrillic}, text ${counts.text}, allow entries ${allow.length} (stale ${stale.length})`);
  process.exit(bad.length || stale.length ? 1 : 0);
}
