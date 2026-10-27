// From the engine's outcome to what the layouts show: plain view models in the current language. Pure (tested in view.test.ts).
import { activeCount, queryTokens, type Outcome, type Relaxation, type SearchState } from "@ui8kit/facet-search";
import { textIn, type Locale } from "@ui8kit/facet-search/model";
import { fmt, type CardView, type ChipView, type FacetView, type QuickView, type RefineView, type RelaxView, type StockText, type SuggestView, type TypeView } from "@ui8kit/layouts/stock/text";
import type { Asset, Index } from "./model";
import { assetHash } from "./route";

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

/** the facets a card names under its title, in this order (what the arrangement and the content are) */
const CARD_META = ["composition", "pattern", "media"];

export function cardView(index: Index, a: Asset, variants: number, locale: Locale): CardView {
  const type = index.facets.find((f) => f.id === TYPE)?.values.find((v) => v.id === a.type);
  const meta = CARD_META.flatMap((id) => {
    const f = index.facets.find((x) => x.id === id);
    const v = f?.values.find((x) => x.id === (a.labels[id] ?? []).find((y) => y !== "*"));
    return v ? [textIn(v.label, locale)] : [];
  }).slice(0, 2);
  return { key: a.id, title: a.title, subtitle: a.subtitle, kind: type ? textIn(type.label, locale) : a.type, variants, spec: a.spec, preview: a.preview !== null, href: assetHash(a.id), meta };
}

/** the facets whose values make sense as a narrowing step or a suggestion (not the internal labelling state, not the 78 layouts) */
export const REFINE = ["job", "section", "composition", "pattern", "media", "slots", "role", "density", "character"];

/** does every query word start a word of one of these strings (any case, any script)? */
const matches = (tokens: string[], texts: string[]): boolean => {
  const words = texts.flatMap((x) => queryTokens(x));
  return tokens.every((tk) => words.some((w) => w.startsWith(tk)));
};

/** the suggestions for what is typed: the free text with its result count, the facet values it names (label or synonym, in the
 *  current language or English) with the cards that filter gives now, then the assets it names by title. `counts` are the counts
 *  of the current state without its text (what the filter gives instead of the words); `total(q)` the results of a free-text search */
export function suggestViews(index: Index, draft: string, s: SearchState, counts: Outcome["counts"], total: (q: string) => number, locale: Locale): SuggestView[] {
  const q = draft.trim();
  const tokens = queryTokens(q);
  if (!tokens.length) return [];
  const out: SuggestView[] = [{ key: "q", kind: "query", label: q, count: total(q) }];
  const filters: (SuggestView & { kind: "filter" })[] = [];
  for (const id of REFINE) {
    const f = index.facets.find((x) => x.id === id);
    if (!f) continue;
    for (const v of f.values) {
      if ((s.filters[f.id] ?? []).includes(v.id)) continue;
      const n = counts[f.id]?.get(v.id) ?? 0;
      if (!n) continue;
      const names = [textIn(v.label, locale), v.label.en, ...(v.synonyms?.[locale] ?? []), ...(v.synonyms?.en ?? [])];
      if (matches(tokens, names)) filters.push({ key: `f:${f.id}:${v.id}`, kind: "filter", label: textIn(v.label, locale), group: textIn(f.label, locale), count: n, facet: f.id, value: v.id });
    }
  }
  out.push(...filters.sort((a, b) => b.count - a.count).slice(0, 6));
  const seen = new Set<string>();
  for (const a of index.assets) {
    if (seen.size >= 4) break;
    if (seen.has(a.group) || !matches(tokens, [a.title, a.subtitle])) continue;
    seen.add(a.group);
    const type = index.facets.find((f) => f.id === TYPE)?.values.find((v) => v.id === a.type);
    out.push({ key: "a:" + a.id, kind: "asset", label: a.subtitle ? a.title + " · " + a.subtitle : a.title, group: type ? textIn(type.label, locale) : a.type, href: assetHash(a.id) });
  }
  return out;
}

/** values that narrow the current results (a related search): carried by some but not all of them, the largest first, at most
 *  two per facet, never one already applied */
export function refineViews(index: Index, s: SearchState, out: Outcome, locale: Locale, limit = 8): RefineView[] {
  const n = out.results.length;
  if (n < 2) return [];
  const all: RefineView[] = [];
  for (const id of REFINE) {
    const f = index.facets.find((x) => x.id === id);
    if (!f || (s.filters[id]?.length ?? 0) > 0) continue;
    const type = s.filters[TYPE]?.[0];
    if (type && f.types && !f.types.includes(type)) continue;
    const vals = f.values.map((v) => ({ facet: id, value: v.id, label: textIn(v.label, locale), group: textIn(f.label, locale), count: out.counts[id]?.get(v.id) ?? 0 }))
      .filter((v) => v.count > 0 && v.count < n).sort((a, b) => b.count - a.count).slice(0, 2);
    all.push(...vals);
  }
  return all.sort((a, b) => b.count - a.count).slice(0, limit);
}

/** the most carried values of the whole catalog: the way back in from an empty result */
export function popularViews(index: Index, all: Outcome, locale: Locale, limit = 6): RefineView[] {
  const f = index.facets.find((x) => x.id === "job");
  if (!f) return [];
  return f.values.map((v) => ({ facet: f.id, value: v.id, label: textIn(v.label, locale), group: textIn(f.label, locale), count: all.counts[f.id]?.get(v.id) ?? 0 }))
    .filter((v) => v.count > 0).sort((a, b) => b.count - a.count).slice(0, limit);
}
