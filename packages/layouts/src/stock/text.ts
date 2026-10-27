// The texts of the Stock layouts: every visible or announced string comes in through props (rule 06); the app holds the
// dictionary as data (one file per locale) and hands the current one down. `fmt` fills {name} placeholders.
import type { ThemeSheetText } from "../theme/text";

export type StockText = {
  brand: string;
  search: { label: string; placeholder: string; submit: string };
  header: { actions: string; collections: string; compare: string; theme: string; locale: string; soon: string };
  filters: { region: string; types: string; all: string; quick: string };
  facets: { region: string; title: string; toggle: string; draft: string; soft: string; more: string; less: string };
  results: { region: string; title: string; count: string; sort: string; empty: string; relax: string; variantsOf: string; showAll: string };
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
export type CardView = { key: string; title: string; subtitle: string; kind: string; variants: number; spec: string; preview: boolean; href: string };

export type DetailText = {
  back: string;
  preview: { title: string; width: string; widths: Record<"desktop" | "tablet" | "phone", string>; mode: string; light: string; dark: string; frame: string; loading: string };
  passport: { title: string; blocks: string; variants: string; usedBy: string; unused: string; current: string; facets: string; readonly: string; noLabel: string; any: string; draft: string };
  similar: { title: string; none: string };
  missing: { title: string; text: string };
};
/** a link of the passport: another asset (a block of the page, a variant, a screen page that uses the block) */
export type PassportLink = { key: string; title: string; subtitle: string; href: string; current?: boolean };
/** a facet of the asset with its labels; no values and not `any` is "no label" (never a fallback value) */
export type PassportFacet = { id: string; label: string; values: { id: string; label: string; draft: boolean }[]; any: boolean; draft: boolean };
/** the detail page of an asset: `parts` are the blocks of a screen page or the variants of a block, `usedBy` the screen pages of a block */
export type DetailView = { key: string; type: string; title: string; subtitle: string; kind: string; parts: PassportLink[]; usedBy: PassportLink[]; facets: PassportFacet[] };
/** a width of the device frame */
export type DeviceView = { id: "desktop" | "tablet" | "phone"; width: number; height: number };
export type Option = { id: string; label: string };
