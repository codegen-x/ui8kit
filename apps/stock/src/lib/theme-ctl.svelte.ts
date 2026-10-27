// Stock's controller of the global theme for the shared Theme sheet (@ui8kit/layouts/theme, ThemeController of
// @ui8kit/theme-model/controller): the state (theme + mode, kept under Stock's own key by lib/theme.ts), whether the sheet and its
// Design system panel are open, and the only ways the sheet changes them. App.svelte applies `stock.state` to the document.
import type { ThemeController } from "@ui8kit/theme-model/controller";
import { exportConfig, importConfig, loadTheme, resetTheme, setField, type ThemeState } from "./theme";

export const stock = $state<{ state: ThemeState; open: boolean; wide: boolean }>({ state: loadTheme(), open: false, wide: false });

export const themeCtl: ThemeController = {
  get value() { return stock.state.theme; },
  get mode() { return stock.state.mode; },
  get open() { return stock.open; },
  set open(v: boolean) { stock.open = v; },
  get wide() { return stock.wide; },
  set wide(v: boolean) { stock.wide = v; },
  setTheme(patch) { stock.state = { ...stock.state, theme: { ...stock.state.theme, ...patch } }; },
  setField(id, v) { stock.state = setField(stock.state, id, v); },
  reset() { stock.state = resetTheme(stock.state); },
  exportConfig() { return exportConfig(stock.state); },
  importConfig(input) { const r = importConfig(stock.state, input); stock.state = r.state; return r.result; },
};
