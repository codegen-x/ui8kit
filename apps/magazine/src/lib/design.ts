// The Design system playground as pure functions: the overrides (skin, font, radius) on top of a style's own parts give the effective
// design, whether it differs from the style, and the key "Save as collection item" would create. The per-element tokens (kit CSS, UI8KIT-2.0 §11)
// are a second, flat map: only the keys that differ from the style's own values, so `{}` means "nothing changed". They are CSS variables and
// data attributes on a wrapper, never part of the style key.
import { styleKey, type StyleParts } from "@ui8kit/taste-data/picks";
import { RADII } from "@ui8kit/taste-data/taste";

export type Overrides = { skin: string | null; font: string | null; radius: number | null; tokens?: Tokens };
export const NO_OVERRIDES: Overrides = { skin: null, font: null, radius: null };

export const ELEMENTS = ["badge", "button", "card", "alert", "media"] as const;
export const SHADOW_ELEMENTS = ["card", "alert", "media"] as const;
export const DENSITY_ELEMENTS = ["badge", "button", "card", "alert"] as const;
export const DENSITIES = ["compact", "default", "comfortable"] as const;
export const SHADOWS = ["none", "sm", "md"] as const;
export type Density = (typeof DENSITIES)[number];
export type Shadow = (typeof SHADOWS)[number];
/** `radius-card`: 16, `density-button`: "comfortable", `shadow-card`: "sm" (only changed keys; absent = the style's own) */
export type Tokens = Record<string, number | string>;

const RADIUS_KEYS = ELEMENTS.map((e) => "radius-" + e);
const DENSITY_KEYS = DENSITY_ELEMENTS.map((e) => "density-" + e);
const SHADOW_KEYS = SHADOW_ELEMENTS.map((e) => "shadow-" + e);
/** the value a shadow position writes: the shared scale of the skin (var(--shadow-sm), var(--shadow-md)), or no shadow */
const SHADOW_VALUE: Record<Shadow, string> = { none: "0 0 #0000", sm: "var(--shadow-sm)", md: "var(--shadow-md)" };

const valid = (k: string, v: unknown): boolean =>
  RADIUS_KEYS.includes(k) ? typeof v === "number" && (RADII as readonly number[]).includes(v)
  : DENSITY_KEYS.includes(k) ? typeof v === "string" && v !== "default" && (DENSITIES as readonly string[]).includes(v)
  : SHADOW_KEYS.includes(k) ? typeof v === "string" && (SHADOWS as readonly string[]).includes(v)
  : false;

/** keep only known keys with a known, non-default value (density "default" is the style's own, so it is not stored) */
export function cleanTokens(t: unknown): Tokens {
  const out: Tokens = {};
  if (!t || typeof t !== "object" || Array.isArray(t)) return out;
  for (const k of [...RADIUS_KEYS, ...DENSITY_KEYS, ...SHADOW_KEYS]) {
    const v = (t as Record<string, unknown>)[k];
    if (valid(k, v)) out[k] = v as number | string;
  }
  return out;
}

/** set one key; null (or density "default") removes it, so the map holds only what differs */
export function setToken(t: Tokens, key: string, value: number | string | null): Tokens {
  const next = { ...t };
  delete next[key];
  return value === null ? cleanTokens(next) : cleanTokens({ ...next, [key]: value });
}

/** the CSS variables of the tokens, for the `style` attribute of a wrapper (`--radius-card:16px;--shadow-card:var(--shadow-sm)`) */
export function tokenStyle(t: Tokens): string {
  const c = cleanTokens(t);
  return Object.entries(c).flatMap(([k, v]) => {
    if (k.startsWith("radius-")) return [`--${k}:${v}px`];
    if (k.startsWith("shadow-")) return [`--${k}:${SHADOW_VALUE[v as Shadow]}`];
    return [];
  }).join(";");
}

/** the density attributes of the tokens (`data-density-card="comfortable"`), spread on the same wrapper */
export function tokenAttrs(t: Tokens): Record<string, string> {
  const c = cleanTokens(t);
  return Object.fromEntries(Object.entries(c).filter(([k]) => k.startsWith("density-")).map(([k, v]) => ["data-" + k, String(v)]));
}

export function effective(parts: StyleParts, o: Overrides) {
  const skin = o.skin ?? parts.skin;
  const fonts = o.font ? { display: o.font, body: o.font } : parts.fonts;
  const radius = o.radius !== null && (RADII as readonly number[]).includes(o.radius) ? o.radius : parts.radius;
  const tokens = cleanTokens(o.tokens);
  const changed = skin !== parts.skin || fonts.display !== parts.fonts.display || fonts.body !== parts.fonts.body || radius !== parts.radius || Object.keys(tokens).length > 0;
  return { skin, fonts, radius, tokens, changed, key: styleKey({ screen: parts.screen, skin, fonts, radius }) };
}

/** the preset JSON with the changed tokens, in a compact `tokens` object (omitted when nothing changed) */
export function withTokens<P extends object>(preset: P, tokens: Tokens): P & { tokens?: Tokens } {
  const c = cleanTokens(tokens);
  return Object.keys(c).length ? { ...preset, tokens: c } : preset;
}
