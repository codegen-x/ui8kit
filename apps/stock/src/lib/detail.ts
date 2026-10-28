// The detail page of an asset as the layouts show it (pure, tested in detail.test.ts): the passport (a screen page's blocks and
// variants; a block variant's sibling variants and the screen pages that use the block), every facet that applies to the asset's
// type with its labels (or an explicit "no label": no fallback), and the similar assets.
import { emptySearch, searchHash } from "@ui8kit/facet-search";
import { textIn, type Locale, type Text } from "@ui8kit/facet-search/model";
import type { DetailView, MapRow, Option, PassportFacet, PassportLink, PatternView, SimilarLink, TagView } from "@ui8kit/layouts/stock/text";
import type { BlockUse, Recipes } from "@ui8kit/layouts/preview/recipe";
import type { Asset, Index } from "./model";
import { assetHash } from "./route";
import { TYPE } from "./view";

/** the asset id of a block use: the variant it names, else the block's first */
export function useId(recipes: Recipes, u: BlockUse): string | null {
  const r = recipes.blocks[u.block];
  const v = u.variant ?? r?.variants[0]?.id;
  return r && v ? `block.${u.block}/${v}` : null;
}

/** the block uses of a screen page, in page order: the frame before, the area, the frame after */
export function pageUses(recipes: Recipes, screen: string, area: string): BlockUse[] {
  const s = recipes.screens[screen];
  return s ? [...s.before, ...(s.areas[area] ?? []), ...s.after] : [];
}

const link = (a: Asset, current = false): PassportLink => ({ key: a.id, asset: a.id, title: a.title, subtitle: a.subtitle, href: assetHash(a.id), ...(current ? { current: true } : {}) });

/** the passport of a screen page: one link per block use (a block used twice is listed twice: the page has it twice) */
export function pageBlocks(index: Index, recipes: Recipes, a: Asset): PassportLink[] {
  const p = a.preview;
  if (!p || p.kind !== "screen") return [];
  const byId = new Map(index.assets.map((x) => [x.id, x]));
  return pageUses(recipes, p.screen, p.area).flatMap((u, i) => {
    const id = useId(recipes, u);
    const b = id ? byId.get(id) : undefined;
    return b ? [{ ...link(b), key: `${i}:${b.id}` }] : [];
  });
}

/** the variants of a block (the asset itself marked current) */
export const blockVariants = (index: Index, a: Asset): PassportLink[] => index.assets.filter((x) => x.group === a.group).map((x) => link(x, x.id === a.id));

/** the screen pages that use the block of a block variant (any variant of it) */
export function usedBy(index: Index, recipes: Recipes, a: Asset): PassportLink[] {
  const p = a.preview;
  if (!p || p.kind !== "block") return [];
  return index.assets.filter((x) => x.preview?.kind === "screen" && pageUses(recipes, x.preview.screen, x.preview.area).some((u) => u.block === p.block)).map((x) => link(x));
}

/** every facet of the asset's type (but the type itself) with its labels; `*` is "any value"; none is "no label" */
export function passportFacets(index: Index, a: Asset, locale: Locale): PassportFacet[] {
  return index.facets.filter((f) => f.id !== TYPE && (!f.types || f.types.includes(a.type))).map((f) => {
    const ids = a.labels[f.id] ?? [];
    const any = ids.includes("*");
    const values = any ? [] : ids.flatMap((id) => { const v = f.values.find((x) => x.id === id); return v ? [{ id, label: textIn(v.label, locale), draft: v.draft === true }] : []; });
    return { id: f.id, label: textIn(f.label, locale), values, any, draft: a.weak.includes(f.id) };
  });
}

const SKIP = new Set([TYPE, "markup"]);
const shared = (a: Asset, b: Asset, facet: string): number => {
  const x = (a.labels[facet] ?? []).filter((v) => v !== "*");
  const y = new Set((b.labels[facet] ?? []).filter((v) => v !== "*"));
  return x.filter((v) => y.has(v)).length;
};
/** the similar assets: the same type, another block or screen (one per collapse key), ranked by the facet values they share with the
 *  asset (a block's layout counts 10: the same arrangement first), then by catalog order. Deterministic. */
export function similar(index: Index, a: Asset, n = 4): Asset[] {
  const facets = index.facets.map((f) => f.id).filter((f) => !SKIP.has(f));
  const seen = new Set<string>([a.group]);
  const scored = index.assets.filter((x) => x.type === a.type && x.group !== a.group)
    .map((x) => ({ x, s: facets.reduce((n, f) => n + shared(a, x, f) * (f === "layout" ? 10 : 1), 0) }))
    .filter((e) => e.s > 0)
    .sort((p, q) => q.s - p.s || p.x.order - q.x.order);
  const out: Asset[] = [];
  for (const { x } of scored) { if (out.length >= n) break; if (seen.has(x.group)) continue; seen.add(x.group); out.push(x); }
  return out;
}

/** the definitions of the composition patterns (content/terms/pattern.v0.json): id -> text per language */
export type Definitions = Record<string, Partial<Text>>;
/** the facets that are concepts of the page (what the blocks do for the visitor and how they are arranged) */
export const CONCEPTS = ["role", "job", "composition", "density"] as const;
/** the facets whose labels are links into the catalog (the tags of the asset) */
const TAGS = ["job", "section", "industry", "composition", "media", "character", "density"] as const;

const vocabOf = (index: Index) => ({ facets: index.facets, sorts: index.sorts });
/** the storefront with these filters */
export const catalogHash = (index: Index, filters: Record<string, string[]>): string => searchHash({ ...emptySearch(), filters }, vocabOf(index));

/** what every asset renders in (the shared runtime facet), in the vocabulary order */
export function runtimes(index: Index, locale: Locale): Option[] {
  return (index.shared ?? []).find((f) => f.facet === "runtime")?.values.map((v) => ({ id: v.id, label: textIn(v.label, locale) })) ?? [];
}

/** the labels of the asset as links into the catalog, facet by facet (a value of a draft facet or a draft value is marked) */
export function tags(index: Index, a: Asset, locale: Locale): TagView[] {
  return TAGS.flatMap((id) => {
    const f = index.facets.find((x) => x.id === id);
    if (!f || (f.types && !f.types.includes(a.type))) return [];
    return (a.labels[id] ?? []).flatMap((v) => {
      const val = f.values.find((x) => x.id === v);
      return val ? [{ key: `${id}:${v}`, label: textIn(val.label, locale), href: catalogHash(index, { [id]: [v] }), draft: a.weak.includes(id) || val.draft === true }] : [];
    });
  });
}

/** the page map: the blocks of a screen page top to bottom (a block variant: itself), each with its first composition label */
export function pageMap(index: Index, recipes: Recipes, a: Asset, locale: Locale): MapRow[] {
  const comp = index.facets.find((f) => f.id === "composition");
  const row = (b: Asset, key: string): MapRow => {
    const c = (b.labels["composition"] ?? []).find((v) => v !== "*") ?? "";
    const v = comp?.values.find((x) => x.id === c);
    return { key, title: b.title, subtitle: b.subtitle, composition: v ? c : "", compositionLabel: v ? textIn(v.label, locale) : "" };
  };
  if (a.preview?.kind !== "screen") return [row(a, a.id)];
  const byId = new Map(index.assets.map((x) => [x.id, x]));
  return pageBlocks(index, recipes, a).flatMap((l) => { const b = byId.get(l.asset); return b ? [row(b, l.key)] : []; });
}

/** the composition patterns of the asset with their definitions in this language only (none written in it: null, no fallback) */
export function patterns(f: PassportFacet | null, defs: Definitions, locale: Locale): PatternView[] {
  return (f?.values ?? []).map((v) => ({ id: v.id, label: v.label, definition: defs[v.id]?.[locale] ?? null, draft: v.draft || f!.draft }));
}

/** the catalog with the asset's arrangement: its type and its composition patterns (none: its compositions) */
export function similarFilters(a: Asset): Record<string, string[]> {
  const pick = (id: string) => (a.labels[id] ?? []).filter((v) => v !== "*");
  const pat = pick("pattern");
  return { type: [a.type], ...(pat.length ? { pattern: pat } : pick("composition").length ? { composition: pick("composition") } : {}) };
}

/** the ways into the catalog from this asset, each a filtered search: its composition pattern (when it has one), and its blocks:
 *  for a screen page the screens built from any block of its own area (the frame's header and footer would match nearly every
 *  page), for a block variant the screens built from its block (when one is). None is made up: no label, no link. */
export function similarBy(index: Index, recipes: Recipes, a: Asset): SimilarLink[] {
  const out: SimilarLink[] = [];
  const pat = (a.labels["pattern"] ?? []).filter((v) => v !== "*");
  if (pat.length) out.push({ id: "pattern", href: catalogHash(index, { type: [a.type], pattern: pat }) });
  const blocks = index.facets.find((f) => f.id === "blocks");
  const p = a.preview;
  if (blocks && p?.kind === "screen") {
    const own = [...new Set((recipes.screens[p.screen]?.areas[p.area] ?? []).map((u) => u.block))].filter((b) => blocks.values.some((v) => v.id === b));
    if (own.length) out.push({ id: "blocks", href: catalogHash(index, { type: ["screen"], blocks: own }) });
  } else if (blocks && p?.kind === "block" && blocks.values.some((v) => v.id === p.block)) {
    out.push({ id: "usedIn", href: catalogHash(index, { type: ["screen"], blocks: [p.block] }) });
  }
  return out;
}

const SKIPPED = (a: Asset, seen: Set<string>) => (x: Asset) => x.type === a.type && x.group !== a.group && !seen.has(x.group);
const firstPerGroup = (list: Asset[], n: number, seen: Set<string>): Asset[] => {
  const out: Asset[] = [];
  for (const x of list) { if (out.length >= n) break; if (seen.has(x.group)) continue; seen.add(x.group); out.push(x); }
  return out;
};

/** assets of the same type that share a composition pattern with this one (most shared first, then catalog order); `seen` are groups already shown */
export function samePattern(index: Index, a: Asset, n = 4, seen = new Set<string>([a.group])): Asset[] {
  const mine = new Set((a.labels["pattern"] ?? []).filter((v) => v !== "*"));
  if (!mine.size) return [];
  const scored = index.assets.filter(SKIPPED(a, seen)).map((x) => ({ x, s: (x.labels["pattern"] ?? []).filter((v) => mine.has(v)).length }))
    .filter((e) => e.s > 0).sort((p, q) => q.s - p.s || p.x.order - q.x.order).map((e) => e.x);
  return firstPerGroup(scored, n, seen);
}

/** screen pages built from the same blocks as this page (most shared blocks first); for a block variant: the pages that use its block */
export function sameBlocks(index: Index, recipes: Recipes, a: Asset, n = 4, seen = new Set<string>([a.group])): Asset[] {
  const p = a.preview;
  if (!p) return [];
  const blocksOf = (x: Asset): Set<string> => (x.preview?.kind === "screen" ? new Set(pageUses(recipes, x.preview.screen, x.preview.area).map((u) => u.block)) : new Set());
  const mine = p.kind === "screen" ? blocksOf(a) : new Set([p.block]);
  const scored = index.assets.filter((x) => x.preview?.kind === "screen" && x.group !== a.group && !seen.has(x.group))
    .map((x) => { const b = blocksOf(x); return { x, s: [...mine].filter((m) => b.has(m)).length }; })
    .filter((e) => e.s > 0).sort((p, q) => q.s - p.s || p.x.order - q.x.order).map((e) => e.x);
  return firstPerGroup(scored, n, seen);
}

export function detailView(index: Index, recipes: Recipes, a: Asset, locale: Locale, defs: Definitions = {}): DetailView {
  const type = index.facets.find((f) => f.id === TYPE)?.values.find((v) => v.id === a.type);
  const screen = a.preview?.kind === "screen";
  const facets = passportFacets(index, a, locale);
  const pattern = facets.find((f) => f.id === "pattern") ?? null;
  return {
    key: a.id, type: a.type, title: a.title, subtitle: a.subtitle, kind: type ? textIn(type.label, locale) : a.type,
    parts: screen ? pageBlocks(index, recipes, a) : blockVariants(index, a),
    usedBy: screen ? [] : usedBy(index, recipes, a),
    facets, runtimes: runtimes(index, locale), pattern, patterns: patterns(pattern, defs, locale),
    concepts: CONCEPTS.flatMap((id) => facets.filter((f) => f.id === id)),
    tags: tags(index, a, locale), map: pageMap(index, recipes, a, locale), similarHref: catalogHash(index, similarFilters(a)),
    similarBy: similarBy(index, recipes, a),
  };
}
