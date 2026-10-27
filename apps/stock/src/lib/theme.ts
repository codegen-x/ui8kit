// The Theme of Stock: the global theme model the Magazine uses too (@ui8kit/theme-model/global-theme: skin, font, radius,
// per-element tokens, the light/dark mode of @ui8kit/app-shared), kept under Stock's own key. Applied to the document root, so
// every live preview (and the storefront around it) follows it.
import { applyTheme, initTheme } from "@ui8kit/app-shared/runtime/theme";
import { family, type FontId } from "@ui8kit/taste-data/fonts";
import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
import { RADII, SKIN_IDS } from "@ui8kit/taste-data/taste";
import type { StockText, ThemeField } from "@ui8kit/layouts/stock/text";
import { densityOf, DENSITIES, NO_THEME, readTheme, rootAttrs, rootStyle, setDensity, setThemeField, writeTheme, type GlobalTheme } from "@ui8kit/theme-model/global-theme";

const KEY = "stock:v1:theme";
/** localStorage, or null where it is blocked */
const store = ((): Storage | null => { try { return localStorage; } catch { return null; } })();

export type Mode = "light" | "dark";
export type ThemeState = { mode: Mode; theme: GlobalTheme };

export function loadTheme(): ThemeState {
  initTheme("dark");
  return { mode: document.documentElement.dataset.theme === "light" ? "light" : "dark", theme: readTheme(KEY, store) };
}

let applied: string[] = [];
/** the theme on <html>: data-skin and the density attributes, --radius and the font variables (CSSOM) */
export function applyState(s: ThemeState): void {
  const root = document.documentElement;
  try { localStorage.setItem("codegen-x-theme", s.mode); } catch { /* storage blocked */ }
  applyTheme(s.mode);
  for (const a of applied) root.removeAttribute(a);
  const attrs = rootAttrs(s.theme);
  applied = Object.keys(attrs);
  for (const [k, v] of Object.entries(attrs)) root.setAttribute(k, v);
  for (const p of ["--radius", "--font-sans", "--taste-heading"]) root.style.removeProperty(p);
  for (const decl of rootStyle(s.theme, (id) => family(id as FontId)).split(";").filter(Boolean)) {
    const at = decl.indexOf(":");
    root.style.setProperty(decl.slice(0, at), decl.slice(at + 1));
  }
  writeTheme(KEY, s.theme, store);
}

export function setField(s: ThemeState, id: string, value: string): ThemeState {
  if (id === "mode") return { ...s, mode: value === "light" ? "light" : "dark" };
  if (id === "density") return { ...s, theme: { ...s.theme, tokens: setDensity(s.theme.tokens, (DENSITIES as readonly string[]).includes(value) ? (value as (typeof DENSITIES)[number]) : "default") } };
  const v = value === "" ? null : id === "radius" ? Number(value) : value;
  return { ...s, theme: setThemeField(s.theme, id, v) };
}
export const resetTheme = (s: ThemeState): ThemeState => ({ ...s, theme: NO_THEME });

/** the fields of the sheet in the current language (skin and font names are names, not translated) */
export function themeFields(s: ThemeState, t: StockText): ThemeField[] {
  const unset = { id: "", label: t.theme.unset };
  const dens: Record<string, string> = { compact: t.theme.compact, default: t.theme.standard, comfortable: t.theme.comfortable };
  return [
    { id: "mode", label: t.theme.mode, control: "radio", value: s.mode, options: [{ id: "light", label: t.theme.light }, { id: "dark", label: t.theme.dark }] },
    { id: "skin", label: t.theme.skin, control: "select", value: s.theme.skin ?? "", options: [unset, ...SKIN_IDS.map((id) => ({ id, label: id }))] },
    { id: "font", label: t.theme.font, control: "select", value: s.theme.font ?? "", options: [unset, ...FONT_IDS.map((id) => ({ id, label: id }))] },
    { id: "radius", label: t.theme.radius, control: "radio", value: s.theme.radius === null ? "" : String(s.theme.radius), options: [unset, ...RADII.map((r) => ({ id: String(r), label: String(r) }))] },
    { id: "density", label: t.theme.density, control: "radio", value: densityOf(s.theme.tokens) ?? "default", options: DENSITIES.map((d) => ({ id: d, label: dens[d] ?? d })) },
  ];
}
