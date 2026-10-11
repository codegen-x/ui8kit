// The search corpus: every exact style on the Discovery wall (820 cards, unique keys) plus the included styles that are not on it.
// The wall is laid by the same pure function Discovery and the sphere use, so the corpus is the wall without a canvas.
import { cards } from "@ui8kit/panorama/grid";
import { wall } from "@ui8kit/panorama/wall";
import { TASTES } from "@ui8kit/taste-data/tastes";
import { styleKey } from "@ui8kit/taste-data/picks";
import { buildCorpus, type Item } from "@ui8kit/taste-data/search";

let memo: Item[] | null = null;
export function corpus(): Item[] {
  if (!memo) memo = buildCorpus(wall(cards(), TASTES).map((v) => ({ key: styleKey(v), screen: v.screen, skin: v.skin, fonts: v.fonts, radius: v.radius })));
  return memo;
}
