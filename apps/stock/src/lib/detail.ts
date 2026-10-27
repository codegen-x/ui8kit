// The detail page of an asset as the layouts show it (pure, tested in detail.test.ts): the passport (a screen page's blocks and
// variants; a block variant's sibling variants and the screen pages that use the block), every facet that applies to the asset's
// type with its labels (or an explicit "no label": no fallback), and the similar assets.
import { textIn, type Locale } from "@ui8kit/facet-search/model";
import type { DetailView, PassportFacet, PassportLink } from "@ui8kit/layouts/stock/text";
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

const link = (a: Asset, current = false): PassportLink => ({ key: a.id, title: a.title, subtitle: a.subtitle, href: assetHash(a.id), ...(current ? { current: true } : {}) });

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

export function detailView(index: Index, recipes: Recipes, a: Asset, locale: Locale): DetailView {
  const type = index.facets.find((f) => f.id === TYPE)?.values.find((v) => v.id === a.type);
  const screen = a.preview?.kind === "screen";
  return {
    key: a.id, type: a.type, title: a.title, subtitle: a.subtitle, kind: type ? textIn(type.label, locale) : a.type,
    parts: screen ? pageBlocks(index, recipes, a) : blockVariants(index, a),
    usedBy: screen ? [] : usedBy(index, recipes, a),
    facets: passportFacets(index, a, locale),
  };
}
