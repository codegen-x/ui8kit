// The style score of plan/MAGAZINE.md §5: seven terms in 0..1 against the picks, weighted by weights.ts. Pure and deterministic.
import { COMPOSITION_OF, type Composition as PatternTag } from "../compositions";
import type { FontId } from "../font-ids";
import { INCLUDED } from "../included";
import { parseStyleKey, type StyleKey } from "../picks";
import { type Composition, type Recipe } from "../taste";
import { TASTES } from "../tastes";
import { skinDistance } from "./colour";
import { COLOUR_BLEND, FONT_SCORE, PATTERN_SCORE, RADIUS_SPAN, TERMS, WEIGHTS, type Term } from "./weights";

export type Fonts = { display: string; body: string };
/** one exact style */
export type Style = { key: StyleKey; screen: string; skin: string; fonts: Fonts; radius: number };

/** what a style inherits from its screen: layout family, image recipe, composition pattern */
export type ScreenInfo = { composition: Composition; recipe: Recipe; pattern?: PatternTag };
const SCREEN = new Map<string, ScreenInfo>(TASTES.map((t) => [t.id, { composition: t.composition, recipe: t.recipe, pattern: COMPOSITION_OF[t.id] }]));
export const screenInfo = (id: string): ScreenInfo | undefined => SCREEN.get(id);

const INCLUDED_KEYS = new Set(INCLUDED.map((s) => s.key));
export const isIncluded = (key: StyleKey): boolean => INCLUDED_KEYS.has(key);

export const styleOf = (key: StyleKey): Style | null => {
  const p = parseStyleKey(key);
  return p ? { key, screen: p.screen, skin: p.skin, fonts: p.fonts, radius: p.radius } : null;
};

/** the category of a font, for the weakest font match */
const ROUNDED = new Set<string>(["nunito", "rubik"] satisfies FontId[]);
const category = (f: string): string => (ROUNDED.has(f) ? "rounded" : "sans");

/** font term against one pick's pair: 1 same pair, 0.7 same display, 0.5 same body, else 0.3 for the same category of the display face */
export function fontMatch(a: Fonts, b: Fonts): number {
  if (a.display === b.display && a.body === b.body) return FONT_SCORE.pair;
  if (a.display === b.display) return FONT_SCORE.display;
  if (a.body === b.body) return FONT_SCORE.body;
  return category(a.display) === category(b.display) ? FONT_SCORE.category : 0;
}

/** pattern term against one pick: 1 primary = primary, 0.6 primary = secondary (either way), 0.3 secondary = secondary; a weak fit halves it */
export function patternMatch(a: PatternTag | undefined, b: PatternTag | undefined): number {
  if (!a || !b) return 0;
  let s = 0;
  if (a.primary === b.primary) s = PATTERN_SCORE.primary;
  else if (a.primary === b.secondary || a.secondary === b.primary) s = PATTERN_SCORE.cross;
  else if (a.secondary !== undefined && a.secondary === b.secondary) s = PATTERN_SCORE.secondary;
  return a.weak || b.weak ? s * PATTERN_SCORE.weak : s;
}

/** the picks, parsed once, with the numbers every candidate is compared with */
export type Profile = { picks: Style[]; infos: ScreenInfo[]; radiusMean: number; keys: Set<StyleKey> };

export function profileOf(keys: readonly StyleKey[]): Profile {
  const picks: Style[] = [];
  const seen = new Set<string>();
  for (const k of keys) {
    const s = styleOf(k);
    if (!s || seen.has(k) || !SCREEN.has(s.screen)) continue;
    seen.add(k);
    picks.push(s);
  }
  const infos = picks.map((p) => SCREEN.get(p.screen)!);
  const radiusMean = picks.length ? picks.reduce((n, p) => n + p.radius, 0) / picks.length : 0;
  return { picks, infos, radiusMean, keys: seen };
}

export type Terms = Record<Term, number>;

/** the skin term alone (it depends on the skin only) */
export function colourTerm(skin: string, profile: Profile): number {
  if (!profile.picks.length) return 0;
  const d = profile.picks.map((p) => skinDistance(skin, p.skin));
  const best = Math.min(...d);
  const mean = d.reduce((a, b) => a + b, 0) / d.length;
  return 1 - (COLOUR_BLEND.best * best + COLOUR_BLEND.mean * mean);
}
export const fontTerm = (fonts: Fonts, profile: Profile): number => Math.max(0, ...profile.picks.map((p) => fontMatch(fonts, p.fonts)));
export const radiusTerm = (radius: number, profile: Profile): number => Math.max(0, 1 - Math.abs(radius - profile.radiusMean) / RADIUS_SPAN);
export const patternTerm = (screen: string, profile: Profile): number => {
  const pat = SCREEN.get(screen)?.pattern;
  return Math.max(0, ...profile.infos.map((i) => patternMatch(pat, i.pattern)));
};
const share = (n: number, of: number): number => (of ? n / of : 0);

export function termsOf(s: Style, profile: Profile): Terms {
  const info = SCREEN.get(s.screen);
  return {
    colour: colourTerm(s.skin, profile),
    pattern: patternTerm(s.screen, profile),
    layout: info ? share(profile.infos.filter((i) => i.composition === info.composition).length, profile.infos.length) : 0,
    font: fontTerm(s.fonts, profile),
    radius: radiusTerm(s.radius, profile),
    recipe: info ? share(profile.infos.filter((i) => i.recipe === info.recipe).length, profile.infos.length) : 0,
    included: isIncluded(s.key) ? 1 : 0,
  };
}

export const weighted = (t: Terms): number => TERMS.reduce((n, k) => n + WEIGHTS[k] * t[k], 0);

/** score(s) = 0.30·colour + 0.20·pattern + 0.15·layout + 0.15·font + 0.10·radius + 0.05·recipe + 0.05·included, with the two terms that carry it */
export function scoreStyle(s: Style, profile: Profile): { score: number; terms: Terms; why: Term[] } {
  const terms = termsOf(s, profile);
  // the two terms that contribute most (ties by weight order), `included` only counts when nothing else does
  const why = TERMS.filter((k) => k !== "included" && terms[k] > 0).sort((a, b) => WEIGHTS[b] * terms[b] - WEIGHTS[a] * terms[a] || TERMS.indexOf(a) - TERMS.indexOf(b)).slice(0, 2);
  return { score: weighted(terms), terms, why };
}
