// The data model of Stock: the vocabulary and the index types come from @ui8kit/facet-search; what a card of Stock previews (one
// variant of a block, one page of a composed screen) and the preview recipes (content/previews.v0.json) are Stock's own.
import type { Asset as AnyAsset, Index as AnyIndex } from "@ui8kit/facet-search/model";

export type { Clause, Facet, FacetUi, FacetValue, Locale, QuickFilter, Rule, SortDef, Text, Vocabulary } from "@ui8kit/facet-search/model";

/** what a card renders: one variant of a block, one page (area) of a composed screen, optionally under a skin */
export type Preview =
  | { kind: "block"; block: string; variant: string; skin?: string }
  | { kind: "screen"; screen: string; area: string; skin?: string };

export type Asset = AnyAsset<Preview>;
export type Index = AnyIndex<Preview>;

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
