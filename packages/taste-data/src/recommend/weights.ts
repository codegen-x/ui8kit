// Every number of the recommender in one place (plan/MAGAZINE.md §5). Terms are 0..1, higher = closer to the picks.
export const WEIGHTS = {
  colour: 0.30,
  pattern: 0.20,
  layout: 0.15,
  font: 0.15,
  radius: 0.10,
  recipe: 0.05,
  included: 0.05,
} as const;
export type Term = keyof typeof WEIGHTS;
export const TERMS = Object.keys(WEIGHTS) as Term[];

/** colour = 1 − (BEST·nearest pick + MEAN·mean over picks) of the normalised skin distance */
export const COLOUR_BLEND = { best: 0.6, mean: 0.4 } as const;
/** ΔE(accent) counts a quarter of the primary/background mean in the skin distance */
export const ACCENT_WEIGHT = 0.25;
/** font term: same pair, same display, same body, else this share times a same-category hit */
export const FONT_SCORE = { pair: 1, display: 0.7, body: 0.5, category: 0.3 } as const;
/** pattern term: primary = primary, primary = other's secondary, secondary = secondary; a weak fit halves it */
export const PATTERN_SCORE = { primary: 1, cross: 0.6, secondary: 0.3, weak: 0.5 } as const;
/** the radius term spans the whole radius range (0..16 px) */
export const RADIUS_SPAN = 16;
/** a candidate that shares its screen or skin with the neighbour already placed loses this much */
export const DIVERSITY_PENALTY = 0.25;

/** cards per row (a radii row has one per radius) and how many six-row cycles the feed shows */
export const ROW_SIZE = 6;
export const CYCLES = 2;

/** candidates per screen: its own style, and the best skins and radii of the profile on its own fonts (the score is additive per axis) */
export const TOP_SKINS = 6;
export const TOP_RADII = 2;
