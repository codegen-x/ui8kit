// Stock's controller of the global theme for the shared Theme sheet (@ui8kit/layouts/theme, ThemeController of
// @ui8kit/theme-model/controller): the state (theme + mode, kept under Stock's own key by lib/theme.ts), whether the sheet and its
// wide panel (Design system, skin or font picker) are open, and the only ways the sheet changes them. App.svelte applies `stock.state` to the document.
import type { ThemeController, WidePanel } from "@ui8kit/theme-model/controller";
import { patchTheme } from "@ui8kit/theme-model/global-theme";
import { dropHashSkin, exportConfig, importConfig, loadTheme, resetTheme, setField, type ThemeState } from "./theme";

export const stock = $state<{ state: ThemeState; open: boolean; wide: WidePanel }>({ state: loadTheme(), open: false, wide: null });

export const themeCtl: ThemeController = {
  get value() { return stock.state.theme; },
  get mode() { return stock.state.mode; },
  get open() { return stock.open; },
  set open(v: boolean) { stock.open = v; },
  get wide() { return stock.wide; },
  set wide(v: WidePanel) { stock.wide = v; },
  // a skin chosen by hand takes the link's `skin=` out of the address (lib/theme.ts dropHashSkin)
  setTheme(patch) { if ("skin" in patch) dropHashSkin(); stock.state = { ...stock.state, theme: patchTheme(stock.state.theme, patch) }; },
  setField(id, v) { if (id === "skin") dropHashSkin(); stock.state = setField(stock.state, id, v); },
  reset() { dropHashSkin(); stock.state = resetTheme(stock.state); },
  exportConfig() { return exportConfig(stock.state); },
  importConfig(input) { const r = importConfig(stock.state, input); if (r.result.ok) dropHashSkin(); stock.state = r.state; return r.result; },
};
