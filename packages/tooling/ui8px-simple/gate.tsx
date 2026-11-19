// The ui8px gate of the simple line (blocks with "line": "simple": HeroSimple, TeamSimple, …) under the shared `ui8kit`
// preset of ui8kit/ui8px-cli (git pin `ui8px-preset` in the root package.json, the same commit as ui8kit/prototypes).
// The rest of the workspace keeps its own policy and gate (`bun run lint:px`, .ui8px/policy); this one checks only the
// simple line, as the builder gets it: the React DOM of every gallery case × every align value (React is the reference,
// organisms.test.tsx / server-organisms.test.tsx hold the other seven runtimes to the same DOM), primitives included.
// Policy: .ui8px/policy/*.json next to this file, `"extends": "ui8kit"` plus local deltas, each with its reason (README.md).
// Usage (from the workspace root): bun run lint:px:simple
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { blockCases } from "../../compose-gen";
import { loadOrganisms } from "../../kit-compose/src/organisms";
import { quiet } from "../../kit-compose/test/render-all";
import * as R from "../../kit-compose/react/src/organisms";

const HERE = import.meta.dir;
const ROOT = path.resolve(HERE, "../../..");
const ALIGNS = ["start", "center", "end"] as const;
/** blocking: spacing off the 8+4 grid, unknown, denied (text-left / text-right, raw palette) and unknown ui-* classes */
const BLOCKING = new Set(["UI8PX001", "UI8PX002", "UI8PX003", "UI8PX005"]);
/** the kit's control primitives (data-slot): their own classes are linted in the control scope (4px steps), the rest of
 *  the block in the layout scope (8px), as the workspace gate scopes specs/ui/button.* and the like */
const CONTROL_SLOTS = new Set(["button", "badge", "icon-badge", "checkbox", "radio", "switch", "select", "input", "textarea", "range", "label", "meter", "progress", "summary", "icon"]);

const loaded = loadOrganisms();
const simple = new Set(loaded.inputs.blocks.map((b) => b.value as { line?: string; organism: string }).filter((b) => b.line === "simple").map((b) => b.organism));
if (!simple.size) { console.error("ui8px simple: no block with line \"simple\""); process.exit(2); }
const cases = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name))).cases.filter((c) => simple.has(c.organism));

const out = path.join(HERE, "extract");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// a nested .gitignore keeps the extract out of git; ui8px reads only the .gitignore of its root (this dir), so it still scans it
fs.writeFileSync(path.join(out, ".gitignore"), "*\n");
const render = (organism: string, props: unknown) =>
  quiet(() => renderToStaticMarkup(createElement((R as Record<string, ComponentType<Record<string, unknown>>>)[organism]!, props as Record<string, unknown>)));
fs.mkdirSync(path.join(out, "controls"));
let n = 0;
// the gallery's own align cases (`<variant>.align-<value>`) are covered by drawing every variant with every value
for (const c of cases.filter((x) => !/\.align-/.test(x.label))) for (const a of ALIGNS) {
  const doc = new JSDOM(`<!DOCTYPE html><body><div dir="rtl">${render(c.organism, { ...(c.props as object), align: a })}</div>`).window.document;
  const controls: string[] = [];
  for (const el of doc.querySelectorAll("[data-slot][class]")) {
    if (!CONTROL_SLOTS.has(el.getAttribute("data-slot")!)) continue;
    controls.push(`<i data-slot="${el.getAttribute("data-slot")}" class="${el.getAttribute("class")}"></i>`);
    el.removeAttribute("class");
  }
  const name = `${c.label.replace(/[^\w.-]+/g, "_")}.align-${a}.html`;
  fs.writeFileSync(path.join(out, name), `<!-- ${c.label} align=${a} -->\n${doc.body.innerHTML}\n`);
  fs.writeFileSync(path.join(out, "controls", name), `<!-- ${c.label} align=${a}: control primitives -->\n${controls.join("\n")}\n`);
  n++;
}

// a git install carries the TypeScript sources only: build node_modules/ui8px-preset/dist with this repo's TypeScript once
const pkg = path.join(ROOT, "node_modules", "ui8px-preset");
const entry = path.join(pkg, "dist", "index.js");
if (!fs.existsSync(pkg)) { console.error("ui8px-preset is not installed: bun install"); process.exit(2); }
if (!fs.existsSync(entry)) {
  const built = spawnSync(process.execPath, [path.join(ROOT, "node_modules/typescript/bin/tsc"), "-p", path.join(pkg, "tsconfig.build.json")], { stdio: "inherit" });
  if (built.status !== 0 || !fs.existsSync(entry)) { console.error("ui8px simple: building ui8px-preset failed"); process.exit(2); }
}
// stdout goes straight to a file: through a pipe ui8px exits before a long report is flushed
const report = path.join(out, "lint.json");
const fd = fs.openSync(report, "w");
const run = spawnSync("node", [entry, "lint", "extract", "--json"], { cwd: HERE, stdio: ["ignore", fd, "pipe"], encoding: "utf8" });
fs.closeSync(fd);
if (run.status === 2 || run.status === null) { console.error(run.stderr || "ui8px failed"); process.exit(2); }
const { diagnostics } = JSON.parse(fs.readFileSync(report, "utf8")) as { diagnostics: { rule: string; className: string; file: string; line: number }[] };
const counts: Record<string, number> = {};
const blocking = diagnostics.filter((d) => { counts[d.rule] = (counts[d.rule] ?? 0) + 1; return BLOCKING.has(d.rule); });
const byClass = new Map<string, Set<string>>();
for (const d of blocking) (byClass.get(`${d.rule} ${d.className}`) ?? byClass.set(`${d.rule} ${d.className}`, new Set()).get(`${d.rule} ${d.className}`)!).add(path.basename(d.file));
for (const [k, files] of [...byClass].sort()) console.log(`  ${k}  (${files.size} files, e.g. ${[...files][0]})`);
console.log(`ui8px simple (preset ui8kit): ${[...simple].join(", ")}; ${n / ALIGNS.length} variants × ${ALIGNS.length} align = ${n} drawings; ${JSON.stringify(counts)}; blocking ${blocking.length}`);
if (blocking.length) process.exit(1);
