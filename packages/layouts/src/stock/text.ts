// The texts of the Stock layouts: every visible or announced string comes in through props (rule 06); the app holds the
// dictionary as data (one file per locale) and hands the current one down. `fmt` fills {name} placeholders.
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
  theme: { title: string; note: string; close: string; reset: string; mode: string; light: string; dark: string; skin: string; font: string; radius: string; density: string; unset: string; compact: string; standard: string; comfortable: string };
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
/** what a card shows besides its preview */
export type CardView = { key: string; title: string; subtitle: string; kind: string; variants: number; spec: string; preview: boolean };
export type Option = { id: string; label: string };
/** one setting of the theme sheet: radios for a few values, a select for many ("" is "not set") */
export type ThemeField = { id: string; label: string; control: "radio" | "select"; options: Option[]; value: string };
