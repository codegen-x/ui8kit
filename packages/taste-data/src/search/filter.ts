// The search engine of the magazine: a corpus of exact styles (Item), a text query, multi-select filters, facet counts that follow
// the other active filters, and the sorts. Pure and deterministic, one pass over the corpus (820 styles filter in a few ms).
import { COMPOSITION_OF } from "../compositions";
import { INCLUDED } from "../included";
import { parseStyleKey, type StyleKey } from "../picks";
import { profileOf, scoreStyle, type Style } from "../recommend/score";
import { TASTES } from "../tastes";
import { SKIN_IDS } from "../taste";
import { SKIN_WORDS } from "./colour-words";
import { FACETS, FACET_VALUES, layoutOf, type Facet, type Layout, type SearchState, type Sort } from "./query";

/** one searchable style: the exact style plus what it inherits from its screen */
export type Item = Style & {
  /** composition pattern (primary) of the screen, e.g. "focal-mass" */
  pattern: string;
  layout: Layout;
  recipe: string;
  included: boolean;
  /** the screen number: t146 -> 146 (newest screens have the highest) */
  n: number;
  /** words of the free-text haystack with a weight each; matched by prefix */
  fields: { w: number; words: string[] }[];
};

const TASTE = new Map(TASTES.map((t) => [t.id, t]));
const INCLUDED_KEYS = new Set(INCLUDED.map((i) => i.key));
const split = (s: string): string[] => [...new Set([s, ...s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)])];

/** the item of a style, or null when its screen is unknown */
export function itemOf(s: Style): Item | null {
  const t = TASTE.get(s.screen);
  if (!t) return null;
  const comp = COMPOSITION_OF[s.screen];
  const layout = layoutOf(t.composition);
  const pattern = comp?.primary ?? "";
  const fonts = s.fonts.display === s.fonts.body ? [s.fonts.display] : [s.fonts.display, s.fonts.body];
  const included = INCLUDED_KEYS.has(s.key);
  return {
    ...s, pattern, layout, recipe: t.recipe, included,
    n: Number(/^t(\d+)/.exec(s.screen)?.[1] ?? 0),
    fields: [
      { w: 6, words: split(s.skin) },
      { w: 5, words: fonts.flatMap(split) },
      { w: 4, words: [layout, ...split(t.composition)] },
      { w: 4, words: split(t.recipe) },
      { w: 4, words: [pattern, comp?.secondary ?? ""].flatMap(split).filter(Boolean) },
      { w: 4, words: SKIN_WORDS[s.skin] ?? [] },
      { w: 3, words: [...split(s.screen), String(Number(/^t(\d+)/.exec(s.screen)?.[1] ?? 0))] },
      { w: 2, words: ["r" + s.radius, "radius", String(s.radius), ...(included ? ["included"] : [])] },
    ],
  };
}

/** the corpus: the given styles (the Discovery wall) plus every included style, one item per key, in the order given (wall first) */
export function buildCorpus(styles: readonly Style[]): Item[] {
  const seen = new Set<string>();
  const out: Item[] = [];
  const add = (s: Style | null) => {
    if (!s || seen.has(s.key)) return;
    const it = itemOf(s);
    if (!it) return;
    seen.add(s.key);
    out.push(it);
  };
  for (const s of styles) add(s);
  for (const i of INCLUDED) { const p = parseStyleKey(i.key); add(p ? { key: i.key, screen: p.screen, skin: p.skin, fonts: p.fonts, radius: p.radius } : null); }
  return out;
}

/** query words: lower case, split on anything that is not a letter or digit */
export const queryTokens = (q: string): string[] => q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Relevance of one item for the tokens: every token must match some word (prefix match); per token the best field weight, doubled for an
 * exact word. 0 when a token matches nothing (the item is out), > 0 otherwise. No tokens: 1.
 */
export function relevance(item: Item, tokens: readonly string[]): number {
  if (!tokens.length) return 1;
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const f of item.fields) {
      for (const w of f.words) {
        if (w === t) { best = Math.max(best, f.w * 2); break; }
        if (w.startsWith(t)) best = Math.max(best, f.w);
      }
    }
    if (!best) return 0;
    total += best;
  }
  return total;
}

/** similarity of every item to the picks: the recommender's score (null when no pick is a valid style) */
export function similarityScores(items: readonly Item[], picks: readonly StyleKey[]): Map<string, number> | null {
  const profile = profileOf(picks);
  if (!profile.picks.length) return null;
  return new Map(items.map((i) => [i.key, scoreStyle(i, profile).score]));
}

export type Ctx = { hearted: ReadonlySet<string>; similar: ReadonlyMap<string, number> | null };
export type Counts = { [F in Facet]: Map<string | number, number> };
export type Outcome = { results: Item[]; facets: Counts; included: number; hearted: number; sort: Sort; total: number };

/** the sort that applies: the asked one when it can work, else relevance with a query, similarity with picks, else skin */
export function effectiveSort(s: SearchState, hasPicks: boolean): Sort {
  if (s.sort === "relevance" && s.q) return "relevance";
  if (s.sort === "similar" && hasPicks) return "similar";
  if (s.sort === "skin" || s.sort === "newest") return s.sort;
  return s.q ? "relevance" : hasPicks ? "similar" : "skin";
}

const SKIN_ORDER = new Map<string, number>(SKIN_IDS.map((k, i) => [k, i]));
const byKey = (a: Item, b: Item): number => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

const valuesOf = (it: Item, f: Facet): (string | number)[] => {
  switch (f) {
    case "skin": return [it.skin];
    case "font": return it.fonts.display === it.fonts.body ? [it.fonts.display] : [it.fonts.display, it.fonts.body];
    case "radius": return [it.radius];
    case "pattern": return [it.pattern];
    case "layout": return [it.layout];
    case "recipe": return [it.recipe];
  }
};

/**
 * Filter, count and sort. A facet's counts ignore that facet's own selection (so its other values show what selecting them would give)
 * and obey every other filter, the query, "included only" and "hearted only". The same for the two toggles.
 */
export function runSearch(items: readonly Item[], s: SearchState, ctx: Ctx): Outcome {
  const tokens = queryTokens(s.q);
  const sel = FACETS.map((f) => (s[f].length ? new Set<string | number>(s[f] as (string | number)[]) : null));
  const counts = Object.fromEntries(FACETS.map((f) => [f, new Map<string | number, number>((FACET_VALUES[f] as readonly (string | number)[]).map((v) => [v, 0]))])) as Counts;
  const BIT_Q = 1 << FACETS.length, BIT_INC = BIT_Q << 1, BIT_HEART = BIT_INC << 1;
  let incCount = 0, heartCount = 0;
  const hits: { it: Item; rel: number }[] = [];
  for (const it of items) {
    let mask = 0;
    let rel = 1;
    for (let i = 0; i < FACETS.length; i++) {
      const set = sel[i];
      if (!set) continue;
      const v = valuesOf(it, FACETS[i]!);
      if (!v.some((x) => set.has(x))) mask |= 1 << i;
    }
    if (tokens.length) { rel = relevance(it, tokens); if (!rel) mask |= BIT_Q; }
    if (s.included && !it.included) mask |= BIT_INC;
    if (s.hearted && !ctx.hearted.has(it.key)) mask |= BIT_HEART;
    // a facet counts the item when the item passes everything except possibly that facet
    for (let i = 0; i < FACETS.length; i++) {
      if (mask & ~(1 << i)) continue;
      const m = counts[FACETS[i]!];
      for (const x of valuesOf(it, FACETS[i]!)) m.set(x, (m.get(x) ?? 0) + 1);
    }
    if (!(mask & ~BIT_INC) && it.included) incCount++;
    if (!(mask & ~BIT_HEART) && ctx.hearted.has(it.key)) heartCount++;
    if (mask === 0) hits.push({ it, rel });
  }
  const sort = effectiveSort(s, !!ctx.similar);
  const sim = (it: Item) => ctx.similar?.get(it.key) ?? 0;
  hits.sort((a, b) => {
    let d = 0;
    if (sort === "relevance") d = b.rel - a.rel || sim(b.it) - sim(a.it) || b.it.n - a.it.n;
    else if (sort === "similar") d = sim(b.it) - sim(a.it) || b.it.n - a.it.n;
    else if (sort === "skin") d = (SKIN_ORDER.get(a.it.skin) ?? 0) - (SKIN_ORDER.get(b.it.skin) ?? 0) || b.it.n - a.it.n;
    else d = b.it.n - a.it.n || (SKIN_ORDER.get(a.it.skin) ?? 0) - (SKIN_ORDER.get(b.it.skin) ?? 0);
    return d || byKey(a.it, b.it);
  });
  return { results: hits.map((h) => h.it), facets: counts, included: incCount, hearted: heartCount, sort, total: items.length };
}
