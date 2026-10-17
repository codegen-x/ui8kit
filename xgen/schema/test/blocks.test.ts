// The block data manifest (codex/blocks.json): it covers every kit block, screen and template, and each block marked
// done reads only fields its kind declares, through the central field map (xgen/runtimes/core/assets/app/fields.ts),
// from fixtures that pass the @ui8kit/contract v0.4 validator, with no required prop left undefined.
import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { validateCollectionV04 } from "@ui8kit/contract/validate";
import { fromCodex } from "../../runtimes/core/assets/app/core";
import { CODEX_FIELDS } from "../../runtimes/core/assets/app/fields";
import { MANIFEST_PATH, loadFixtures, loadTaxonomies, type Field, type Manifest } from "../src/codex";

const codex = join(import.meta.dir, "..", "codex");
const root = join(import.meta.dir, "..", "..", "..");
const doc = JSON.parse(readFileSync(join(codex, "blocks.json"), "utf8"));
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
const entrySchema = JSON.parse(readFileSync(new URL(import.meta.resolve("@ui8kit/contract/schemas/entry.schema.json")), "utf8"));
const coreFields = Object.keys(entrySchema.properties as object);
const cols = loadFixtures();
const taxonomies = loadTaxonomies();
const terms = taxonomies.flatMap((t) => t.terms);
const ofKind = (kind: string) => cols.flatMap((c) => c.entries).filter((e) => e.kind === kind);
// the lookups the apps pass to fromCodex (runtime/codex: CODEX)
const lookups = { media: ofKind("media"), users: ofKind("user"), terms };

interface Binding { prop: string; collection?: string; kind: string; record?: string; map?: string; list?: boolean; required?: string[]; optional?: string[] }
interface Block { id: string; surface: string; spec?: string; source: string; status: "todo" | "done"; data?: Binding[] }
const blocks = doc.blocks as Block[];
const done = blocks.filter((b) => b.status === "done");

test("blocks.json matches its JSON Schema", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const ok = ajv.validate(JSON.parse(readFileSync(join(codex, "blocks.schema.json"), "utf8")), doc);
  expect(ok ? [] : ajv.errors).toEqual([]);
});

test("blocks.json lists every kit block, screen spec and magazine template once, with a source that exists", () => {
  const ids = blocks.map((b) => b.id);
  expect(new Set(ids).size).toBe(ids.length);
  const specIds = (dir: string) => readdirSync(join(root, dir)).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(root, dir, f), "utf8")).id as string);
  const listed = new Set(blocks.map((b) => b.spec ?? b.id));
  for (const id of [...specIds("xgen/specs/blocks"), ...specIds("xgen/specs/screens")]) expect([id, listed.has(id)]).toEqual([id, true]);
  for (const f of readdirSync(join(root, "apps/magazine/src/templates")).filter((f) => f.endsWith(".svelte"))) expect(ids).toContain(`template.${f.replace(/\.svelte$/, "")}`);
  for (const b of blocks) expect([b.id, readFileSync(join(root, b.source)).length > 0]).toEqual([b.id, true]);
});

const fieldOf = (kind: string, path: string): Field | string | undefined => {
  const meta = /^metadata\.([A-Za-z0-9_]+)\.value$/.exec(path);
  if (!meta) return coreFields.includes(path) ? path : undefined;
  return manifest.resources.find((r) => r.record.id === kind)?.record.fields.find((f) => f.id === meta[1]);
};

for (const b of done) for (const d of b.data ?? []) {
  const map = (CODEX_FIELDS as Record<string, Record<string, string>>)[d.map ?? ""];
  const entries = cols.find((c) => c.collection === d.collection)?.entries ?? [];

  test(`${b.id}.${d.prop}: every field path is a core entry field or a metadata field of kind "${d.kind}"`, () => {
    expect(manifest.resources.map((r) => r.record.id)).toContain(d.kind);
    for (const p of [...(d.required ?? []), ...(d.optional ?? [])]) expect([p, fieldOf(d.kind, p) !== undefined]).toEqual([p, true]);
  });

  test(`${b.id}.${d.prop}: the central map "${d.map}" covers the required fields and equals the map of the xgen spec`, () => {
    expect(map).toBeDefined();
    const paths = Object.values(map!).map((p) => p.split("|")[0]);
    for (const p of d.required ?? []) expect([p, paths.includes(p)]).toEqual([p, true]);
    if (b.spec) {
      const spec = JSON.parse(readFileSync(join(root, b.source), "utf8"));
      const own = (spec.data as { as: string; fields: Record<string, string> }[]).find((x) => x.as === d.collection || x.as === d.prop);
      expect(own?.fields).toEqual({ ...map! });
    }
  });

  test(`${b.id}.${d.prop}: fixtures of "${d.collection}" pass the contract validator and map with no required prop undefined`, () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) expect(e.kind).toBe(d.kind);
    const termFiles = terms.map((data, i) => ({ file: `taxonomies#${i}`, data }));
    const issues = validateCollectionV04({ entries: entries.map((data, i) => ({ file: `${d.collection}.json#${i}`, data })), terms: termFiles }, { manifest }) as { severity?: string }[];
    expect(issues.filter((i) => !i.severity)).toEqual([]);
    const rows = fromCodex<Record<string, unknown>>(entries, map!, lookups);
    const requiredProps = Object.entries(map!).filter(([, p]) => (d.required ?? []).includes(p.split("|")[0]!)).map(([k]) => k);
    for (const [i, r] of rows.entries()) for (const k of requiredProps) expect([entries[i]!.id, k, r[k] === undefined || r[k] === null]).toEqual([entries[i]!.id, k, false]);
  });
}

test("every label of a done block is a key of the dictionary (xgen/content/ui/en.json), not a field of an entry", () => {
  const dict = JSON.parse(readFileSync(join(root, "xgen/content/ui/en.json"), "utf8"));
  const at = (path: string): unknown => path.split(".").reduce<unknown>((c, k) => (c && typeof c === "object" ? (c as Record<string, unknown>)[k] : undefined), dict);
  for (const b of done) for (const l of (b as unknown as { labels: { dictionary: string; keys: string[] }[] }).labels) {
    const v = at(l.dictionary);
    if (l.keys.length === 0) expect([l.dictionary, typeof v]).toEqual([l.dictionary, "string"]);
    for (const k of l.keys) expect([l.dictionary, k, typeof (v as Record<string, unknown>)?.[k]]).toEqual([l.dictionary, k, "string"]);
  }
});

test("done blocks: an empty state with its text from the dictionary (labels key empty)", () => {
  for (const b of done) {
    const x = b as unknown as { emptyState: boolean; labels: { keys: string[] }[] };
    expect([b.id, x.emptyState, x.labels.some((l) => l.keys.includes("empty"))]).toEqual([b.id, true, true]);
  }
});

test("media: every featured_media_id names an entry of kind media; the map turns a published one into its file, a draft into nothing", () => {
  const media = ofKind("media");
  expect(media.length).toBeGreaterThan(0);
  const pictured = cols.flatMap((c) => c.entries).filter((e) => (e as { featured_media_id?: string }).featured_media_id);
  expect(pictured.length).toBeGreaterThan(0);
  for (const e of pictured) expect([e.id, media.some((m) => m.id === (e as { featured_media_id?: string }).featured_media_id)]).toEqual([e.id, true]);
  const products = cols.find((c) => c.collection === "products")!.entries;
  // the repository has no image assets: every media entry is a draft (no uploaded file), so every block keeps its placeholder
  expect(media.every((m) => (m as { status?: string }).status === "draft")).toBe(true);
  expect(fromCodex<{ image?: string }>(products, CODEX_FIELDS.product, lookups).every((r) => r.image === undefined)).toBe(true);
  const published = media.map((m) => ({ ...m, status: "published" }));
  const rows = fromCodex<{ id: string; image?: string; href?: string }>(products, CODEX_FIELDS.product, { media: published, routes: { product: "#/product/{slug}" } });
  for (const [i, r] of rows.entries()) {
    const id = (products[i] as { featured_media_id?: string }).featured_media_id;
    expect(r.image).toBe(id ? (media.find((m) => m.id === id)!.metadata!.file!.value as string) : undefined);
    expect(r.href).toBe(`#/product/${(products[i] as unknown as { slug: string }).slug}`);
  }
  // without routes (the magazine and the hosts have no product or post page): no link
  expect(fromCodex<{ href?: string }>(products, CODEX_FIELDS.product, lookups).every((r) => r.href === undefined)).toBe(true);
});

test("terms and authors: every term ref names a term of a taxonomy assigned to the kind, every author_id a user; the maps print their names", () => {
  for (const t of taxonomies) for (const term of t.terms) expect([term.id, term.taxonomy_id]).toEqual([term.id, t.definition.id]);
  const users = ofKind("user");
  for (const e of cols.flatMap((c) => c.entries)) {
    for (const r of (e as { terms?: { taxonomy: string; term_id: string }[] }).terms ?? []) {
      const t = taxonomies.find((x) => x.definition.id === r.taxonomy);
      expect([e.id, r.term_id, t?.definition.assigned_to_kinds.includes(e.kind), t?.terms.some((x) => x.id === r.term_id)]).toEqual([e.id, r.term_id, true, true]);
    }
    const author = (e as { author_id?: string }).author_id;
    if (author) expect([e.id, users.some((u) => u.id === author)]).toEqual([e.id, true]);
  }
  for (const [kind, collection] of [["post", "posts"], ["product", "products"], ["review", "reviews"]] as const) {
    const entries = cols.find((c) => c.collection === collection)!.entries;
    const rows = fromCodex<{ category?: string; author?: string }>(entries, CODEX_FIELDS[kind], lookups);
    for (const [i, r] of rows.entries()) {
      if ("category" in CODEX_FIELDS[kind]) expect([entries[i]!.id, typeof r.category]).toEqual([entries[i]!.id, "string"]);
      if ("author" in CODEX_FIELDS[kind]) expect([entries[i]!.id, typeof r.author]).toEqual([entries[i]!.id, "string"]);
    }
  }
  // the post topics filter by the category name: every topic value is the name of a term of the taxonomy category
  const names = taxonomies.find((t) => t.definition.id === "category")!.terms.map((t) => t.name);
  for (const t of cols.find((c) => c.collection === "topics")?.entries ?? []) if (t.metadata?.value?.value) expect(names).toContain(t.metadata.value.value as string);
});

test("old price: compare_at is integer minor units in the currency of the entry, and some products are on sale", () => {
  const products = cols.find((c) => c.collection === "products")!.entries;
  const sale = products.filter((e) => e.metadata?.compare_at !== undefined);
  expect(sale.length).toBeGreaterThan(0);
  for (const e of sale) {
    expect(Number.isSafeInteger(e.metadata!.compare_at!.value)).toBe(true);
    expect((e.metadata!.compare_at!.value as number) > (e.metadata!.price!.value as number)).toBe(true);
  }
});

test("at least the three pilot blocks are done", () => {
  expect(done.map((b) => b.id).sort()).toEqual(expect.arrayContaining(["PostHeader", "PricingTiers", "ProductGrid"]));
});
