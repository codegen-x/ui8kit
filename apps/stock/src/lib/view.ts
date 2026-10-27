// From the engine's outcome to what the layouts show: plain view models in the current language. Pure (tested in view.test.ts).
import { activeCount, type Outcome, type Relaxation, type SearchState } from "@ui8kit/facet-search";
import { textIn, type Locale } from "@ui8kit/facet-search/model";
import { fmt, type CardView, type ChipView, type FacetView, type QuickView, type RelaxView, type StockText, type TypeView } from "@ui8kit/layouts/stock/text";
import type { Asset, Index } from "./model";

export const TYPE = "type";

/** the type tabs: every type with assets, then "all" first */
export function typeViews(index: Index, out: Outcome, locale: Locale, t: StockText): TypeView[] {
  const f = index.facets.find((x) => x.id === TYPE);
  const counts = out.counts[TYPE];
  const vals = (f?.values ?? []).map((v) => ({ id: v.id, label: textIn(v.label, locale), count: counts?.get(v.id) ?? 0 }));
  return [{ id: "", label: t.filters.all, count: vals.reduce((n, v) => n + v.count, 0) }, ...vals];
}

/** the facets of the column: every facet but the type, the ones for the chosen type only */
export function facetViews(index: Index, s: SearchState, out: Outcome, locale: Locale): FacetView[] {
  const type = s.filters[TYPE]?.[0];
  return index.facets.filter((f) => f.id !== TYPE && (!type || !f.types || f.types.includes(type))).map((f) => ({
    id: f.id, label: textIn(f.label, locale), ui: f.ui, open: f.open === true, visible: f.visible ?? 6, draft: f.draft === true,
    note: f.draftNote ? textIn(f.draftNote, locale) : "", soft: f.mode === "soft",
    values: f.values.map((v) => ({ id: v.id, label: textIn(v.label, locale), count: out.counts[f.id]?.get(v.id) ?? 0, checked: (s.filters[f.id] ?? []).includes(v.id), ...(v.draft ? { draft: true } : {}) })),
  }));
}

export function quickViews(index: Index, s: SearchState, out: Outcome, locale: Locale): QuickView[] {
  return index.quick.flatMap((q) => {
    const f = index.facets.find((x) => x.id === q.facet);
    const v = f?.values.find((x) => x.id === q.value);
    if (!f || !v) return [];
    return [{ facet: q.facet, value: q.value, label: textIn(q.label ?? v.label, locale), count: out.counts[q.facet]?.get(q.value) ?? 0, checked: (s.filters[q.facet] ?? []).includes(q.value) }];
  });
}

const specTitle = (index: Index, spec: string): string => index.assets.find((a) => a.spec === spec)?.title ?? spec;
const valueLabel = (index: Index, facet: string, value: string, locale: Locale): string => {
  const f = index.facets.find((x) => x.id === facet);
  const v = f?.values.find((x) => x.id === value);
  return f && v ? textIn(f.label, locale) + ": " + textIn(v.label, locale) : value;
};

/** the applied filters as chips (the type is the tab bar's, not a chip); keys: q, spec, f:<facet>:<value> */
export function chipViews(index: Index, s: SearchState, locale: Locale, t: StockText): ChipView[] {
  const out: ChipView[] = [];
  if (s.q) out.push({ key: "q", label: fmt(t.chips.query, { q: s.q }) });
  if (s.spec) out.push({ key: "spec", label: fmt(t.chips.spec, { spec: specTitle(index, s.spec) }) });
  for (const [f, vals] of Object.entries(s.filters)) if (f !== TYPE) for (const v of vals) out.push({ key: `f:${f}:${v}`, label: valueLabel(index, f, v, locale) });
  return out;
}

const relaxKey = (r: Relaxation): string => (r.facet === "q" || r.facet === "spec" ? r.facet : `f:${r.facet}:${r.value}`);
export function relaxViews(index: Index, rel: Relaxation[], locale: Locale, t: StockText): RelaxView[] {
  return rel.filter((r) => r.count > 0).slice(0, 4).map((r) => ({
    key: relaxKey(r),
    label: r.facet === "q" ? fmt(t.chips.query, { q: r.value }) : r.facet === "spec" ? fmt(t.chips.spec, { spec: specTitle(index, r.value) }) : valueLabel(index, r.facet, r.value, locale),
    count: r.count,
  }));
}

/** drop one applied filter by its chip key (back to page 1) */
export function removeKey(s: SearchState, key: string): SearchState {
  if (key === "q") return { ...s, q: "", page: 1 };
  if (key === "spec") return { ...s, spec: "", variants: "one", page: 1 };
  const [, f, v] = key.split(":");
  const rest = (s.filters[f!] ?? []).filter((x) => x !== v);
  const filters = { ...s.filters };
  if (rest.length) filters[f!] = rest; else delete filters[f!];
  return { ...s, filters, page: 1 };
}

/** every filter off but the type tab */
export function resetFilters(s: SearchState): SearchState {
  const type = s.filters[TYPE];
  return { q: "", filters: type ? { [TYPE]: type } : {}, spec: "", variants: "one", sort: s.sort, page: 1 };
}

export const selectedCount = (s: SearchState): number => activeCount(s) - (s.filters[TYPE]?.length ?? 0);

export function cardView(index: Index, a: Asset, variants: number, locale: Locale): CardView {
  const type = index.facets.find((f) => f.id === TYPE)?.values.find((v) => v.id === a.type);
  return { key: a.id, title: a.title, subtitle: a.subtitle, kind: type ? textIn(type.label, locale) : a.type, variants, spec: a.spec, preview: a.preview !== null };
}
