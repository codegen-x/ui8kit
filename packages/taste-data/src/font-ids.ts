// The ids of the fonts, apart from their files (fonts.ts imports the woff2 files through the bundler, so a plain runtime such as
// the unit tests reads the ids from here).
export const FONT_IDS = [
  "inter", "roboto", "manrope", "montserrat", "rubik", "nunito", "ibm-plex-sans", "golos-text", "onest", "open-sans",
] as const;
export type FontId = (typeof FONT_IDS)[number];
