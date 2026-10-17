// The block data manifest (xgen/schema/codex/blocks.json), generated from the sources: every kit block (xgen/specs/blocks,
// its data bindings, settings, dictionary labels and empty state read from the spec, its organism and the dictionary),
// every screen spec (the blocks it composes), every magazine template and part (the kit blocks it imports, the data it
// reads) and every taste screen. By hand, kept from the existing file: `status` (todo/done), `required` / `optional` of a
// binding, `note` and `emptyMode`. A new block starts as todo; a moved source is followed.
//   bun run codex:blocks            writes the file
//   xgen check (group codex)        fails when the file is behind the sources (drift)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { CODEX_FIELDS } from "../../runtimes/core/assets/app/fields";
import { xgenPaths } from "./paths";

export const BLOCKS_PATH = join(import.meta.dir, "..", "codex", "blocks.json");
const XGEN = join(import.meta.dir, "..", "..");

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };
export interface Binding { prop: string; collection?: string; kind: string; record?: string; map?: string; list?: boolean; required?: string[]; optional?: string[] }
export interface Labels { prop: string; dictionary: string; keys: string[] }
export interface BlockEntry {
  id: string; surface: string; spec?: string; source: string; status: "todo" | "done";
  data?: Binding[]; settings?: string[]; labels?: Labels[]; emptyState?: boolean; emptyMode?: "label" | "omit";
  uses?: string[]; collections?: string[]; note?: string;
}
export interface BlocksDoc { $schema: string; version: string; contract: string; fieldMaps: string; blocks: BlockEntry[] }

/** where the sources are: the xgen folder, the magazine templates and the taste screens */
export interface BlockSources { xgen: string; workspace: string; magazine: string; taste: string }
export const blockSources = (xgen = XGEN): BlockSources => {
  const workspace = join(xgen, "..");
  return { xgen, workspace, magazine: join(workspace, "apps", "magazine", "src", "templates"), taste: join(workspace, "packages", "taste-screens", "src", "screens") };
};

const readJson = (f: string): Obj => JSON.parse(readFileSync(f, "utf8")) as Obj;
const jsonFiles = (dir: string): string[] => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => join(dir, f)) : []);
const isObj = (v: Json | undefined): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const at = (o: Json | undefined, path: string): Json | undefined => path.split(".").reduce<Json | undefined>((c, k) => (isObj(c) ? c[k] : undefined), o);
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** every reference `{ "$": ref }` under a prop value: the dotted prop path (op nodes skipped) and whether it is one record (pick, nth) */
function refsOf(v: Json | undefined, path: string, one = false, acc: { path: string; ref: string; one: boolean }[] = []) {
  if (Array.isArray(v)) v.forEach((x) => refsOf(x, path, one, acc));
  else if (isObj(v)) {
    if (typeof v.$ === "string") acc.push({ path, ref: v.$, one });
    else if (typeof v.op === "string") refsOf(v.args, path, one || v.op === "pick" || v.op === "nth", acc);
    else for (const [k, x] of Object.entries(v)) refsOf(x, path ? `${path}.${k}` : k, one, acc);
  }
  return acc;
}

/** the organism specs by name and every record type they declare */
function organisms(src: BlockSources) {
  const byName = new Map<string, Obj>();
  const records = new Map<string, string[]>();
  for (const dir of ["organisms", "parts", "patterns"]) for (const f of jsonFiles(xgenPaths(src.xgen).specs(dir))) {
    const o = readJson(f);
    byName.set(o.name as string, o);
    for (const [k, fs] of Object.entries((o.records ?? {}) as Record<string, { name: string }[]>)) records.set(k, fs.map((x) => x.name));
  }
  return { byName, records };
}

const mapOf = (fields: Json | undefined): string | undefined =>
  Object.entries(CODEX_FIELDS).find(([, m]) => same({ ...m }, fields))?.[0];

function kitBlock(file: string, src: BlockSources, orgs: ReturnType<typeof organisms>, dict: Obj): BlockEntry {
  const s = readJson(file);
  const sample = (at(s, "sample.props") ?? {}) as Obj;
  const variantProps = ((s.variants ?? []) as Obj[]).map((v) => (v.props ?? {}) as Obj);
  const refs = [sample, ...variantProps].flatMap((p) => Object.entries(p).flatMap(([k, v]) => refsOf(v, k)));
  const specData = (s.data ?? []) as Obj[];
  const aliases = new Set(specData.map((d) => d.as as string));
  const data: Binding[] = specData.map((d) => {
    const r = refs.find((x) => x.ref === d.as);
    const map = mapOf(d.fields);
    return {
      prop: r?.path ?? (d.as as string),
      ...(d.collection ? { collection: d.collection as string } : {}),
      kind: d.kind as string,
      ...(d.record ? { record: d.record as string } : {}),
      ...(map ? { map } : {}),
      list: !r?.one,
    };
  });
  const org = orgs.byName.get(s.organism as string);
  const props = ((org?.props ?? []) as { name: string; type: Json }[]);
  const labels: Labels[] = [];
  for (const r of refs) {
    if (!r.ref.startsWith("ui.") || labels.some((l) => l.prop === r.path)) continue;
    const dictionary = r.ref.slice(3);
    const value = at(dict, dictionary);
    const type = props.find((p) => p.name === r.path)?.type;
    const recordName = isObj(type) ? String(type.record ?? type.ts ?? "") : "";
    const fields = orgs.records.get(recordName);
    const strings = isObj(value) ? Object.keys(value).filter((k) => typeof value[k] === "string") : [];
    labels.push({ prop: r.path, dictionary, keys: fields ? fields.filter((k) => strings.includes(k)) : strings });
  }
  const touched = new Set(refs.filter((r) => r.ref.startsWith("ui.") || aliases.has(r.ref)).map((r) => r.path.split(".")[0]!));
  const settings = props.map((p) => p.name).filter((n) => !touched.has(n));
  return {
    id: s.organism as string, surface: "kit-block", spec: s.id as string, source: rel(src, file), status: "todo",
    data, settings, labels, emptyState: ((s.slots ?? []) as string[]).includes("EmptyState"),
  };
}

const rel = (src: BlockSources, f: string): string => relative(src.workspace, f).split("\\").join("/");

function screen(file: string, src: BlockSources): BlockEntry {
  const s = readJson(file);
  const uses = new Set<string>();
  const walk = (v: Json | undefined): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (isObj(v)) { if (typeof v.block === "string") uses.add(`block.${v.block}`); Object.values(v).forEach(walk); }
  };
  walk(s);
  const collections = [isObj(s.source) ? s.source.collection : undefined, ...((s.sources ?? []) as Obj[]).map((x) => x.collection)].filter((c): c is string => typeof c === "string");
  return { id: s.id as string, surface: "xgen-screen", source: rel(src, file), status: "todo", uses: [...uses].sort(), ...(collections.length ? { collections: [...new Set(collections)].sort() } : {}) };
}

const PARTS = new Set(["header", "footer"]);
function template(file: string, src: BlockSources, kit: Set<string>): BlockEntry {
  const text = readFileSync(file, "utf8");
  const name = file.split("/").pop()!.replace(/\.svelte$/, "");
  const imported = [...text.matchAll(/import \{([^}]*)\} from "@ui8kit\/svelte-ui"/g)].flatMap((m) => m[1]!.split(",").map((x) => x.trim())).filter(Boolean);
  const collections = [...new Set([...text.matchAll(/\bd\.([A-Za-z]+)/g)].map((m) => m[1]!).filter((c) => c !== "ui"))].sort();
  return { id: `template.${name}`, surface: PARTS.has(name) ? "magazine-part" : "magazine-template", source: rel(src, file), status: "todo", uses: imported.filter((n) => kit.has(n)).sort(), collections };
}

function tasteScreen(file: string, src: BlockSources, kit: Set<string>): BlockEntry {
  const text = readFileSync(file, "utf8");
  const imported = [...text.matchAll(/import \{([^}]*)\} from "@ui8kit\/svelte-ui"/g)].flatMap((m) => m[1]!.split(",").map((x) => x.trim()));
  const uses = imported.filter((n) => kit.has(n)).sort();
  return { id: `taste.${file.split("/").pop()!.replace(/\.svelte$/, "")}`, surface: "taste-screen", source: rel(src, file), status: "todo", ...(uses.length ? { uses } : {}) };
}

const ORDER: (keyof BlockEntry)[] = ["id", "surface", "spec", "source", "status", "data", "settings", "labels", "emptyState", "emptyMode", "uses", "collections", "note"];
const ordered = (b: BlockEntry): BlockEntry => Object.fromEntries(ORDER.filter((k) => b[k] !== undefined).map((k) => [k, b[k]])) as unknown as BlockEntry;

/** the hand fields of the existing file carried over: status, note, emptyMode; required / optional by the binding's collection */
function keep(b: BlockEntry, old: BlockEntry | undefined): BlockEntry {
  if (!old) return ordered(b);
  const data = b.data?.map((d) => {
    const o = old.data?.find((x) => (x.collection ?? x.prop) === (d.collection ?? d.prop));
    return { ...d, ...(o?.required ? { required: o.required } : {}), ...(o?.optional ? { optional: o.optional } : {}) };
  });
  return ordered({ ...b, ...(data ? { data } : {}), status: old.status, ...(old.note ? { note: old.note } : {}),
    // emptyMode omit: the block leaves the empty part out (no EmptyState slot), which counts as its empty state
    ...(old.emptyMode ? { emptyMode: old.emptyMode, emptyState: b.emptyState || old.emptyMode === "omit" } : {}) });
}

export function buildBlocks(src = blockSources(), previous: BlocksDoc | undefined = existsSync(BLOCKS_PATH) ? (JSON.parse(readFileSync(BLOCKS_PATH, "utf8")) as BlocksDoc) : undefined): BlocksDoc {
  const paths = xgenPaths(src.xgen);
  const orgs = organisms(src);
  const dict = readJson(paths.dictionary);
  const kitFiles = jsonFiles(paths.specs("blocks"));
  const kitBlocks = kitFiles.map((f) => kitBlock(f, src, orgs, dict));
  const kit = new Set(kitBlocks.map((b) => b.id));
  const svelte = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".svelte")).sort().map((f) => join(dir, f)) : []);
  const templates = svelte(src.magazine).map((f) => template(f, src, kit));
  const fresh = [
    ...kitBlocks,
    ...jsonFiles(paths.specs("screens")).map((f) => screen(f, src)),
    ...templates.filter((t) => t.surface === "magazine-template"),
    ...templates.filter((t) => t.surface === "magazine-part"),
    ...svelte(src.taste).map((f) => tasteScreen(f, src, kit)),
  ];
  // a block is the same block when its id is (a moved file keeps its id; its source follows)
  const old = new Map((previous?.blocks ?? []).map((b) => [b.id, b]));
  return {
    $schema: "./blocks.schema.json",
    version: previous?.version ?? "0.1.0",
    contract: "@ui8kit/contract v0.4 (codex manifest: ./manifest.json)",
    fieldMaps: "xgen/runtimes/core/assets/app/fields.ts",
    blocks: fresh.map((b) => keep(b, old.get(b.id))),
  };
}

export const blocksText = (d: BlocksDoc): string => JSON.stringify(d, null, 2) + "\n";

/** problems when the file on disk is not what the sources generate */
export function blocksDrift(src = blockSources()): string[] {
  const now = existsSync(BLOCKS_PATH) ? readFileSync(BLOCKS_PATH, "utf8") : "";
  if (!now) return ["xgen/schema/codex/blocks.json: missing (run: bun run codex:blocks)"];
  const want = blocksText(buildBlocks(src, JSON.parse(now) as BlocksDoc));
  if (now === want) return [];
  const a = (JSON.parse(now) as BlocksDoc).blocks, b = (JSON.parse(want) as BlocksDoc).blocks;
  const ids = [...new Set([...a, ...b].map((x) => x.id))].filter((id) => !same(a.find((x) => x.id === id), b.find((x) => x.id === id)));
  return [`xgen/schema/codex/blocks.json: behind the sources (${ids.slice(0, 8).join(", ")}${ids.length > 8 ? `, +${ids.length - 8}` : ""}); run: bun run codex:blocks`];
}

if (import.meta.main) {
  writeFileSync(BLOCKS_PATH, blocksText(buildBlocks()));
  console.log(`wrote ${BLOCKS_PATH}`);
}
