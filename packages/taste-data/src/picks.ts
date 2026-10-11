// The picks of the magazine: how many exact styles unlock recommendations, and how a style travels in a URL.
// A pick is one exact Style, not just a screen: `screen|skin|display+body|radius`, the same string as variantKey() in taste.ts.
// Plain data and pure functions (no DOM), shared by Discovery (the link), the magazine (the reader) and the tests.
import { FONT_IDS } from "./font-ids";
import { RADII, SKIN_IDS, variantKey } from "./taste";
import { TASTES } from "./tastes";

/** recommendations unlock at exactly this many picks, never earlier (plan/MAGAZINE.md §12, decision 4) */
export const MIN_PICKS = 10;

/** `screen|skin|display+body|radius`, e.g. "t001-poster-mesh|cosmic-night|montserrat+inter|12" */
export type StyleKey = string;

export type StyleParts = { screen: string; skin: string; fonts: { display: string; body: string }; radius: number };

/** the key of a style (the same string as variantKey) */
export const styleKey = (p: Pick<StyleParts, "screen" | "skin" | "fonts" | "radius">): StyleKey =>
  variantKey(p as Parameters<typeof variantKey>[0]);

const SCREENS = new Set(TASTES.map((t) => t.id));
const SKINS = new Set<string>(SKIN_IDS);
const FONTS = new Set<string>(FONT_IDS);
const RADII_SET = new Set<number>(RADII);

/** the parts of a key, or null when it is not an exact style of this vocabulary (unknown screen, skin, font or radius) */
export function parseStyleKey(key: string): StyleParts | null {
  const m = /^([a-z0-9-]+)\|([a-z0-9-]+)\|([a-z0-9-]+)\+([a-z0-9-]+)\|(\d{1,2})$/.exec(key);
  if (!m) return null;
  const [, screen, skin, display, body, r] = m as unknown as [string, string, string, string, string, string];
  const radius = Number(r);
  if (!SCREENS.has(screen) || !SKINS.has(skin) || !FONTS.has(display) || !FONTS.has(body) || !RADII_SET.has(radius)) return null;
  return { screen, skin, fonts: { display, body }, radius };
}

/**
 * The value of `?picks=`: keys joined by "," with "|" written as "~" ("+" is kept; a query parser may read it back as a
 * space, so decodePicks accepts both). Characters are all URL-safe, so no percent-escaping is needed.
 */
export const encodePicks = (keys: readonly StyleKey[]): string => keys.map((k) => k.replace(/\|/g, "~")).join(",");

/**
 * The keys of a `picks` value, in order, deduped; anything that is not an exact style of this vocabulary is dropped.
 * Accepts the raw value or one already decoded by URLSearchParams ("+" turned into a space).
 */
export function decodePicks(value: string | null | undefined): StyleKey[] {
  if (!value) return [];
  const out: StyleKey[] = [];
  const seen = new Set<string>();
  for (const part of value.split(",")) {
    const key = part.trim().replace(/ /g, "+").replace(/~/g, "|");
    if (seen.has(key) || !parseStyleKey(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

/** the link from Discovery to the magazine, same origin: `/magazine/?picks=…` */
export const magazineUrl = (keys: readonly StyleKey[], base = "/magazine/"): string => `${base}?picks=${encodePicks(keys)}`;
