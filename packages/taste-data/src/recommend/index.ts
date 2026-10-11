// The deterministic recommender of the magazine (plan/MAGAZINE.md §5-6): `recommend(picks)` returns the feed rows.
export { recommend, ROW_ORDER, type Card, type Row, type RowKind } from "./rows";
export { colourTerm, fontMatch, fontTerm, patternMatch, profileOf, radiusTerm, scoreStyle, screenInfo, styleOf, termsOf, type Fonts, type Profile, type Style, type Terms } from "./score";
export { skinDistance } from "./colour";
export * from "./weights";

import { recommend as feed } from "./rows";
import type { StyleKey } from "../picks";
import type { Card } from "./rows";

/** the styles nearest to one style (the score against this style alone): the first screens row of a feed built from it, six cards, never the style itself */
export const relatedOf = (key: StyleKey, n = 6): Card[] => feed([key], 1).find((r) => r.kind === "screens")?.cards.slice(0, n) ?? [];
export { WHY_TERMS, WHY_TEXT, whyLegend, whyLine, type WhyTerm } from "./why";
