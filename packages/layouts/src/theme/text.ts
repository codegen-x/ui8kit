// The texts of the shared Theme sheet (theme-sheet.svelte and its panels), as data from the app: the Magazine passes its
// content/ui.json (theme, design, style), Stock its content/i18n/<locale>.json. Only the keys the sheet reads.
import type { Harmony } from "@ui8kit/theme-model/palette";
export type ThemeIoText = {
  title: string; note: string; label: string; placeholder: string; export: string; import: string;
  copied: string; copyFailed: string; imported: string; partial: string; invalid: string;
};
export type ThemePanelText = {
  title: string; note: string; mode: string; light: string; dark: string; skin: string; font: string; default: string; radius: string;
  resetRadius: string; densityAll: string; designSystem: string; hideDesignSystem: string; resetAll: string; close: string; back: string;
  dsTitle: string; dsNote: string; dsReset: string; io: ThemeIoText;
  /** the skin and font pickers (picker-panel): the select row's buttons, the panels' headings and notes, the faces' sample texts */
  browseSkins: string; browseFonts: string; skinsTitle: string; skinsNote: string; fontsTitle: string; fontsNote: string;
  sampleTitle: string; sampleText: string; sampleButton: string; sampleBadge: string; sampleCard: string; fontHeading: string; fontSub: string;
};
export type DesignText = {
  tokens: string; type: string; sample: string; radii: string; current: string; spacing: string; buttons: string; badges: string;
  primary: string; secondary: string; outline: string; ghost: string; destructive: string; small: string; large: string; disabled: string;
  cardTitle: string; cardText: string; alertInfo: string; alertOk: string; alertWarn: string; alertError: string; inputs: string;
  fieldName: string; fieldMail: string; fieldOff: string; placeholder: string; mailPlaceholder: string;
  elementRadius: string; elementDensity: string; elementShadow: string; follow: string; pill: string;
  elements: Record<string, string>; positions: Record<string, string>;
};
/** the colour wheel (palette-panel and its parts): headings, controls, the seven harmonies and the three sample cards */
export type PaletteText = {
  open: string; title: string; note: string; custom: string; reset: string; wheel: string;
  harmony: string; hue: string; saturation: string; lightness: string;
  /** the contrast level of the palette's text (AA 4.5:1 / AAA 7:1): heading, the two options, a note */
  contrast: { legend: string; aa: string; aaa: string; note: string };
  /** the Options card under the wheel: its heading; the primary field's label, hint and error */
  options: { title: string; primary: string; hint: string; error: string };
  harmonies: Record<Harmony, { name: string; hint: string }>;
  /** the well-known combinations under the tools (@ui8kit/theme-model/palette PRESETS): heading, note, a name per preset id */
  presets: { title: string; note: string; names: Record<string, string> };
  samples: {
    plan: string; price: string; per: string; feature: string; choose: string; popular: string;
    actions: string; primary: string; secondary: string; outline: string; chart: string;
    alertTitle: string; alertText: string; accent: string; muted: string;
  };
};
export type ThemeSheetText = {
  theme: ThemePanelText;
  design: DesignText;
  palette: PaletteText;
  /** the names of the two modes over the specimen's swatches */
  style: { light: string; dark: string };
};
