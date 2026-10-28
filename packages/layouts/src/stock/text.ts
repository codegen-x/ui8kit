// The texts of the Stock layouts: every visible or announced string comes in through props (rule 06); the app holds the
// dictionary as data (one file per locale) and hands the current one down. `fmt` fills {name} placeholders.
import type { ThemeSheetText } from "../theme/text";

export type StockText = {
  brand: string;
  /** `suggest`: the listbox of suggestions; `searchFor` the free-text row ({q}); `count` a row's result count ({n}); `asset` the
   *  group of asset rows; `hint` how to use the list (announced); `typeOption` an option of the type select ({type}, {n}) */
  search: { label: string; placeholder: string; submit: string; suggest: string; searchFor: string; count: string; asset: string; hint: string; typeOption: string };
  header: { actions: string; collections: string; compare: string; theme: string; locale: string; soon: string };
  filters: { region: string; types: string; all: string; quick: string };
  /** `find`: the field of a large facet ({facet}); `nomatch` none of its values matches ({q}) */
  facets: { region: string; title: string; toggle: string; draft: string; soft: string; more: string; less: string; hide: string; show: string; find: string; nomatch: string };
  /** `refine`: the row of narrowing suggestions; `tips` what to try when nothing matches; `clear` every filter off; `browse` the
   *  row of popular values under an empty result */
  results: {
    region: string; title: string; count: string; sort: string; empty: string; relax: string; variantsOf: string; showAll: string;
    refine: string; tips: string[]; clear: string; browse: string;
  };
  chips: { label: string; query: string; spec: string; remove: string; reset: string };
  pagination: { label: string; prev: string; next: string; page: string };
  card: { variants: string; loading: string; failed: string; none: string };
  /** the detail page of an asset (layouts/src/stock/detail) */
  detail: DetailText;
  /** the shared Theme sheet (@ui8kit/layouts/theme): its Theme panel, the Design system panel and its specimen */
  sheet: ThemeSheetText;
};

/** "{n} results" + { n: 12 } -> "12 results"; an unknown placeholder stays as it is */
export const fmt = (template: string, vars: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** a value of a facet as the layouts show it: label, count, selected, a draft label (hand-written) beside computed ones */
export type ValueView = { id: string; label: string; count: number; checked: boolean; draft?: boolean };
/** one facet group of the column */
export type FacetView = { id: string; label: string; ui: string; open: boolean; visible: number; draft: boolean; note: string; soft: boolean; values: ValueView[] };
/** a tab of the type bar ("" is every type) */
export type TypeView = { id: string; label: string; count: number };
/** a quick filter: one facet value promoted above the results */
export type QuickView = { facet: string; value: string; label: string; count: number; checked: boolean };
/** an applied filter as a chip */
export type ChipView = { key: string; label: string };
/** a way out of an empty result: drop this filter and get `count` */
export type RelaxView = { key: string; label: string; count: number };
/** what a card shows besides its preview; `href` opens its detail page */
export type CardView = { key: string; title: string; subtitle: string; kind: string; variants: number; spec: string; preview: boolean; href: string; meta?: string[] };
/** a row of the search suggestions: the free text as typed, a facet value to apply as a filter, or an asset to open */
export type SuggestView =
  | { key: string; kind: "query"; label: string; count: number }
  | { key: string; kind: "filter"; label: string; group: string; count: number; facet: string; value: string }
  | { key: string; kind: "asset"; label: string; group: string; href: string };
/** a value that narrows the current results (a related search): `count` of the current results carry it */
export type RefineView = { facet: string; value: string; label: string; group: string; count: number };

export type DetailText = {
  back: string;
  preview: {
    title: string; width: string; widths: Record<"desktop" | "tablet" | "phone", string>; mode: string; light: string; dark: string; frame: string; loading: string;
    /** the button that opens the full-screen preview, the dialog's name ({title}) and its close button */
    full: string; fullTitle: string; close: string;
    /** the segment of the full-screen preview that shows desktop and phone together */
    side: string;
  };
  summary: { facts: string; type: string; pattern: string; runtimes: string; blocks: string; variants: string; tags: string; findSimilar: string; actions: string };
  concepts: {
    title: string; lead: string; blocks: string; blocksNote: string; locate: string; variants: string; usedBy: string; unused: string; current: string;
    map: string; mapNote: string; pattern: string; patternNone: string; facets: string; future: string; futureNote: string; futureItems: string[];
  };
  passport: { title: string; facets: string; readonly: string; noLabel: string; any: string; draft: string; access: string; accessText: string };
  related: { pattern: string; blocks: string; usedBy: string; similar: string; none: string; patternNone: string };
  missing: { title: string; text: string };
};
/** a link of the passport: another asset (a block of the page, a variant, a screen page that uses the block); `asset` is its id */
export type PassportLink = { key: string; asset: string; title: string; subtitle: string; href: string; current?: boolean };
/** a facet of the asset with its labels; no values and not `any` is "no label" (never a fallback value) */
export type PassportFacet = { id: string; label: string; values: { id: string; label: string; draft: boolean }[]; any: boolean; draft: boolean };
/** a label of the asset as a way into the catalog: the storefront filtered by this value */
export type TagView = { key: string; label: string; href: string; draft: boolean };
/** a composition pattern of the asset with its definition in the current language (null: none written in it) */
export type PatternView = { id: string; label: string; definition: string | null; draft: boolean };
/** one row of the page map: a block of the page (a block variant: itself) top to bottom, with its first composition ("" none) */
export type MapRow = { key: string; title: string; subtitle: string; composition: string; compositionLabel: string };
/** a row of related assets: its heading, the cards, what to say when there are none */
export type RelatedView = { id: string; title: string; cards: CardView[]; none: string };
/** the detail page of an asset: `parts` are the blocks of a screen page or the variants of a block, `usedBy` the screen pages of a
 *  block, `facets` every label, `runtimes` what every asset renders in, `pattern` the composition-pattern facet (null: not of this
 *  type), `tags` the labels as links into the catalog, `map` the page map, `similarHref` the catalog with the asset's arrangement */
export type DetailView = {
  key: string; type: string; title: string; subtitle: string; kind: string; parts: PassportLink[]; usedBy: PassportLink[]; facets: PassportFacet[];
  runtimes: Option[]; pattern: PassportFacet | null; patterns: PatternView[]; concepts: PassportFacet[]; tags: TagView[]; map: MapRow[]; similarHref: string;
};
/** a width of the device frame */
export type DeviceView = { id: "desktop" | "tablet" | "phone"; width: number; height: number };
export type Option = { id: string; label: string };
