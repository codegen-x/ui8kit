// The ids of the fonts, apart from their files (fonts.ts imports the woff2 files through the bundler, so a plain runtime such as
// the unit tests reads the ids from here).
export const FONT_IDS = [
  "inter", "roboto", "manrope", "montserrat", "rubik", "nunito", "ibm-plex-sans", "golos-text", "onest", "open-sans", "istok-web",
] as const;
export type FontId = (typeof FONT_IDS)[number];

/** the Width axis (wdth, %) of the fonts that have one, as Google Fonts lists it (fonts.google.com/metadata/fonts: Roboto, Open Sans and
 *  IBM Plex Sans, 75..100, default 100; checked against the fvar table of the @fontsource-variable "wdth" files, which carry wght
 *  and wdth). The other fonts have no wdth axis (Inter: opsz and wght; Istok Web: static). Narrower only: 100 is the widest. */
export type WidthAxis = { min: number; max: number; default: number };
export const FONT_WIDTH: Partial<Record<FontId, WidthAxis>> = {
  roboto: { min: 75, max: 100, default: 100 },
  "open-sans": { min: 75, max: 100, default: 100 },
  "ibm-plex-sans": { min: 75, max: 100, default: 100 },
};
