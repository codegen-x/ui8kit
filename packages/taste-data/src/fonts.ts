// The font palette of the tastes: Google fonts with both latin and cyrillic subsets, self-hosted from @fontsource-variable
// (the same faces as Google Fonts, variable weight axis, one file per subset). The taste screens are English, so a snapshot
// embeds the latin file only; the cyrillic file is registered for live pages (a future ru locale needs no other font).
import golosLatin from "@fontsource-variable/golos-text/files/golos-text-latin-wght-normal.woff2?url";
import golosCyr from "@fontsource-variable/golos-text/files/golos-text-cyrillic-wght-normal.woff2?url";
import plexLatin from "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url";
import plexCyr from "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-cyrillic-wght-normal.woff2?url";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import interCyr from "@fontsource-variable/inter/files/inter-cyrillic-wght-normal.woff2?url";
import manropeLatin from "@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url";
import manropeCyr from "@fontsource-variable/manrope/files/manrope-cyrillic-wght-normal.woff2?url";
import montserratLatin from "@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2?url";
import montserratCyr from "@fontsource-variable/montserrat/files/montserrat-cyrillic-wght-normal.woff2?url";
import nunitoLatin from "@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?url";
import nunitoCyr from "@fontsource-variable/nunito/files/nunito-cyrillic-wght-normal.woff2?url";
import onestLatin from "@fontsource-variable/onest/files/onest-latin-wght-normal.woff2?url";
import onestCyr from "@fontsource-variable/onest/files/onest-cyrillic-wght-normal.woff2?url";
import openSansLatin from "@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2?url";
import openSansCyr from "@fontsource-variable/open-sans/files/open-sans-cyrillic-wght-normal.woff2?url";
import robotoLatin from "@fontsource-variable/roboto/files/roboto-latin-wght-normal.woff2?url";
import robotoCyr from "@fontsource-variable/roboto/files/roboto-cyrillic-wght-normal.woff2?url";
import rubikLatin from "@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2?url";
import rubikCyr from "@fontsource-variable/rubik/files/rubik-cyrillic-wght-normal.woff2?url";

import { FONT_IDS, type FontId } from "./font-ids";
export { FONT_IDS, type FontId };

/** the files of a font: latin (embedded in snapshots) and cyrillic (registered for live pages) */
export const FONT_FILES: Record<FontId, { latin: string; cyrillic: string }> = {
  inter: { latin: interLatin, cyrillic: interCyr },
  roboto: { latin: robotoLatin, cyrillic: robotoCyr },
  manrope: { latin: manropeLatin, cyrillic: manropeCyr },
  montserrat: { latin: montserratLatin, cyrillic: montserratCyr },
  rubik: { latin: rubikLatin, cyrillic: rubikCyr },
  nunito: { latin: nunitoLatin, cyrillic: nunitoCyr },
  "ibm-plex-sans": { latin: plexLatin, cyrillic: plexCyr },
  "golos-text": { latin: golosLatin, cyrillic: golosCyr },
  onest: { latin: onestLatin, cyrillic: onestCyr },
  "open-sans": { latin: openSansLatin, cyrillic: openSansCyr },
};

/** the CSS family name of a font inside the app: `taste-<id>` (one name per id, so a snapshot and a live page agree) */
export const family = (id: FontId): string => `taste-${id}`;

export const LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
export const CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";

let registered = false;
/** register every face with the FontFace API (live pages: the screen route); snapshots embed their own copies */
export function registerFonts(): void {
  if (registered || typeof FontFace === "undefined") return;
  registered = true;
  for (const id of FONT_IDS) {
    for (const [file, range] of [[FONT_FILES[id].latin, LATIN], [FONT_FILES[id].cyrillic, CYRILLIC]] as const) {
      const face = new FontFace(family(id), `url(${file}) format("woff2")`, { weight: "100 900", unicodeRange: range, display: "swap" });
      document.fonts.add(face);
    }
  }
}
