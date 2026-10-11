// The Design system playground as pure functions: the overrides (skin, font, radius) on top of a style's own parts give the effective
// design, whether it differs from the style, and the key "Save as collection item" would create.
import { styleKey, type StyleParts } from "@ui8kit/taste-data/picks";
import { RADII } from "@ui8kit/taste-data/taste";

export type Overrides = { skin: string | null; font: string | null; radius: number | null };
export const NO_OVERRIDES: Overrides = { skin: null, font: null, radius: null };

export function effective(parts: StyleParts, o: Overrides) {
  const skin = o.skin ?? parts.skin;
  const fonts = o.font ? { display: o.font, body: o.font } : parts.fonts;
  const radius = o.radius !== null && (RADII as readonly number[]).includes(o.radius) ? o.radius : parts.radius;
  const changed = skin !== parts.skin || fonts.display !== parts.fonts.display || fonts.body !== parts.fonts.body || radius !== parts.radius;
  return { skin, fonts, radius, changed, key: styleKey({ screen: parts.screen, skin, fonts, radius }) };
}
