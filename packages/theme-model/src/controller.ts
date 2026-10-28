// The controller of the global theme as the shared Theme sheet (@ui8kit/layouts/theme) sees it: what it reads (the theme, the app's
// light/dark mode, whether the sheet is open and which wide panel shows beside it) and the only ways it changes them. Each app keeps
// its own implementation (its storage key, its mode, its reactive state) and hands it to the sheet; this file is the contract only.
import type { FieldValue, GlobalTheme, ImportResult, Mode, ThemeConfig } from "./global-theme";

/** the wide panel beside the narrow Theme panel, one at a time: the Design system, the skin or font picker, or the palette (colour
 *  wheel); null: none */
export type WidePanel = null | "ds" | "skins" | "fonts" | "palette";

export interface ThemeController {
  /** the global theme now */
  readonly value: GlobalTheme;
  /** the app's light/dark mode now */
  readonly mode: Mode;
  /** the sheet (its narrow Theme panel) is open */
  open: boolean;
  /** the wide panel shown beside (or, on narrow screens, instead of) the Theme panel */
  wide: WidePanel;
  /** merge a patch into the theme and save it */
  setTheme(patch: Partial<GlobalTheme>): void;
  /** set one field (global-theme FIELDS) by its id; null clears it; "mode" switches the app's mode */
  setField(id: string, v: FieldValue | null): void;
  /** back to the defaults (the mode stays: it is the app's own choice) */
  reset(): void;
  /** the config of the whole state: every field */
  exportConfig(): ThemeConfig;
  /** replace the theme with a config (JSON text or object); the mode only when the config names one */
  importConfig(input: unknown): ImportResult;
}
