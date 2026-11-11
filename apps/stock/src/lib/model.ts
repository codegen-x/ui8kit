// The data model of Stock: the vocabulary and the index types come from @ui8kit/facet-search, what a card previews (one variant of a
// block, one page of a composed screen) and the preview recipes (content/previews.v0.json) from @ui8kit/layouts.
import type { Asset as AnyAsset, Index as AnyIndex } from "@ui8kit/facet-search/model";
import type { Text } from "@ui8kit/facet-search/model";
import type { PreviewRef } from "@ui8kit/layouts/preview/recipe";

export type { Clause, Facet, FacetUi, FacetValue, Locale, QuickFilter, Rule, SortDef, Text, Vocabulary } from "@ui8kit/facet-search/model";
export type { BlockRecipe, BlockUse, Recipes as Previews, ScreenRecipe, SpecValue } from "@ui8kit/layouts/preview/recipe";

export type Preview = PreviewRef;
/** a block variant names its registry item (`registry`: the kebab name of the organism that draws it, see src/lib/install.ts);
 *  `thumb`: its WebP picture relative to the app root (thumbs/<id>.webp?v=<sha8>, scripts/thumbs.ts), when one was captured */
export type Asset = AnyAsset<Preview> & { registry?: string; thumb?: string };
/** a facet every asset carries with the same labels (hidden from the filters: it does not discriminate), kept as a fact of all */
export type SharedFacet = { facet: string; label: Text; values: { id: string; label: Text }[] };
export type Index = Omit<AnyIndex<Preview>, "assets"> & { assets: Asset[]; shared?: SharedFacet[] };
