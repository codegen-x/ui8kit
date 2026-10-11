// The search state of the magazine and its URL form: `#/search?q=…&skin=a,b&font=…&radius=0,4&pattern=…&layout=…&recipe=…&theme=…&included=1&hearted=1&sort=…`.
// parseSearch is forgiving (unknown values are dropped, repeated and comma lists both work, order never matters) and
// stringifySearch is canonical (fixed key order, sorted values) so that equal searches give equal URLs.
import { FONT_IDS } from "../font-ids";
import { PATTERNS } from "../compositions";
import { COMPOSITIONS, RADII, RECIPES, SKIN_IDS } from "../taste";

/** layout families by their short names (the URL and the chips): composition ids full-bleed and dense-grid are fullbleed and dense */
export const LAYOUTS = ["poster", "split", "fullbleed", "editorial", "frame", "dense", "ribbon", "stats", "prompt", "airy"] as const;
export type Layout = (typeof LAYOUTS)[number];
const LAYOUT_OF: Record<(typeof COMPOSITIONS)[number], Layout> = { poster: "poster", split: "split", "full-bleed": "fullbleed", "dense-grid": "dense", airy: "airy", stats: "stats", ribbon: "ribbon", editorial: "editorial", frame: "frame", prompt: "prompt" };
export const layoutOf = (composition: string): Layout => LAYOUT_OF[composition as keyof typeof LAYOUT_OF];

export const SORTS = ["relevance", "similar", "skin", "newest"] as const;
export type Sort = (typeof SORTS)[number];
export const THEMES = ["light", "dark"] as const;
export type ThemeId = (typeof THEMES)[number];

/** the facets that are multi-select filters, in the order of the panel and the URL */
export const FACETS = ["skin", "font", "radius", "pattern", "layout", "recipe"] as const;
export type Facet = (typeof FACETS)[number];
export const FACET_VALUES: { [F in Facet]: readonly (string | number)[] } = {
  skin: SKIN_IDS, font: FONT_IDS, radius: RADII, pattern: PATTERNS, layout: LAYOUTS, recipe: RECIPES,
};

export type SearchState = {
  q: string;
  skin: string[]; font: string[]; radius: number[]; pattern: string[]; layout: string[]; recipe: string[];
  /** the preview theme of the cards: both or none selected means "follow the page" */
  theme: ThemeId[];
  included: boolean; hearted: boolean;
  /** null: the default for the situation (relevance with a query, else similarity when there are picks, else skin) */
  sort: Sort | null;
};

export const emptySearch = (): SearchState => ({ q: "", skin: [], font: [], radius: [], pattern: [], layout: [], recipe: [], theme: [], included: false, hearted: false, sort: null });

const list = (p: URLSearchParams, k: string): string[] => p.getAll(k).flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
const keep = <T extends string | number>(vals: string[], allowed: readonly T[]): T[] => {
  const out: T[] = [];
  for (const a of allowed) if (vals.includes(String(a))) out.push(a);
  return out; // canonical order = the order of the vocabulary
};

/** accepts `q=…&skin=…`, `?q=…`, `#/search?q=…` or a whole hash */
export function parseSearch(input: string): SearchState {
  const at = input.indexOf("?");
  const p = new URLSearchParams(at >= 0 ? input.slice(at + 1) : input.startsWith("#") ? "" : input);
  const s = emptySearch();
  s.q = (p.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  s.skin = keep(list(p, "skin"), FACET_VALUES.skin as readonly string[]);
  s.font = keep(list(p, "font"), FACET_VALUES.font as readonly string[]);
  s.radius = keep(list(p, "radius"), FACET_VALUES.radius as readonly number[]);
  s.pattern = keep(list(p, "pattern"), FACET_VALUES.pattern as readonly string[]);
  s.layout = keep(list(p, "layout"), FACET_VALUES.layout as readonly string[]);
  s.recipe = keep(list(p, "recipe"), FACET_VALUES.recipe as readonly string[]);
  s.theme = keep(list(p, "theme"), THEMES);
  s.included = p.get("included") === "1";
  s.hearted = p.get("hearted") === "1";
  const sort = p.get("sort");
  s.sort = (SORTS as readonly string[]).includes(sort ?? "") ? (sort as Sort) : null;
  return s;
}

/** the canonical query string (no leading "?"); "" for the empty search */
export function stringifySearch(s: SearchState): string {
  const parts: string[] = [];
  const add = (k: string, v: string) => parts.push(`${k}=${encodeURIComponent(v).replace(/%2C/gi, ",")}`);
  if (s.q) add("q", s.q);
  for (const f of FACETS) if (s[f].length) add(f, keep((s[f] as (string | number)[]).map(String), FACET_VALUES[f] as readonly (string | number)[]).join(","));
  if (s.theme.length) add("theme", s.theme.join(","));
  if (s.included) add("included", "1");
  if (s.hearted) add("hearted", "1");
  if (s.sort) add("sort", s.sort);
  return parts.join("&");
}

/** the hash of a search */
export const searchHash = (s: SearchState): string => { const q = stringifySearch(s); return "#/search" + (q ? "?" + q : ""); };

/** the effective preview theme: one selected theme wins, else null (follow the page) */
export const previewTheme = (s: SearchState): ThemeId | null => (s.theme.length === 1 ? s.theme[0]! : null);

/** how many things narrow the search (the query counts as one) */
export const activeCount = (s: SearchState): number => (s.q ? 1 : 0) + FACETS.reduce((n, f) => n + s[f].length, 0) + (s.theme.length === 1 ? 1 : 0) + (s.included ? 1 : 0) + (s.hearted ? 1 : 0);
