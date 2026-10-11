// Skin distance in OKLab (plan/MAGAZINE.md §5): dC(a, b) = ½(ΔE(primary) + ΔE(background)) + 0.25·ΔE(accent), averaged over the
// light and the dark theme, normalised to 0..1 by the largest distance between two skins.
import { SKIN_COLORS, type Lab, type SkinPalette } from "../skin-colors";
import { SKIN_IDS, type SkinId } from "../taste";
import { ACCENT_WEIGHT } from "./weights";

const de = (a: Lab, b: Lab): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const raw = (a: SkinPalette, b: SkinPalette): number => 0.5 * (de(a.primary, b.primary) + de(a.background, b.background)) + ACCENT_WEIGHT * de(a.accent, b.accent);

const rawSkin = (a: SkinId, b: SkinId): number => 0.5 * (raw(SKIN_COLORS[a].light, SKIN_COLORS[b].light) + raw(SKIN_COLORS[a].dark, SKIN_COLORS[b].dark));

const MAX = Math.max(...SKIN_IDS.flatMap((a) => SKIN_IDS.map((b) => rawSkin(a, b))));
const TABLE = new Map<string, number>(SKIN_IDS.flatMap((a) => SKIN_IDS.map((b) => [`${a}|${b}`, rawSkin(a, b) / MAX] as const)));

/** the normalised distance between two skins, 0 (same) .. 1 (the farthest pair) */
export const skinDistance = (a: string, b: string): number => TABLE.get(`${a}|${b}`) ?? 1;
