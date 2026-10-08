#!/usr/bin/env bun
/**
 * Zoned retag check for this Vite + Svelte 5 app.
 *
 * svelte.config.js is the @sveltejs/vite-plugin-svelte compiler config only.
 * There is no SvelteKit and no src/routes. Paths match vite.config.ts:
 *   src/kit/ui   primitives (raw host tags live here; import as @/ui)
 *   src/kit/patterns  reusable behavior, grouped by family
 *   src/blocks        domain blocks (src/blocks/<domain>), shell and shared parts (@/parts)
 *   src/App.svelte
 *   index.html   Vite document frame (not scanned)
 *
 * Contract:
 *   - a violation is path|line|tag outside src/kit/ui
 *   - ratchet: a file may not have MORE violations than the baseline says
 *   - modes: check (default) | report | write-baseline
 *
 * Runs on Bun (or Node 22+ with --experimental-strip-types). No dependencies.
 *
 * Usage (from the project root):
 *   xgen-retag [check|report|write-baseline]   (bin of @ui8kit/xgen-tooling; run inside apps/<name> or packages/<name>)
 *
 * Optional config: <root>/retag.config.json (see packages/tooling/retag.config.example.json)
 *   {
 *     "appdir": "src",
 *     "extensions": [".svelte"],
 *     "baseline": ".project/retag-baseline.txt",
 *     "documentFrame": ["index.html"],
 *     "allow": [],
 *     "allowTags": ["svg", "path"],
 *     "exclude": []
 *   }
 *
 * Env: RETAG_ROOT (project root), RETAG_BASELINE (baseline file path).
 *
 * A violation in a .svelte file outside src/kit/ui is:
 *   - a lowercase element: <div>, <p>, <span>, <button>, <a>, <svg>, ...
 *   - <svelte:element> (it picks a host tag; that belongs in src/kit/ui)
 *   - {@html ...}
 * Allowed: PascalCase components (<Block>, <Button>) and Svelte special
 * elements that do not choose a host tag (svelte:window, svelte:head, ...).
 * <script>, <style>, comments, {expressions} and the whole <svelte:head>
 * block (document metadata) are ignored.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

type Mode = "check" | "report" | "write-baseline";
type Violation = { file: string; line: number; tag: string; use: string };

import { APP, HOST_DIR, projectFile } from "../src/app.mjs";
const ROOT = resolve(process.env.RETAG_ROOT ?? APP);
const MODE = (process.argv[2] ?? "check") as Mode;
const SELF = process.argv[1] ? relative(ROOT, resolve(process.argv[1])).replaceAll("\\", "/") : "bin/retag.ts";

const cfgPath = join(ROOT, "retag.config.json");
const user = existsSync(cfgPath) ? JSON.parse(readFileSync(cfgPath, "utf8")) : {};

const appdir: string = user.appdir ?? "src";
const extensions: string[] = user.extensions ?? [".svelte"];
const BASELINE = resolve(ROOT, process.env.RETAG_BASELINE ?? user.baseline ?? projectFile("retag-baseline.txt"));
const allowFiles = new Set<string>((user.allow ?? []).map((p: string) => p.replaceAll("\\", "/")));
const allowTags = new Set<string>((user.allowTags ?? []).map((t: string) => t.toLowerCase()));
const documentFrame = new Set<string>((user.documentFrame ?? ["index.html"]).map((p: string) => p.replaceAll("\\", "/")));
const kitDir = HOST_DIR ?? "\0no-host-dir"; // the primitives folder of a package (packages/ui/src/ui); an app has none
const SKIP_DIRS = new Set([
  "node_modules", ".git", ".svelte-kit", "dist", "build", ".output", "third_party", ...(user.exclude ?? []),
]);

/** Special elements that do not select a host tag. svelte:element is not in this set. */
const SVELTE_SPECIAL = new Set([
  "svelte:window",
  "svelte:document",
  "svelte:body",
  "svelte:head",
  "svelte:boundary",
  "svelte:fragment",
  "svelte:options",
  "svelte:self",
  "svelte:component",
]);

const SUGGEST: Record<string, string> = {};
for (const tag of ["div"]) SUGGEST[tag] = "Box";
for (const tag of ["section", "article", "aside", "header", "footer", "main", "nav", "figure", "search", "hgroup"]) SUGGEST[tag] = "Block";
for (const tag of ["p", "blockquote", "figcaption", "address", "pre"]) SUGGEST[tag] = "Text";
for (const tag of ["span", "em", "strong", "small", "abbr", "cite", "code", "kbd", "mark", "time", "data", "var", "samp", "sub", "sup", "b", "i", "u", "s", "q", "dfn", "bdo", "bdi", "ins", "del"]) SUGGEST[tag] = "Inline";
for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"]) SUGGEST[tag] = "Title";
for (const tag of ["ul", "ol", "dl", "menu"]) SUGGEST[tag] = "List";
for (const tag of ["li", "dt", "dd"]) SUGGEST[tag] = "ListItem";
SUGGEST.form = "Form";
SUGGEST.fieldset = "Fieldset";
SUGGEST.label = "Label";
SUGGEST.legend = "Legend";
SUGGEST.input = "Input";
SUGGEST.textarea = "Textarea";
SUGGEST.select = "Select";
SUGGEST.button = "Button";
SUGGEST.option = "SelectOption";
SUGGEST.optgroup = "OptGroup";
SUGGEST.datalist = "DataList";
SUGGEST.output = "Output";
SUGGEST.meter = "Meter";
SUGGEST.progress = "Progress";
SUGGEST.table = "Table";
SUGGEST.thead = "TableHead";
SUGGEST.tbody = "TableBody";
SUGGEST.tfoot = "TableFoot";
SUGGEST.tr = "TableRow";
SUGGEST.th = "TableHeadCell";
SUGGEST.td = "TableCell";
SUGGEST.colgroup = "TableColGroup";
SUGGEST.col = "TableCol";
SUGGEST.caption = "TableCaption";
SUGGEST.img = "Image";
SUGGEST.picture = "Picture";
SUGGEST.source = "Source";
SUGGEST.details = "Disclosure";
SUGGEST.summary = "Summary";
SUGGEST.a = "Link";
SUGGEST.dialog = "Dialog";
SUGGEST.hr = "Separator";
SUGGEST.br = "Break";
for (const tag of ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "g", "defs", "use", "symbol", "lineargradient", "radialgradient", "stop", "clippath", "mask"]) SUGGEST[tag] = "Icon";

const toPosix = (p: string) => p.replaceAll("\\", "/");

function primitiveFor(tag: string): string {
  return SUGGEST[tag.toLowerCase()] ?? "a new primitive in src/kit/ui";
}

function suggest(tag: string, hosts: string[]): string {
  if (tag === "@html") return "compose primitives from src/kit/ui";
  if (tag === "svelte:element") {
    const uses = [...new Set(hosts.map(primitiveFor))];
    return uses.length ? uses.join(" or ") : "a primitive from src/kit/ui";
  }
  return primitiveFor(tag);
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(full);
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      yield full;
    }
  }
}

/** Replace every non-newline char with a space so offsets and line numbers stay stable. */
const blank = (s: string) => s.replace(/[^\n]/g, " ");

function maskMustaches(text: string): string {
  let out = "";
  let depth = 0;
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (depth === 0) {
      if (c === "{") {
        depth = 1;
        out += " ";
      } else {
        out += c;
      }
      continue;
    }
    if (quote) {
      if (c === "\\") {
        out += " ";
        i++;
        if (i < text.length) out += text[i] === "\n" ? "\n" : " ";
        continue;
      }
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
    }
    out += c === "\n" ? "\n" : " ";
  }
  return out;
}

/** Opening tag starting at index, respecting quotes and `{...}` so `>` inside an expression is not the end. */
function openingTag(text: string, index: number): string {
  let quote = "";
  let depth = 0;
  for (let i = index; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{") {
      depth++;
      continue;
    }
    if (c === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (c === ">" && depth === 0) return text.slice(index, i + 1);
  }
  return text.slice(index);
}

/** Static host names from `this="div"` or string literals inside `this={...}`. */
function elementHosts(open: string): string[] {
  const head = open.match(/\bthis\s*=\s*/);
  if (!head || head.index === undefined) return [];
  let i = head.index + head[0].length;
  const c = open[i];
  if (c === '"' || c === "'") {
    const end = open.indexOf(c, i + 1);
    const value = open.slice(i + 1, end < 0 ? undefined : end).trim().toLowerCase();
    return /^[a-z][a-z0-9-]*$/.test(value) ? [value] : [];
  }
  if (c !== "{") return [];
  let depth = 0;
  let quote = "";
  let expr = "";
  for (; i < open.length; i++) {
    const ch = open[i];
    expr += ch;
    if (quote) {
      if (ch === "\\") {
        i++;
        if (i < open.length) expr += open[i];
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const withoutKeys = expr.replace(/\[["'`][^"'`]*["'`]\]/g, " ");
  return [...withoutKeys.matchAll(/["'`]([a-zA-Z][a-zA-Z0-9-]*)["'`]/g)].map((m) => m[1].toLowerCase());
}

function scan(file: string, text: string): Violation[] {
  const found: Violation[] = [];
  let work = text
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<script\b[\s\S]*?<\/script>/gi, blank)
    .replace(/<style\b[\s\S]*?<\/style>/gi, blank)
    .replace(/<svelte:head\b[\s\S]*?<\/svelte:head>/g, blank);

  const lineAt = (index: number) => {
    let line = 1;
    for (let i = 0; i < index; i++) if (work[i] === "\n") line++;
    return line;
  };

  const push = (index: number, tag: string, hosts: string[] = []) => {
    found.push({ file, line: lineAt(index), tag, use: suggest(tag, hosts) });
  };

  for (const m of work.matchAll(/\{@html\b/g)) push(m.index ?? 0, "@html");

  for (const m of work.matchAll(/<svelte:element\b/g)) {
    const hosts = elementHosts(openingTag(work, m.index ?? 0));
    if (hosts.length > 0 && hosts.every((h) => allowTags.has(h))) continue;
    push(m.index ?? 0, "svelte:element", hosts);
  }

  work = maskMustaches(work);

  for (const m of work.matchAll(/<([A-Za-z][A-Za-z0-9:._-]*)/g)) {
    const tag = m[1];
    const first = tag[0];
    const isComponent = first === first.toUpperCase() && first !== first.toLowerCase();
    if (isComponent || tag.includes(".") || SVELTE_SPECIAL.has(tag) || tag === "svelte:element") continue;
    if (tag.includes(":")) continue;
    if (allowTags.has(tag.toLowerCase())) continue;
    push(m.index ?? 0, tag);
  }
  return found.sort((a, b) => a.line - b.line);
}

function collectViolations(): Violation[] {
  const all: Violation[] = [];
  for (const abs of walk(ROOT)) {
    const rel = toPosix(relative(ROOT, abs));
    if (rel === SELF) continue;
    if (documentFrame.has(rel)) continue;
    if (rel === kitDir || rel.startsWith(kitDir + "/")) continue;
    if (allowFiles.has(rel)) continue;
    all.push(...scan(rel, readFileSync(abs, "utf8")));
  }
  return all;
}

function countsOf(violations: Violation[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of violations) counts.set(v.file, (counts.get(v.file) ?? 0) + 1);
  return new Map([...counts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

function readBaseline(): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of readFileSync(BASELINE, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^(.+?)\s+(\d+)$/);
    if (m) map.set(m[1], Number(m[2]));
  }
  return map;
}

function printReport(violations: Violation[], verbose: boolean) {
  if (violations.length === 0) {
    console.log("retag: 0 violations");
    return;
  }
  if (verbose) {
    console.log("retag violations:");
    for (const v of violations) console.log(`  ${v.file}:${v.line} <${v.tag}> → ${v.use}`);
    console.log();
  }
  console.log("retag counts:");
  for (const [file, n] of countsOf(violations)) console.log(`  ${file} ${n}`);
}

function writeBaseline(violations: Violation[]) {
  mkdirSync(dirname(BASELINE), { recursive: true });
  const counts = countsOf(violations);
  const body = [...counts].map(([file, n]) => `${file} ${n}`).join("\n");
  writeFileSync(BASELINE, body ? body + "\n" : "");
  if (counts.size === 0) {
    console.log(`retag: wrote empty baseline → ${BASELINE}`);
    return;
  }
  console.log(`retag: wrote baseline → ${BASELINE}`);
  for (const [file, n] of counts) console.log(`  ${file} ${n}`);
}

function ratchetCheck(violations: Violation[]): boolean {
  if (!existsSync(BASELINE)) {
    console.error(`retag: missing baseline ${BASELINE} — run: xgen-retag write-baseline`);
    return false;
  }
  const base = readBaseline();
  const counts = countsOf(violations);
  let ok = true;
  for (const [file, n] of counts) {
    const b = base.get(file) ?? 0;
    if (n > b) {
      console.error(`retag: debt grew: ${file} ${n} > baseline ${b}`);
      ok = false;
    }
  }
  for (const [file, b] of base) {
    const n = counts.get(file) ?? 0;
    if (n < b) console.error(`retag: progress ${file} ${n} < baseline ${b} (run write-baseline to lock in)`);
  }
  return ok;
}

const violations = collectViolations();
switch (MODE) {
  case "report":
    printReport(violations, true);
    break;
  case "write-baseline":
    writeBaseline(violations);
    break;
  case "check":
    printReport(violations, false);
    if (!ratchetCheck(violations)) {
      console.error(`retag: tip — xgen-retag report`);
      console.error("retag: hidden allowlist — retag.config.json → allow / allowTags");
      process.exit(1);
    }
    console.log("retag: ratchet OK");
    break;
  default:
    console.error(`usage: xgen-retag [check|report|write-baseline]`);
    process.exit(2);
}
