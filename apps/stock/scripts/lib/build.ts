// The index builder of Stock: reads the specs of the repository and the facet vocabulary (content/facets.v0.json) and returns
// the assets (content/assets.v0.json), the preview recipes (content/previews.v0.json) and the loaders of the Codex collections the
// previews read (src/lib/collections.gen.ts). Pure apart from reading files; the same inputs give byte-equal outputs (and digest).
//   sources: packages/compose-gen/specs/blocks (blocks, axes, variants, samples), packages/compose-gen/schema/codex/blocks.json
//   (data/kind/record -> slots), packages/compose-gen/specs/organisms (runtimes; an organism no block draws, directly or inside
//   another organism, would be an asset of its own: none is today), packages/compose-gen/specs/screens (composed screens made of
//   kit blocks only: one asset per page). Skins are preview settings, not assets. No fallback values: an asset no rule matches has
//   no label for the facet. A value no asset carries and a facet that does not discriminate are hidden (index.hidden).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ui as dict } from "@ui8kit/app-shared/content";
import { isModular, rootGrid, variantProps, type PatternMap, type TermFile } from "./pattern";
import type { Asset, BlockRecipe, BlockUse, Clause, Facet, FacetValue, Index, Preview, Previews, Rule, ScreenRecipe, SpecValue, Vocabulary } from "../../src/lib/model";

export const ROOT = join(import.meta.dir, "..", "..", "..", "..");
const APP = join(ROOT, "apps", "stock");
const SPECS = join(ROOT, "packages", "compose-gen", "specs");
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const jsonFiles = (dir: string): string[] => readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_")).sort();

/** the topics of the catalog in the order of the block gallery (packages/compose-gen/screens/src/compose-kit.ts THEMES) */
export const THEMES = ["marketing", "commerce", "promo", "content", "account", "dashboard", "onboarding", "support"] as const;

type BlockSpec = {
  id: string; name: string; docs: string; theme: string; group: string; organism: string; fit?: "section" | "card";
  alt?: { axis: string; values: string[]; organism: string };
  axes: Record<string, string[]>; defaults: Record<string, string>;
  variants: { id: string; set: Record<string, string>; props?: Record<string, SpecValue> }[];
  slots: string[]; data?: { as: string; collection: string; fields: Record<string, string> }[];
  sample: { props: Record<string, SpecValue> };
};
type OrganismSpec = { id: string; name: string; docs: string; props: { name: string; default?: unknown }[]; portable: Record<string, boolean>; view?: unknown };
type CodexBlock = { spec?: string; surface: string; data?: { record: string; required?: string[]; optional?: string[] }[]; labels?: { prop: string }[] };
type ScreenSpec = { id: string; name: string; kind?: string; frame?: { before?: unknown[]; after?: unknown[] }; areas?: Record<string, unknown[]> };

/** what a rule can look at: one variant of a block, a page of a screen */
type Ctx = {
  block?: string; group?: string; theme?: string; axes: Record<string, string>; slots: string[]; records: string[]; fields: string[];
  labels: string[]; skin?: string; colours: string[]; screen?: string; area?: string; facets: Record<string, string[]>;
  /** the composition patterns of a block variant: computed (modular-grid) and the draft table (pattern.ts) */
  patterns?: string[];
};

const has = (list: string[] | undefined, v: string | undefined): boolean => !!list && v !== undefined && list.includes(v);
const hasAny = (list: string[] | undefined, vs: string[]): boolean => !!list && vs.some((v) => list.includes(v));

/** a clause matches when any of its keys matches the context */
export function matches(c: Clause, x: Ctx): boolean {
  if (has(c.block, x.block) || has(c.group, x.group) || has(c.theme, x.theme) || has(c.skin, x.skin) || has(c.screen, x.screen) || has(c.area, x.area)) return true;
  if (hasAny(c.slot, x.slots) || hasAny(c.record, x.records) || hasAny(c.field, x.fields) || hasAny(c.label, x.labels) || hasAny(c.colour, x.colours)) return true;
  for (const [axis, vals] of Object.entries(c.axis ?? {})) if (has(vals, x.axes[axis])) return true;
  for (const [f, vals] of Object.entries(c.facet ?? {})) if (hasAny(vals, x.facets[f] ?? [])) return true;
  return false;
}
const ruleHits = (r: Rule, x: Ctx): boolean => matches(r.any, x) && !(r.not && matches(r.not, x));

/** the rule-derived values of a facet for one context: matched values in vocabulary order; none matched is "no label" (no fallback) */
export function deriveRules(f: Facet, x: Ctx): string[] {
  return f.values.filter((v) => (v.rules ?? []).some((r) => ruleHits(r, x))).map((v) => v.id);
}

const humanize = (s: string): string => {
  const t = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_.]+/g, " ").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const words = (...parts: (string | undefined)[]): string[] => [...new Set(parts.filter(Boolean).flatMap((p) => {
  const s = p!.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return [s.replace(/\s+/g, ""), ...s.split(/[^\p{L}\p{N}]+/u)];
}).filter((w) => w.length > 0))];
const getAt = (o: unknown, path: string): unknown => path.split(".").reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), o);
const str = (v: unknown, fallback: string): string => (typeof v === "string" && v ? v : fallback);

export type Built = { index: Index; previews: Previews; collections: string };

export function loadVocabulary(): Vocabulary { return readJson<Vocabulary>(join(APP, "content", "facets.v0.json")); }
/** a term file of content/terms (brain-term/v1) and the draft table of the pattern facet */
export const loadTerms = (scheme: string): TermFile => readJson<TermFile>(join(APP, "content", "terms", `${scheme}.v0.json`));
export const loadPatternMap = (): PatternMap => readJson<PatternMap>(join(APP, "content", "pattern-map.v0.json"));

export function build(vocab: Vocabulary = loadVocabulary()): Built {
  const blocks = jsonFiles(join(SPECS, "blocks")).map((f) => readJson<BlockSpec>(join(SPECS, "blocks", f)));
  const organisms = jsonFiles(join(SPECS, "organisms")).map((f) => readJson<OrganismSpec>(join(SPECS, "organisms", f)));
  const orgByName = new Map(organisms.map((o) => [o.name, o]));
  const codex = readJson<{ blocks: CodexBlock[] }>(join(ROOT, "packages", "compose-gen", "schema", "codex", "blocks.json")).blocks;
  const codexBySpec = new Map(codex.filter((c) => c.surface === "kit-block" && c.spec).map((c) => [c.spec!, c]));
  const screens = jsonFiles(join(SPECS, "screens")).map((f) => readJson<ScreenSpec>(join(SPECS, "screens", f)));

  // the vocabulary with its generated values (the values of an axis)
  const all: Facet[] = vocab.facets.map((f) => {
    if (f.valuesFrom?.startsWith("axis:")) {
      const axis = f.valuesFrom.slice(5);
      const vals = [...new Set(blocks.flatMap((b) => b.axes[axis] ?? []))].sort();
      return { ...f, values: vals.map((v) => ({ id: v, label: { en: humanize(v) } })) };
    }
    if (f.valuesFrom?.startsWith("terms:")) {
      const t = loadTerms(f.valuesFrom.slice(6));
      return { ...f, values: t.terms.map((x) => ({ id: x.id, label: x.label as FacetValue["label"], ...(x.status === "draft" ? { draft: true } : {}) })) };
    }
    return f;
  }).sort((a, b) => a.order - b.order);
  // narrowed to the facets that discriminate once the raw labels are known (see `hide` below)
  let facets: Facet[] = all;
  const byId = new Map(all.map((f) => [f.id, f]));
  const applies = (f: Facet, type: string): boolean => !f.types || f.types.includes(type);

  /** the labels of one context for one asset type, facet by facet in vocabulary order (later rules can read earlier facets) */
  function labelsOf(type: string, x: Ctx, runtimes: string[], extra: Record<string, string[]> = {}): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const f of facets) {
      if (f.derive === "markup" || !applies(f, type)) continue;
      let vals: string[] = [];
      if (f.derive === "type") vals = [type];
      else if (f.wildcard?.includes(type)) vals = ["*"];
      else if (extra[f.id]) vals = extra[f.id]!;
      else if (f.derive === "rules") vals = deriveRules(f, x);
      else if (f.derive === "pattern") vals = f.values.map((v) => v.id).filter((v) => x.patterns?.includes(v));
      else if (f.derive === "runtime") vals = runtimes;
      else if (f.derive.startsWith("axis:")) vals = x.axes[f.derive.slice(5)] !== undefined ? [x.axes[f.derive.slice(5)]!] : [];
      out[f.id] = vals;
      x.facets[f.id] = vals;
    }
    return out;
  }
  /** merge label sets (a page carries every value of the blocks it is made of) */
  function union(sets: Record<string, string[]>[]): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const f of facets) {
      const vals = new Set(sets.flatMap((s) => s[f.id] ?? []));
      if (!sets.some((s) => f.id in s)) continue;
      out[f.id] = vals.has("*") ? ["*"] : f.values.map((v) => v.id).filter((v) => vals.has(v));
    }
    return out;
  }
  /** finish an asset: type label, labelling state, weak and missing facets, the haystack */
  function finish(a: Omit<Asset, "weak" | "missing" | "fields" | "order"> & { words: { w: number; words: string[] }[] }, order: number): Asset {
    const labels: Record<string, string[]> = { ...a.labels, type: [a.type] };
    // what still needs labelling: a shared, filtering facet of the type with no value (a typed facet without a value does not apply,
    // a draft facet with no labels at all for the type is unlabelled by design and marked as a draft instead)
    const missing = facets.filter((f) => applies(f, a.type) && f.scope === "shared" && f.derive !== "markup" && f.mode !== "soft" && f.id !== "type"
      && !(labels[f.id]?.length) && !(f.draft && !labelledDraft.has(`${a.type}:${f.id}`))).map((f) => f.id);
    const weak = facets.filter((f) => (labels[f.id]?.length ?? 0) > 0 && labels[f.id]![0] !== "*"
      && (f.draft || labels[f.id]!.some((v) => f.values.find((x) => x.id === v)?.draft))).map((f) => f.id);
    labels["markup"] = [missing.length ? "needs" : "auto"];
    const ordered: Record<string, string[]> = {};
    for (const f of facets) if (labels[f.id]) ordered[f.id] = labels[f.id]!;
    // the words of the labels (value names and synonyms) are added by the engine when it loads the index (src/lib/search.ts)
    const fields = a.words.filter((f) => f.words.length);
    const { words: _w, ...rest } = a;
    return { ...rest, order, labels: ordered, weak, missing, fields };
  }

  const runtimesOf = (names: string[]): string[] => {
    const all = byId.get("runtime")!.values.map((v) => v.id);
    return all.filter((r) => names.every((n) => orgByName.get(n)?.portable?.[r] === true));
  };
  const blockCtx = (b: BlockSpec, set: Record<string, string>): Ctx => {
    const c = codexBySpec.get(b.id);
    return {
      block: b.id.slice(6), group: b.group, theme: b.theme, axes: { ...b.defaults, ...set }, slots: b.slots,
      records: (c?.data ?? []).map((d) => d.record), fields: (c?.data ?? []).flatMap((d) => [...(d.required ?? []), ...(d.optional ?? [])]),
      labels: (c?.labels ?? []).map((l) => l.prop), colours: [], facets: {},
    };
  };
  const drawnBy = (b: BlockSpec, v: BlockSpec["variants"][number]): string =>
    b.alt && (v.set[b.alt.axis] ?? b.defaults[b.alt.axis]) === b.alt.values[1] ? b.alt.organism : b.organism;
  const names = dict.blocks.names as Record<string, string>;
  const variantNames = dict.blocks.variants as Record<string, Record<string, string>>;
  const themeTitles = dict.blocks.themes as Record<string, { title: string }>;

  type Raw = Parameters<typeof finish>[0];
  const raws: Raw[] = [];
  const labelledDraft = new Set<string>();
  const recipes: Previews["blocks"] = {};
  const sorted = [...blocks].sort((a, b) => THEMES.indexOf(a.theme as (typeof THEMES)[number]) - THEMES.indexOf(b.theme as (typeof THEMES)[number]) || a.id.localeCompare(b.id));
  /** every variant's labels, for the pages made of them */
  const variantLabels = new Map<string, Record<string, string[]>>();
  const patternMap = loadPatternMap();

  for (const b of sorted) {
    const key = b.id.slice(6);
    const orgNames = [b.organism, ...(b.alt ? [b.alt.organism] : [])];
    recipes[key] = {
      organism: b.organism, ...(b.alt ? { alt: b.alt } : {}), ...(b.fit ? { fit: b.fit } : {}), defaults: b.defaults, sample: b.sample.props,
      variants: b.variants.map((v) => ({ id: v.id, set: v.set, ...(v.props ? { props: v.props } : {}) })),
      data: (b.data ?? []).map((d) => ({ as: d.as, collection: d.collection, fields: d.fields })),
      orgProps: Object.fromEntries(orgNames.map((n) => [n, (orgByName.get(n)?.props ?? []).map((p) => p.name)])),
    };
    for (const v of b.variants) {
      const org = drawnBy(b, v);
      const o = orgByName.get(org);
      const computed = o && isModular(rootGrid(o.view, variantProps(o.props, b.sample.props, (b.data ?? []).map((d) => d.as), { ...b.defaults, ...v.set }, v.props), orgByName)) ? ["modular-grid"] : [];
      const ctx = { ...blockCtx(b, v.set), patterns: [...computed, ...(patternMap.labels[key] ?? []), ...(patternMap.labels[`${key}/${v.id}`] ?? [])] };
      const labels = labelsOf("block", ctx, runtimesOf([org]));
      variantLabels.set(`${key}/${v.id}`, labels);
      const preview: Preview = { kind: "block", block: key, variant: v.id };
      const title = str(names[key], humanize(key));
      const vname = str(variantNames[key]?.[v.id], humanize(v.id));
      raws.push({
        id: `block.${key}/${v.id}`, type: "block", group: `block.${key}`, title, subtitle: vname, spec: b.id, variant: v.id, labels, preview,
        words: [{ w: 6, words: words(title, key) }, { w: 4, words: words(vname, v.id) }, { w: 3, words: words(b.group, b.theme, str(themeTitles[b.theme]?.title, ""), org) }, { w: 1, words: words(b.docs) }],
      });
    }
  }

  // organisms drawn by a block (its organism, its alt, and every organism nested in their views) are shown as that block's variants;
  // an organism no block draws would be a block asset of its own, without a preview recipe (none today: all 97 are drawn)
  const nested = (o: OrganismSpec | undefined): string[] => [...JSON.stringify(o?.view ?? null).matchAll(/"organism":"(\w+)"/g)].map((m) => m[1]!);
  const drawn = new Set<string>();
  const visit = (name: string): void => { if (drawn.has(name)) return; drawn.add(name); nested(orgByName.get(name)).forEach(visit); };
  for (const b of blocks) [b.organism, ...(b.alt ? [b.alt.organism] : [])].forEach(visit);
  for (const o of [...organisms].filter((o) => o.id.startsWith("organism.") && !drawn.has(o.name)).sort((a, b) => a.name.localeCompare(b.name))) {
    const title = humanize(o.name);
    raws.push({
      id: `block.${o.id.slice(9)}`, type: "block", group: `organism.${o.id.slice(9)}`, title, subtitle: o.name, spec: o.id,
      labels: labelsOf("block", { axes: {}, slots: [], records: [], fields: [], labels: [], colours: [], facets: {} }, runtimesOf([o.name])), preview: null,
      words: [{ w: 6, words: words(title, o.name) }, { w: 1, words: words(o.docs) }],
    });
  }

  // screens: one asset per page (area) of a composed screen, labelled by its blocks
  const screenRecipes: Record<string, ScreenRecipe> = {};
  const isUse = (u: unknown): u is BlockUse => !!u && typeof u === "object" && typeof (u as BlockUse).block === "string";
  for (const s of screens.filter((s) => s.kind === "composed" && s.areas && Object.keys(s.areas).length)) {
    const key = s.id.slice(7);
    const uses = Object.fromEntries(Object.entries(s.areas!).map(([area, list]) => [area, list.filter(isUse)]));
    screenRecipes[key] = { name: s.name, before: (s.frame?.before ?? []).filter(isUse), after: (s.frame?.after ?? []).filter(isUse), areas: uses };
    const screenTitle = humanize(s.name.replace(/Screen$/, "").replace(/^Theme/, ""));
    for (const [area, list] of Object.entries(uses)) {
      if (!list.length) continue;
      const parts = list.map((u) => {
        const b = blocks.find((x) => x.id === `block.${u.block}`);
        const vid = u.variant ?? b?.variants[0]?.id ?? "";
        return variantLabels.get(`${u.block}/${vid}`) ?? {};
      });
      const merged = union(parts.map((p) => Object.fromEntries(Object.entries(p).filter(([f]) => applies(byId.get(f)!, "screen")))));
      const ctx: Ctx = { axes: {}, slots: [], records: [], fields: [], labels: [], colours: [], facets: { ...merged }, screen: key, area };
      // page-level rules (industry by screen and area) add to what the blocks carry
      const own = labelsOf("screen", ctx, runtimesOf(list.map((u) => recipes[u.block]?.organism ?? "")));
      const labels = union([merged, Object.fromEntries(Object.entries(own).filter(([f]) => byId.get(f)!.derive === "rules" && (byId.get(f)!.mode === "soft" || !merged[f]?.length))), { runtime: own["runtime"] ?? [] }]);
      const pageName = humanize(area);
      raws.push({
        id: `screen.${key}/${area}`, type: "screen", group: `screen.${key}/${area}`, title: screenTitle, subtitle: pageName, spec: s.id, variant: area, labels,
        preview: { kind: "screen", screen: key, area },
        words: [{ w: 6, words: words(screenTitle, key) }, { w: 4, words: words(pageName, area) }, { w: 2, words: list.map((u) => u.block) }],
      });
    }
  }

  // hide the facets that do not discriminate: no asset carries a label, or every asset the facet applies to carries the same labels
  const hidden: NonNullable<Index["hidden"]> = { facets: [], values: [] };
  facets = all.filter((f) => {
    if (f.derive === "type" || f.derive === "markup") return true;
    const of = raws.filter((r) => applies(f, r.type));
    const sets = new Set(of.map((r) => JSON.stringify(r.labels[f.id] ?? [])));
    const reason = !of.some((r) => (r.labels[f.id]?.length ?? 0) > 0) ? "empty" : sets.size === 1 ? "uniform" : null;
    if (reason) hidden.facets.push({ facet: f.id, reason });
    return !reason;
  });
  for (const r of raws) for (const h of hidden.facets) delete r.labels[h.facet];

  for (const r of raws) for (const f of facets) if (f.draft && (r.labels[f.id]?.length ?? 0) > 0 && r.labels[f.id]![0] !== "*") labelledDraft.add(`${r.type}:${f.id}`);
  const assets: Asset[] = raws.map((r, i) => finish(r, i));
  // hide the values no asset carries (an empty industry, a calm with no rule, a markup state nothing has yet)
  const carried = new Set(assets.flatMap((a) => Object.entries(a.labels).flatMap(([f, vs]) => vs.map((v) => `${f}\u0000${v}`))));
  const shown: Facet[] = facets.map((f) => {
    const keep = f.values.filter((v) => carried.has(`${f.id}\u0000${v.id}`));
    for (const v of f.values) if (!keep.includes(v)) hidden.values.push({ facet: f.id, value: v.id });
    return { ...f, values: keep };
  });
  const live = new Set(shown.flatMap((f) => f.values.map((v) => `${f.id}\u0000${v.id}`)));
  const quick = vocab.quick.filter((q) => live.has(`${q.facet}\u0000${q.value}`));
  const counts: Record<string, number> = {};
  for (const a of assets) counts[a.type] = (counts[a.type] ?? 0) + 1;
  counts["blockSpecs"] = blocks.length;
  const body = { version: vocab.version, counts, facets: shown, hidden, quick, sorts: vocab.sorts, assets };
  const digest = "sha256:" + createHash("sha256").update(JSON.stringify(body)).digest("hex");
  const index: Index = { version: body.version, digest, counts, facets: shown, hidden, quick, sorts: body.sorts, assets };
  const previews: Previews = { version: vocab.version, blocks: recipes, screens: screenRecipes };

  // the Codex collections the previews read, as lazy imports of @ui8kit/app-shared/data/<collection>
  const used = [...new Set(Object.values(recipes).flatMap((r) => r.data.map((d) => d.collection)))].sort();
  const dataDir = join(ROOT, "packages", "shared", "app", "src", "data");
  const lines = used.map((c) => {
    const name = /export const (\w+)/.exec(readFileSync(join(dataDir, `${c}.ts`), "utf8"))?.[1];
    if (!name) throw new Error(`build-index: no export in @ui8kit/app-shared/data/${c}`);
    return `  ${JSON.stringify(c)}: () => import("@ui8kit/app-shared/data/${c}").then((m) => m.${name} as readonly unknown[]),`;
  });
  const collections = `// Code generated by apps/stock/scripts/build-index.ts. DO NOT EDIT.\n// The Codex collections the block previews read (data[].collection of the block specs), loaded on demand.\nexport const COLLECTIONS: Record<string, () => Promise<readonly unknown[]>> = {\n${lines.join("\n")}\n};\n`;
  return { index, previews, collections };
}

export const OUTPUTS = {
  index: join(APP, "content", "assets.v0.json"),
  previews: join(APP, "content", "previews.v0.json"),
  collections: join(APP, "src", "lib", "collections.gen.ts"),
} as const;

/** the files of a build, as written to disk */
export function serialise(b: Built): Record<keyof typeof OUTPUTS, string> {
  return { index: JSON.stringify(b.index) + "\n", previews: JSON.stringify(b.previews, null, 1) + "\n", collections: b.collections };
}

/** the values of a facet that are in the vocabulary (for validation): every id, plus "*" for wildcard types */
export const valueIds = (f: Facet): Set<string> => new Set(f.values.map((v: FacetValue) => v.id));
