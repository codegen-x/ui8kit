// The Theme of Stock: the global theme model the Magazine uses too (@ui8kit/theme-model/global-theme: skin, font, radius,
// per-element tokens, the light/dark mode of @ui8kit/app-shared), kept under Stock's own key. Applied to the document root, so
// every live preview (and the storefront around it) follows it.
import { loadSkinFonts, loadThemeFonts } from "@ui8kit/app-shared/runtime/skins";
import { applyTheme, initTheme } from "@ui8kit/app-shared/runtime/theme";
import { themeFamily } from "@ui8kit/app-shared/runtime/theme-fonts";
import { SKIN_IDS } from "@ui8kit/taste-data/taste";
import { fromConfig, NO_THEME, patchTheme, readTheme, rootAttrs, rootStyle, setThemeField, toConfig, writeTheme, type FieldValue, type GlobalTheme, type ImportResult, type ThemeConfig } from "@ui8kit/theme-model/global-theme";

const KEY = "stock:v1:theme";
/** localStorage, or null where it is blocked */
const store = ((): Storage | null => { try { return localStorage; } catch { return null; } })();

export type Mode = "light" | "dark";
export type ThemeState = { mode: Mode; theme: GlobalTheme };

/** the skin a link names: `skin=<id>` in the query of any hash (`#/search?type=screen&skin=sky`); an unknown id is no skin (null) */
export function skinOfHash(hash: string): string | null {
  const at = hash.indexOf("?");
  if (at < 0) return null;
  const id = new URLSearchParams(hash.slice(at + 1)).get("skin");
  return id !== null && (SKIN_IDS as readonly string[]).includes(id) ? id : null;
}
/** the hash without its `skin` parameter, the other parameters untouched (no parameters left: no "?") */
export function hashWithoutSkin(hash: string): string {
  const at = hash.indexOf("?");
  if (at < 0) return hash;
  const rest = hash.slice(at + 1).split("&").filter((kv) => kv !== "" && decodeURIComponent(kv.split("=")[0] ?? "") !== "skin");
  return hash.slice(0, at) + (rest.length ? "?" + rest.join("&") : "");
}
/** the state with the skin of the hash, when it names one: the link beats the stored skin (a skin pick drops the custom palette, like the Theme sheet's);
 *  the same state back when the hash names none or the skin is already on */
export function withHashSkin(s: ThemeState, hash: string): ThemeState {
  const skin = skinOfHash(hash);
  return skin === null || skin === s.theme.skin ? s : { ...s, theme: patchTheme(s.theme, { skin }) };
}
/** a skin picked by hand (the Theme sheet) takes `skin=` out of the address, so a reload does not bring the link's skin back (the same as the skin picker of app-shared) */
export function dropHashSkin(): void {
  try {
    const next = hashWithoutSkin(location.hash);
    if (next !== location.hash) history.replaceState(history.state, "", location.pathname + location.search + next);
  } catch { /* no history */ }
}

export function loadTheme(hash: string = location.hash): ThemeState {
  initTheme("dark");
  return withHashSkin({ mode: document.documentElement.dataset.theme === "light" ? "light" : "dark", theme: readTheme(KEY, store) }, hash);
}

let applied: string[] = [];
/** the root properties the last theme set: the next one removes them first (radius, fonts, tokens, palette, type scale, width) */
let appliedProps: string[] = [];
/** the theme on <html>: data-skin and the density attributes, --radius, the font variables, the custom palette's colour tokens for the mode, the type scale (--text-*) and width (font-stretch) (CSSOM); `keep` stores it (the frame
 *  document of the detail page only reads: the page that holds the Theme sheet writes) */
export function applyState(s: ThemeState, keep = true): void {
  const root = document.documentElement;
  if (keep) try { localStorage.setItem("codegen-x-theme", s.mode); } catch { /* storage blocked */ }
  applyTheme(s.mode);
  for (const a of applied) root.removeAttribute(a);
  const attrs = rootAttrs(s.theme);
  applied = Object.keys(attrs);
  for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, v);
  if (s.theme.skin) loadSkinFonts(s.theme.skin);
  loadThemeFonts([s.theme.font, s.theme.headingFont].filter((id): id is string => id !== null));
  for (const p of appliedProps) root.style.removeProperty(p);
  appliedProps = [];
  for (const decl of rootStyle(s.theme, themeFamily, s.mode).split(";").filter(Boolean)) {
    const at = decl.indexOf(":");
    root.style.setProperty(decl.slice(0, at), decl.slice(at + 1));
    appliedProps.push(decl.slice(0, at));
  }
  if (keep) writeTheme(KEY, s.theme, store);
}

/** the theme with one field (global-theme FIELDS) set by its id; null clears it; "mode" is the app's light/dark mode */
export function setField(s: ThemeState, id: string, v: FieldValue | null): ThemeState {
  if (id === "mode") return v === "light" || v === "dark" ? { ...s, mode: v } : s;
  return { ...s, theme: setThemeField(s.theme, id, v) };
}
/** back to the defaults (the mode stays: it is the visitor's choice) */
export const resetTheme = (s: ThemeState): ThemeState => ({ ...s, theme: NO_THEME });
/** the config of the whole state, and a state from a config (the mode only when the config names one) */
export const exportConfig = (s: ThemeState): ThemeConfig => toConfig(s);
export function importConfig(s: ThemeState, input: unknown): { state: ThemeState; result: ImportResult } {
  const result = fromConfig(input);
  return { state: result.ok ? { mode: result.mode ?? s.mode, theme: result.theme } : s, result };
}
