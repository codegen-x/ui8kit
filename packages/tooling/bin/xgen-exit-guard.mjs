#!/usr/bin/env node
// xgen exit (docs/ui8kit3-xgen-exit.md, step 4): nothing in packages/kit-compose or packages/compose-gen may read code or data
// from xgen/ — no import or require of xgen/... or @ui8kit/xgen-*, no path built into the xgen folder. Text that only names
// xgen (history in a comment) is fine. While xgen/ still exists, the styles it generates (skins build) must equal the
// compose-gen copy, so the copy cannot drift before the deletion step.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ROOTS = ["packages/kit-compose", "packages/compose-gen"];
const SKIP = new Set(["node_modules", "vendor", ".venv", "__pycache__", ".git"]);
const EXT = /\.(ts|tsx|mts|js|mjs|cjs|svelte|vue|py|php|go|templ|j2|twig|latte|json)$/;
const RULES = [
  [/(?:from|import)\s*\(?\s*["'][^"']*(?:^|\/|["'])xgen\//, "import from xgen/"],
  [/["']@ui8kit\/xgen[-\w]*["'/]/, "import of an @ui8kit/xgen-* package"],
  [/require\(\s*["'][^"']*\bxgen\//, "require of xgen/"],
  [/(?:join|resolve)\([^)]*["']xgen["']/, "path into the xgen folder"],
  [/["'`][^"'`\n]*\.\.\/xgen\//, "relative path into xgen/"],
];
const bad = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) {
      const lines = fs.readFileSync(p, "utf8").split("\n");
      lines.forEach((l, i) => { for (const [re, what] of RULES) if (re.test(l)) bad.push(`${path.relative(repo, p)}:${i + 1}: ${what}: ${l.trim().slice(0, 140)}`); });
    }
  }
}
for (const r of ROOTS) walk(path.join(repo, r));

const drift = [];
const mirror = (a, b) => {
  if (!fs.existsSync(path.join(repo, a))) return;
  const list = (d, rel = "") => fs.readdirSync(path.join(repo, d, rel), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? list(d, path.join(rel, e.name)) : [path.join(rel, e.name)]));
  const A = new Set(list(a)), B = new Set(list(b));
  for (const f of new Set([...A, ...B])) {
    if (!A.has(f) || !B.has(f) || !fs.readFileSync(path.join(repo, a, f)).equals(fs.readFileSync(path.join(repo, b, f)))) drift.push(`${b}/${f}`);
  }
};
mirror("xgen/runtimes/core/assets/styles", "packages/compose-gen/runtimes/core/assets/styles");

if (bad.length || drift.length) {
  if (bad.length) console.error(`xgen-exit-guard: ${bad.length} references into xgen:\n${bad.join("\n")}`);
  if (drift.length) console.error(`xgen-exit-guard: compose-gen copy differs from xgen (copy the generated file over):\n${drift.join("\n")}`);
  process.exit(1);
}
console.log(`xgen-exit-guard: ok (${ROOTS.join(", ")}: no xgen import or path; styles mirror in sync)`);
