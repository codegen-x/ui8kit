// Colour words of a skin for the magazine search ("warm", "dark", "blue", ...). Pure, deterministic, derived from the skin's
// own tokens (skin-colors.ts: OKLab [L, a, b] of --primary, --background, --accent in light and dark). The mapping:
//
//   chroma C = hypot(a, b), hue h = atan2(b, a) in degrees 0..360, taken from the LIGHT-theme --primary (the skin's signature colour)
//
//   hue word of the primary (when C >= NEUTRAL_C = 0.03, else "neutral", "grey", "gray"):
//     [340, 360) and [0, 15)  -> pink          [15, 38)   -> red          [38, 80)   -> orange
//     [80, 110)               -> yellow        [110, 175) -> green        [175, 225) -> teal, cyan
//     [225, 275)              -> blue          [275, 325) -> purple, violet     [325, 340) -> pink, magenta
//   the --accent adds its own hue word too, but only when it is a real colour (C >= ACCENT_C = 0.08)
//   temperature (primary, only when not neutral): "warm" for h in [0, 120) or [340, 360), "cool" for the rest
//   lightness of the light-theme primary: L < DARK_L = 0.56 -> "dark" (and "deep"); L >= LIGHT_L = 0.70 -> "light" (and "pale")
//   saturation of the primary: C >= VIVID_C = 0.17 -> "vivid" (and "bright"); C < MUTED_C = 0.10 -> "muted" (and "soft")
//
// The words are only for the free-text search; the filters never read them.
import { SKIN_COLORS, type Lab } from "../skin-colors";
import { SKIN_IDS, type SkinId } from "../taste";

export const NEUTRAL_C = 0.03, ACCENT_C = 0.08, DARK_L = 0.56, LIGHT_L = 0.7, VIVID_C = 0.17, MUTED_C = 0.1;

const chroma = (l: Lab): number => Math.hypot(l[1], l[2]);
const hue = (l: Lab): number => ((Math.atan2(l[2], l[1]) * 180) / Math.PI + 360) % 360;

/** the hue words of one colour (empty when it is neutral) */
export function hueWords(l: Lab, minC: number = NEUTRAL_C): string[] {
  if (chroma(l) < minC) return [];
  const h = hue(l);
  if (h >= 340 || h < 15) return ["pink"];
  if (h < 38) return ["red"];
  if (h < 80) return ["orange"];
  if (h < 110) return ["yellow"];
  if (h < 175) return ["green"];
  if (h < 225) return ["teal", "cyan"];
  if (h < 275) return ["blue"];
  if (h < 325) return ["purple", "violet"];
  return ["pink", "magenta"];
}

/** every colour word of a skin (unique, in the order above); [] for an unknown skin */
export function colourWords(skin: string): string[] {
  const c = SKIN_COLORS[skin as SkinId];
  if (!c) return [];
  const p = c.light.primary;
  const out: string[] = [];
  if (chroma(p) < NEUTRAL_C) out.push("neutral", "grey", "gray");
  else {
    out.push(...hueWords(p));
    const h = hue(p);
    out.push(h < 120 || h >= 340 ? "warm" : "cool");
  }
  out.push(...hueWords(c.light.accent, ACCENT_C));
  if (p[0] < DARK_L) out.push("dark", "deep");
  if (p[0] >= LIGHT_L) out.push("light", "pale");
  if (chroma(p) >= VIVID_C) out.push("vivid", "bright");
  else if (chroma(p) < MUTED_C) out.push("muted", "soft");
  return [...new Set(out)];
}

/** the colour words of every skin, computed once */
export const SKIN_WORDS: Record<string, string[]> = Object.fromEntries(SKIN_IDS.map((s) => [s, colourWords(s)]));
