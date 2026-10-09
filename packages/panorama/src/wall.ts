// The wall the panorama shows: assign.ts over every card, then the curated rows (curated.ts) refilled by curate.ts,
// then the excluded screens (curated.ts) removed from every row the same way (the other screens of the row stay).
// The second wave of screens (wave.ts) is laid last, as a replacement layer.
// Later inboxes are laid as a second layer on top of the first, with their own seeds, so adding an exclusion never moves
// a card of an earlier layer: layer 2 = the curated rows marked `layer: 2` and EXCLUDED_SCREENS_2.
import { CURATED_ROWS, EXCLUDED_SCREENS, EXCLUDED_SCREENS_2, type CuratedRow } from "@ui8kit/taste-data/curated";
import type { Taste, Variant } from "@ui8kit/taste-data/taste";
import { assign } from "./assign";
import { curate } from "./curate";
import { rowFromTop, type Card } from "./grid";
import { isWave, wave } from "./wave";

/** every card showing a screen of `excluded` is refilled with a variation of the other screens of its row */
function exclude(cards: Card[], variants: Variant[], tastes: Taste[], excluded: string[], seed?: number): Variant[] {
  if (!excluded.length) return variants;
  const bad = new Set(excluded);
  const rows = new Map<number, Set<string>>();
  const hit = new Set<number>();
  for (const c of cards) {
    const r = rowFromTop(c.row);
    if (!rows.has(r)) rows.set(r, new Set());
    if (bad.has(variants[c.index]!.screen)) hit.add(r);
    else rows.get(r)!.add(variants[c.index]!.screen);
  }
  const extra: CuratedRow[] = [...hit].sort((a, b) => a - b).map((row) => ({ row, keep: [...rows.get(row)!] }));
  return curate(cards, variants, tastes, extra, seed);
}

export function wall(cards: Card[], allTastes: Taste[]): Variant[] {
  // the base wall is laid from the 120 screens of the first wave only (the new screens never move its cards), then wave.ts replaces some
  const tastes = allTastes.filter((t) => !isWave(t.id));
  const layer1 = exclude(cards, curate(cards, assign(cards, tastes), tastes, CURATED_ROWS.filter((r) => !r.layer)), tastes, EXCLUDED_SCREENS);
  const layer2Rows = CURATED_ROWS.filter((r) => r.layer === 2);
  const curated = curate(cards, layer1, tastes, layer2Rows, 20261010);
  return wave(cards, exclude(cards, curated, tastes, EXCLUDED_SCREENS_2, 20261011), allTastes);
}
