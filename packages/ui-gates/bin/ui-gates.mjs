#!/usr/bin/env node
// ui-gates source <dir|file>... [--allow tag,tag] [--allow-tag tag,tag] [--exclude dir]...   raw HTML / tag allowlist in tsx, svelte, vue, templ, twig, latte, jinja2
//   --allow: raw elements let through; --allow-tag: Box/Text tag values let through (a known gap of the kit, listed where it is used)
// ui-gates html <cases.json>...                                          [{ "id", "html" }] -> html-validate + axe-core (jsdom)
import { readFileSync } from "node:fs";
import { checkSource } from "../src/source.mjs";
import { checkHtml } from "../src/html.mjs";

const [cmd, ...argv] = process.argv.slice(2);
const opt = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));
const pos = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
let problems = [];
if (cmd === "source") problems = checkSource(pos, { allow: opt("--allow").flatMap((s) => s.split(",")), allowTags: opt("--allow-tag").flatMap((s) => s.split(",")), exclude: opt("--exclude") });
else if (cmd === "html") problems = await checkHtml(pos.flatMap((f) => JSON.parse(readFileSync(f, "utf8"))));
else { console.error("usage: ui-gates source <dir>... [--allow a,b] [--exclude dir] | ui-gates html <cases.json>..."); process.exit(2); }
for (const p of problems) console.log(p.file ? `${p.file}:${p.line} ${p.rule} ${p.message}` : `${p.id} ${p.tool}/${p.rule} ${p.message}`);
console.log(`ui-gates ${cmd}: ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
