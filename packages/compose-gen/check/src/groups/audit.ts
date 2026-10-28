// The `structure`, `dead` and `duplicates` groups of compose-gen check (ported from `compose-gen check`): classes of problems an audit
// found, kept out by a rule so they do not come back.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { organismsIn } from "../../../screens/src/index";
import { DECK_COLLECTIONS } from "../../../runtimes/core/src/decks";
import { leavesOf, result, walk, type Ctx, type CheckResult } from "./context";

export const MAX_FILE_LINES = 350;
export const MAX_LINE_CHARS = 600;
/** files over the limits today, with their numbers: a ratchet (a file may not grow; lower the entry when it shrinks) */
export const STRUCTURE_ALLOW: Record<string, { lines?: number; long?: number; why: string }> = {
  "runtimes/templ/src/organism.ts": { lines: 367, why: "the templ organism emitter (Go types + templ body), moved from xgen unchanged; split pending" },
  "runtimes/templ/src/templ.ts": { lines: 449, why: "the templ view printer, moved from xgen unchanged; split pending" },
};
/** consumers compose-gen may read as data (not code): the kit-compose description (map.ts + variants) the prop tables derive from */
const CONSUMER_DATA = new Set(["parts.ts"]);

/** the TypeScript sources of compose-gen (no tests, no assets copied into the packages, no authored data) */
export function sourceFiles(root: string): string[] {
  return walk(root).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.includes("/assets/") && !f.includes("/test/")).sort();
}

const IMPORT = /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s+"(\.{1,2}\/[^"]+)"/g;
function importsOf(file: string, text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(IMPORT)) {
    const base = resolve(dirname(file), m[1]!);
    const hit = [`${base}.ts`, join(base, "index.ts"), base].find((p) => existsSync(p) && statSync(p).isFile());
    if (hit) out.push(hit);
  }
  return out;
}

/** strongly connected groups of more than one node (Tarjan) */
export function cycles(graph: Map<string, string[]>): string[][] {
  let index = 0;
  const idx = new Map<string, number>(), low = new Map<string, number>(), stack: string[] = [], on = new Set<string>(), out: string[][] = [];
  const visit = (v: string): void => {
    idx.set(v, index); low.set(v, index); index++; stack.push(v); on.add(v);
    for (const w of graph.get(v) ?? []) {
      if (!idx.has(w)) { visit(w); low.set(v, Math.min(low.get(v)!, low.get(w)!)); }
      else if (on.has(w)) low.set(v, Math.min(low.get(v)!, idx.get(w)!));
    }
    if (low.get(v) === idx.get(v)) {
      const group: string[] = [];
      let w: string;
      do { w = stack.pop()!; on.delete(w); group.push(w); } while (w !== v);
      if (group.length > 1) out.push(group.sort());
    }
  };
  for (const v of [...graph.keys()].sort()) if (!idx.has(v)) visit(v);
  return out;
}

export function checkStructure(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const rel = (f: string): string => relative(ctx.workspace, f);
  const files = sourceFiles(ctx.root);
  const graph = new Map<string, string[]>();
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const lines = text.split("\n");
    const key = relative(ctx.root, f), allow = STRUCTURE_ALLOW[key] ?? {};
    const long = lines.filter((l) => l.length > MAX_LINE_CHARS).length;
    if (lines.length > Math.max(MAX_FILE_LINES, allow.lines ?? 0)) problems.push(`${rel(f)}: ${lines.length} lines, the limit is ${MAX_FILE_LINES}; split it by concern`);
    if (long > (allow.long ?? 0)) problems.push(`${rel(f)}: ${long} lines over ${MAX_LINE_CHARS} characters; break the table`);
    if (allow.lines && lines.length < allow.lines) problems.push(`STRUCTURE_ALLOW ${key}: now ${lines.length} lines; lower the allowance from ${allow.lines}`);
    if (allow.long !== undefined && long < allow.long) problems.push(`STRUCTURE_ALLOW ${key}: now ${long} long lines; lower the allowance from ${allow.long}`);
    graph.set(f, importsOf(f, text));
    if (/["'`]\/(workspace|home|tmp|usr)\//.test(text)) problems.push(`${rel(f)}: an absolute path of this machine; take it from the environment`);
    if (!CONSUMER_DATA.has(key) && /from\s+"(?:[^"]*\/)?(?:kit-compose|apps)\//.test(text)) problems.push(`${rel(f)}: imports a consumer (kit-compose or an app); compose-gen sits below them`);
  }
  for (const g of cycles(graph)) problems.push(`import cycle: ${g.map(rel).join(" <-> ")}`);
  return result("structure", `${files.length} sources up to ${MAX_FILE_LINES} lines and ${MAX_LINE_CHARS} characters per line, no import cycles, no absolute paths, no import of a consumer`, problems);
}

export function checkDead(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const { inputs } = ctx;
  const rel = (f: string): string => relative(ctx.workspace, f);
  // fixtures: a collection that no screen reads (the copy decks are read by packages/taste-data/content/copy.json)
  const read = new Set(inputs.screens.flatMap((s) => (s.value.sources ?? []).map((x) => x.collection)).concat(inputs.screens.map((s) => s.value.source?.collection ?? "")));
  for (const c of Object.values(DECK_COLLECTIONS)) read.add(c);
  // media and users are reached through featured_media_id / author_id of the entries a screen reads
  const referenced = new Set(inputs.collections.filter((c) => read.has(c.value.collection)).flatMap((c) => c.value.entries.flatMap((e) => {
    const r = e as { featured_media_id?: string; author_id?: string };
    return [r.featured_media_id ?? "", r.author_id ?? ""];
  })));
  for (const c of inputs.collections) if (c.value.entries.length && c.value.entries.every((e) => (e.kind === "media" || e.kind === "user") && referenced.has(e.id))) read.add(c.value.collection);
  // the items under a menu item are reached through `id|menu` of the menu a screen reads
  const readIds = new Set(inputs.collections.filter((c) => read.has(c.value.collection)).flatMap((c) => c.value.entries.map((e) => e.id)));
  for (const c of inputs.collections) if (c.value.entries.length && c.value.entries.every((e) => e.kind === "menu_item" && readIds.has((e as { parent_id?: string }).parent_id ?? ""))) read.add(c.value.collection);
  for (const c of inputs.collections) if (!read.has(c.value.collection)) problems.push(`${rel(c.file)}: no screen reads the collection ${c.value.collection}`);
  // organisms: one that no screen draws, directly or inside another
  const byName = new Map(inputs.organisms.map((o) => [o.value.name, o.value]));
  const used = new Set<string>();
  const add = (n: string): void => { if (used.has(n)) return; used.add(n); const o = byName.get(n); if (o) for (const m of organismsIn(o.view)) add(m); };
  for (const s of inputs.screens) for (const n of s.value.organisms) add(n);
  for (const o of inputs.organisms) if (o.value.id.startsWith("organism.") && !used.has(o.value.name)) problems.push(`${rel(o.file)}: organism ${o.value.name} is drawn by no screen and no other organism`);
  // dictionary: a block text without its block, a status word no fixture uses
  const dict = inputs.dictionary.value as Record<string, unknown>;
  const statuses = new Set(inputs.collections.flatMap((c) => c.value.entries.flatMap((e) => Object.values((e as { metadata?: Record<string, { value?: unknown }> }).metadata ?? {}).map((m) => String(m.value)))));
  for (const k of leavesOf(dict)) if (k.startsWith("status.") && !statuses.has(k.slice("status.".length))) problems.push(`content/ui/en.json: ${k} is a status word no fixture uses`);
  const blocks = inputs.blocks.map((b) => b.value);
  const bd = (dict["blocks"] ?? {}) as Record<string, Record<string, unknown>>;
  for (const part of ["names", "docs", "variants"]) for (const k of Object.keys(bd[part] ?? {})) if (!blocks.some((b) => b.id === `block.${k}`)) problems.push(`content/ui/en.json: blocks.${part}.${k} belongs to no block`);
  for (const b of blocks) {
    const k = b.id.slice("block.".length);
    for (const key of Object.keys((bd["variants"]?.[k] ?? {}) as object)) if (!b.variants.some((v) => v.id === key)) problems.push(`content/ui/en.json: blocks.variants.${k}.${key} belongs to no variant`);
  }
  return result("dead", "no fixture or organism that nothing reaches, no block text without its block, no status word without a fixture", problems);
}

/** a value with the identity of an entry taken out, so two entries with the same content compare equal */
const withoutIdentity = (v: unknown): unknown => (Array.isArray(v) ? v.map(withoutIdentity) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([k]) => !["id", "collection", "slug", "created_at", "updated_at", "published_at"].includes(k)).map(([k, x]) => [k, withoutIdentity(x)])) : v);
/** a view shorter than this many characters of JSON may coincide by chance */
const MIN_VIEW_CHARS = 200;

/** groups of more than one item with the same key */
export function sameKey(items: Array<{ key: string; file: string }>): string[][] {
  const by = new Map<string, string[]>();
  for (const i of items) by.set(i.key, [...(by.get(i.key) ?? []), i.file]);
  return [...by.values()].filter((f) => f.length > 1);
}

export function checkDuplicates(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const rel = (f: string): string => relative(ctx.workspace, f);
  const { inputs } = ctx;
  for (const g of sameKey(inputs.organisms.map((o) => ({ key: JSON.stringify(o.value.view), file: rel(o.file) })).filter((x) => x.key.length > MIN_VIEW_CHARS))) problems.push(`views: ${g.join(" and ")} are the same; keep one`);
  for (const g of sameKey(inputs.collections.map((c) => ({ key: JSON.stringify(withoutIdentity(c.value.entries)), file: rel(c.file) })))) problems.push(`fixtures: ${g.join(" and ")} are the same; keep one`);
  const shapes = new Map<string, Map<string, string[]>>();
  for (const o of inputs.organisms) for (const [name, fields] of Object.entries((o.value as { records?: Record<string, unknown> }).records ?? {})) {
    const m = shapes.get(name) ?? new Map<string, string[]>();
    m.set(JSON.stringify(fields), [...(m.get(JSON.stringify(fields)) ?? []), rel(o.file)]);
    shapes.set(name, m);
  }
  for (const [name, m] of shapes) {
    const all = [...m.values()].flat();
    if (m.size > 1) problems.push(`record ${name}: ${m.size} different shapes in ${all.join(", ")}`);
    else if (all.length > 1) problems.push(`record ${name}: declared in ${all.join(", ")}; declare it once and import the type`);
  }
  return result("duplicates", "no two organisms with the same view, no two fixtures with the same entries, every record type declared once", problems);
}
