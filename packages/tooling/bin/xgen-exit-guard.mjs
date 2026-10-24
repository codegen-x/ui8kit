#!/usr/bin/env node
// xgen exit (docs/ui8kit3-xgen-exit.md): xgen/, the vendor/codegen submodule (archived xgen) and the xgen brick packages
// (packages/<runtime>/ui, @ui8kit/<runtime>-ui) are gone. Nothing in apps/ or packages/ may import or build a path into them
// again: no import or require of xgen/... or @ui8kit/xgen-* or @ui8kit/<runtime>-ui, no path into xgen/ or vendor/codegen.
// Text that only names xgen (history in a comment) is fine.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ROOTS = ["apps", "packages", "package.json", ".github"];
const SKIP = new Set(["node_modules", "vendor", ".venv", "__pycache__", ".git", "dist"]);
const SELF = path.relative(repo, fileURLToPath(import.meta.url));
const EXT = /\.(ts|tsx|mts|js|mjs|cjs|svelte|vue|py|php|go|templ|j2|twig|latte|json|css|ya?ml)$/;
const RUNTIMES = "svelte|react|vue|solid|templ|twig|jinja2|latte";
const RULES = [
  [/(?:from|import)\s*\(?\s*["'][^"']*(?:^|\/|["'])xgen\//, "import from xgen/"],
  [/["']@ui8kit\/xgen-(?!tooling)[-\w]*["'/]/, "import of an @ui8kit/xgen-* package"],
  [new RegExp(`["']@ui8kit\\/(?:${RUNTIMES})-ui["'/]`), "import of a removed xgen brick package (@ui8kit/<runtime>-ui)"],
  [/require\(\s*["'][^"']*\bxgen\//, "require of xgen/"],
  [/(?:join|resolve)\([^)]*["']xgen["']/, "path into the xgen folder"],
  [/["'`](?:[^"'`\n]*\/)?xgen\/(?:schema|spec|screens|generator|check|cli|runtimes|specs|skins|fonts|content|fixtures)\b/, "path into xgen/"],
  [/vendor\/codegen\b/, "path into the removed vendor/codegen submodule"],
  [new RegExp(`packages\\/(?:${RUNTIMES})\\/ui\\b`), "path into a removed packages/<runtime>/ui"],
];
const bad = [];
function scan(p) {
  const lines = fs.readFileSync(p, "utf8").split("\n");
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") || t.startsWith("#")) return;
    for (const [re, what] of RULES) if (re.test(l)) bad.push(`${path.relative(repo, p)}:${i + 1}: ${what}: ${t.slice(0, 140)}`);
  });
}
function walk(p) {
  const st = fs.statSync(p, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isFile()) { if (EXT.test(p) && path.relative(repo, p) !== SELF) scan(p); return; }
  for (const e of fs.readdirSync(p, { withFileTypes: true })) if (!SKIP.has(e.name)) walk(path.join(p, e.name));
}
for (const r of ROOTS) walk(path.join(repo, r));
const left = ["xgen", "vendor/codegen", ...RUNTIMES.split("|").map((r) => `packages/${r}/ui`)].filter((d) => fs.existsSync(path.join(repo, d)));
if (left.length) bad.push(`removed folders are back: ${left.join(", ")}`);

if (bad.length) {
  console.error(`xgen-exit-guard: ${bad.length} references into removed xgen code:\n${bad.join("\n")}`);
  process.exit(1);
}
console.log(`xgen-exit-guard: ok (${ROOTS.join(", ")}: no import or path into xgen/, vendor/codegen or packages/<runtime>/ui)`);
