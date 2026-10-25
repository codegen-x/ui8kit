// The controller of the global theme (the model: lib/global-theme.ts): the one place that changes it. Loaded once from this device,
// saved on every change; every view (the Theme sheet's two panels, the style page's Design system tab) reads `gtheme` and writes
// through these functions, so they always show the same values. Also the Theme sheet's open state (narrow panel) and whether its
// wide Design system panel is shown. `window.__magazineTheme` is the same controller for scripts and future external configs.
import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
import { FIELDS, fromConfig, NO_THEME, readTheme, setThemeField, THEME_SCHEMA, toConfig, writeTheme, type FieldValue, type GlobalTheme, type ImportResult, type Mode, type ThemeConfig } from "./global-theme";
import { theme } from "./theme.svelte";

export const gtheme = $state<{ value: GlobalTheme; open: boolean; wide: boolean }>({ value: readTheme(), open: false, wide: false });

export function setTheme(patch: Partial<GlobalTheme>): void {
  gtheme.value = { ...gtheme.value, ...patch };
  writeTheme(gtheme.value);
}

/** the app's light/dark mode (kept by @ui8kit/app-shared under `codegen-x-theme`) */
export const currentMode = (): Mode => (theme.dark ? "dark" : "light");
export function setMode(m: Mode): void { if ((m === "dark") !== theme.dark) toggleTheme(); }

/** set one field of the model by its id (FIELDS); null clears it */
export function setField(id: string, v: FieldValue | null): void {
  if (id === "mode") { if (v === "light" || v === "dark") setMode(v); return; }
  setTheme(setThemeField(gtheme.value, id, v));
}

/** back to the defaults (the mode stays: it is the app's own choice) */
export function resetTheme(): void { setTheme(NO_THEME); }

/** the config of the whole state: every field */
export const exportConfig = (): ThemeConfig => toConfig({ mode: currentMode(), theme: gtheme.value });

/** replace the theme with a config (JSON text or object); the mode only when the config names one */
export function importConfig(input: unknown): ImportResult {
  const r = fromConfig(input);
  if (r.ok) { setTheme(r.theme); if (r.mode) setMode(r.mode); }
  return r;
}

if (typeof window !== "undefined") {
  (window as unknown as { __magazineTheme: unknown }).__magazineTheme = { schema: THEME_SCHEMA, fields: FIELDS, get: exportConfig, set: importConfig, setField, reset: resetTheme };
}
