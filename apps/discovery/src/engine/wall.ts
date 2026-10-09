// The wall the panorama shows: assign.ts over every card, then the curated rows (curated.ts) refilled by curate.ts,
// then the excluded screens (curated.ts) removed from every row the same way (the other screens of the row stay).
import { CURATED_ROWS, EXCLUDED_SCREENS, type CuratedRow } from "../curated";
import type { Taste, Variant } from "../taste";
import { assign } from "./assign";
import { curate } from "./curate";
import { rowFromTop, type Card } from "./grid";

export function wall(cards: Card[], tastes: Taste[]): Variant[] {
  const curated = curate(cards, assign(cards, tastes), tastes, CURATED_ROWS);
  if (!EXCLUDED_SCREENS.length) return curated;
  const bad = new Set(EXCLUDED_SCREENS);
  const rows = new Map<number, Set<string>>();
  const hit = new Set<number>();
  for (const c of cards) {
    const r = rowFromTop(c.row);
    if (!rows.has(r)) rows.set(r, new Set());
    if (bad.has(curated[c.index]!.screen)) hit.add(r);
    else rows.get(r)!.add(curated[c.index]!.screen);
  }
  const extra: CuratedRow[] = [...hit].sort((a, b) => a - b).map((row) => ({ row, keep: [...rows.get(row)!] }));
  return curate(cards, curated, tastes, extra);
}
