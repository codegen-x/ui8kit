// The data model of Stock shared by the index builder (scripts/build-index.ts), the search engine and the storefront:
// the facet vocabulary (content/facets.v0.json), the assets of the index (content/assets.v0.json) and the preview recipes
// (content/previews.v0.json). Plain types, no code.

export type Locale = "en";
export type Text = Partial<Record<Locale, string>> & { en: string };

/** a clause of a derivation rule: the value applies when any listed key matches (see scripts/lib/build.ts, `matches`) */
export type Clause = {
  block?: string[];
  group?: string[];
  theme?: string[];
  axis?: Record<string, string[]>;
  slot?: string[];
  record?: string[];
  field?: string[];
  label?: string[];
  skin?: string[];
  colour?: string[];
  screen?: string[];
  area?: string[];
  facet?: Record<string, string[]>;
};
export type Rule = { any: Clause; not?: Clause };

export type FacetValue = {
  id: string;
  label: Text;
  synonyms?: Partial<Record<Locale, string[]>>;
  rules?: Rule[];
  /** a type that has no assets yet (the type bar shows it, disabled) */
  soon?: boolean;
};

export type FacetUi = "tabs" | "checkbox" | "chips" | "tiles" | "swatches" | "segments" | "toggle";

export type Facet = {
  id: string;
  label: Text;
  ui: FacetUi;
  order: number;
  /** shown expanded in the facet column */
  open?: boolean;
  /** values shown before "show N more" */
  visible?: number;
  /** shared facets survive a change of type; typed ones apply to `types` only */
  scope: "shared" | "typed";
  /** the asset types the facet applies to (all when absent) */
  types?: string[];
  source: "auto" | "weak" | "human" | "behavior" | "system";
  /** the labels are weak (not reviewed by a person): the storefront marks the facet as a draft */
  draft?: boolean;
  draftNote?: Text;
  /** soft facets rank the results (selected values first) and never filter */
  mode?: "soft";
  /** how labels are derived: rules of the values, or a named source */
  derive: string;
  /** the value given when no rule matched */
  fallback?: string;
  /** asset types that match every value (a block renders in any skin, at any radius) */
  wildcard?: string[];
  /** the values are generated from the sources (the skins, the values of an axis) */
  valuesFrom?: string;
  values: FacetValue[];
};

export type QuickFilter = { facet: string; value: string; label?: Text };
export type SortDef = { id: string; label: Text };
export type Vocabulary = { version: string; locales: Locale[]; facets: Facet[]; quick: QuickFilter[]; sorts: SortDef[] };

/** what a card renders: one variant of a block, one page (area) of a composed screen, optionally under a skin */
export type Preview =
  | { kind: "block"; block: string; variant: string; skin?: string }
  | { kind: "screen"; screen: string; area: string; skin?: string };

export type Asset = {
  /** unique: block.bento/even, section.bento-grid, screen.theme-commerce-shop/cart, skin.sky */
  id: string;
  type: string;
  /** the collapse key: the variants of one block share it */
  group: string;
  title: string;
  /** the second line of a card (the variant, the screen) */
  subtitle: string;
  /** the source spec (block.bento, screen.theme-commerce-shop, organism.bento-grid, skin.sky) */
  spec: string;
  variant?: string;
  /** the order of the catalog (by topic, then name, then variant) */
  order: number;
  /** facet id -> value ids ("*" = every value) */
  labels: Record<string, string[]>;
  /** the facets whose labels are weak (draft) for this asset */
  weak: string[];
  /** the facets that apply to the asset's type but gave it no label (what still needs labelling) */
  missing: string[];
  /** the free-text haystack, lower case, by weight */
  fields: { w: number; words: string[] }[];
  preview: Preview | null;
};

export type Index = {
  version: string;
  /** sha256 of the canonical JSON of the vocabulary and the assets */
  digest: string;
  counts: Record<string, number>;
  facets: Facet[];
  quick: QuickFilter[];
  sorts: SortDef[];
  assets: Asset[];
};

/** a value of a spec prop: a literal, a nested group, or a reference ({ "$": "ui.x.y" } or a data source name) */
export type SpecValue = string | number | boolean | null | SpecValue[] | { [k: string]: SpecValue };
export type BlockRecipe = {
  organism: string;
  alt?: { axis: string; values: string[]; organism: string };
  fit?: "section" | "card";
  defaults: Record<string, string>;
  sample: Record<string, SpecValue>;
  variants: { id: string; set: Record<string, string>; props?: Record<string, SpecValue> }[];
  data: { as: string; collection: string; fields: Record<string, string> }[];
  /** the prop names of every organism the block draws (a block with `alt` hands each organism only its own props) */
  orgProps: Record<string, string[]>;
};
export type BlockUse = { block: string; variant?: string; props?: Record<string, SpecValue> };
export type ScreenRecipe = { name: string; before: BlockUse[]; after: BlockUse[]; areas: Record<string, BlockUse[]> };
export type Previews = { version: string; blocks: Record<string, BlockRecipe>; screens: Record<string, ScreenRecipe> };
