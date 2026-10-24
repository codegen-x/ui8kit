// The global theme of the magazine (the Theme sheet, src/theme): one skin, font, default radius and per-element tokens for the whole
// site, from one place, on top of the defaults. Saved on this device (`magazine:v1:theme`); the light/dark mode is the app's own
// (`codegen-x-theme`, @ui8kit/app-shared runtime/theme).
//
// Precedence, from strongest:
//   1. a card's own design: every feed card and the style page show a style (screen + skin + font + radius, and on the style page its
//      Design system overrides). The frame of a style sets its own data-skin, --radius and fonts, and `.mg-own` (magazine.css) resets
//      the global per-element tokens at that boundary, so nothing global leaks into a style.
//   2. the global theme: data-skin, --radius, --font-sans and the tokens on the magazine root (.mg-root), inherited by the site chrome,
//      the sheets and the specimen.
//   3. the defaults: the kit's own values (the sky skin of the app CSS, var(--radius), the spec's padding and shadow).
// The two layers are stored apart (the feed tune in the address, the global theme here): changing one never rewrites the other.
import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
import { RADII, SKIN_IDS } from "@ui8kit/taste-data/taste";
import { cleanTokens, DENSITIES, DENSITY_ELEMENTS, setToken, tokenAttrs, tokenStyle, type Density, type Tokens } from "./design";

export const STORE_THEME = "magazine:v1:theme";
export type GlobalTheme = { skin: string | null; font: string | null; radius: number | null; tokens: Tokens };
export const NO_THEME: GlobalTheme = { skin: null, font: null, radius: null, tokens: {} };

/** a theme from anything (storage, JSON): unknown values become null, unknown tokens are dropped */
export function cleanTheme(v: unknown): GlobalTheme {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const skin = typeof o.skin === "string" && (SKIN_IDS as readonly string[]).includes(o.skin) ? o.skin : null;
  const font = typeof o.font === "string" && (FONT_IDS as readonly string[]).includes(o.font) ? o.font : null;
  const radius = typeof o.radius === "number" && (RADII as readonly number[]).includes(o.radius) ? o.radius : null;
  return { skin, font, radius, tokens: cleanTokens(o.tokens) };
}

export const isDefault = (t: GlobalTheme): boolean => t.skin === null && t.font === null && t.radius === null && Object.keys(t.tokens).length === 0;

/** localStorage, or null where there is none or it is blocked (reading the property itself throws then) */
const local = (): Storage | null => { try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; } };

export function readTheme(store: Pick<Storage, "getItem"> | null = local()): GlobalTheme {
  try { const raw = store?.getItem(STORE_THEME); return raw ? cleanTheme((JSON.parse(raw) as { theme?: unknown }).theme) : NO_THEME; } catch { return NO_THEME; }
}
export function writeTheme(t: GlobalTheme, store: Pick<Storage, "setItem" | "removeItem"> | null = local()): void {
  try { if (isDefault(t)) store?.removeItem(STORE_THEME); else store?.setItem(STORE_THEME, JSON.stringify({ v: 1, theme: cleanTheme(t) })); } catch { /* storage blocked: this visit only */ }
}

/** one density for every element that has one ("default" clears them) */
export function setDensity(tokens: Tokens, d: Density): Tokens {
  return DENSITY_ELEMENTS.reduce((t, e) => setToken(t, "density-" + e, d === "default" ? null : d), tokens);
}
/** the density shared by every element, or null when they differ */
export function densityOf(tokens: Tokens): Density | null {
  const v = DENSITY_ELEMENTS.map((e) => (tokens["density-" + e] as Density | undefined) ?? "default");
  return v.every((x) => x === v[0]) ? v[0]! : null;
}
export { DENSITIES };

/** the CSS variables of the root: radius, the one font (body and headings), the per-element tokens */
export function rootStyle(t: GlobalTheme, family: (id: string) => string): string {
  return [
    t.radius !== null ? `--radius:${t.radius}px` : "",
    t.font ? `--font-sans:${family(t.font)},sans-serif;--taste-heading:${family(t.font)},sans-serif` : "",
    tokenStyle(t.tokens),
  ].filter(Boolean).join(";");
}
/** the attributes of the root: the skin and the density attributes */
export function rootAttrs(t: GlobalTheme): Record<string, string> {
  return { ...(t.skin ? { "data-skin": t.skin } : {}), ...tokenAttrs(t.tokens) };
}
