// The deterministic recommender of the magazine (plan/MAGAZINE.md §5-6): `recommend(picks)` returns the feed rows.
export { recommend, ROW_ORDER, type Card, type Row, type RowKind } from "./rows";
export { colourTerm, fontMatch, fontTerm, patternMatch, profileOf, radiusTerm, scoreStyle, screenInfo, styleOf, termsOf, type Fonts, type Profile, type Style, type Terms } from "./score";
export { skinDistance } from "./colour";
export * from "./weights";
