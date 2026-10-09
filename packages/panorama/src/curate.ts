// Curated rows: the user keeps some cards of one row and the rest of that row is refilled with variations of the kept
// screens. Only the refilled cards change; every other card of the wall (assign.ts) stays as it was.
// A refill card shows one of the kept screens with another skin (never the screen's own, never one a neighbour wears,
// and not one another card of the row already shows that screen in) and, half of the time each, another font pairing and
// radius. The screens are chosen with the weights of assign.ts: least clash with the cards around (same screen,
// composition, recipe; the same screen or copy deck a little further off), searched over the whole row, each kept screen
// filling at most its share of the row, so the refill spreads over the kept screens. Neighbours here look both ways (left and right on the row,
// wrap-around included, and the rows above and below), since the cards around are fixed. Deterministic (seeded PRNG).
import type { CuratedRow } from "@ui8kit/taste-data/curated";
import { FONT_PAIRS, placedNeighbours, placedWindow, prng } from "./assign";
import { rowFromBottom, type Card } from "./grid";
import { RADII, SKIN_IDS, variantKey, type FontPair, type Radius, type SkinId, type Taste, type Variant } from "@ui8kit/taste-data/taste";

/** both directions of a relation that assign.ts only knows towards already placed cards */
function symmetric(cards: Card[], of: (c: Card, all: Card[], rowStart: Map<number, number>) => number[]): Set<number>[] {
  const rowStart = new Map<number, number>();
  for (const c of cards) if (!rowStart.has(c.row)) rowStart.set(c.row, c.index);
  const out = cards.map(() => new Set<number>());
  for (const c of cards) {
    for (const j of of(c, cards, rowStart)) {
      if (j === c.index || j < 0 || j >= cards.length) continue;
      out[c.index]!.add(j);
      out[j]!.add(c.index);
    }
  }
  return out;
}

/** the cards of `row` (counted from the top) that show a kept screen, and the ones to refill */
export function rowSlots(cards: Card[], variants: Variant[], row: number, keep: string[]): { kept: number[]; refill: number[] } {
  const keepSet = new Set(keep);
  const inRow = cards.filter((c) => c.row === rowFromBottom(row));
  return {
    kept: inRow.filter((c) => keepSet.has(variants[c.index]!.screen)).map((c) => c.index),
    refill: inRow.filter((c) => !keepSet.has(variants[c.index]!.screen)).map((c) => c.index),
  };
}

export function curate(cards: Card[], variants: Variant[], tastes: Taste[], rows: CuratedRow[], seed = 20261009): Variant[] {
  if (!rows.length) return variants;
  const out = variants.slice();
  const byId = new Map(tastes.map((t) => [t.id, t]));
  const nbOf = symmetric(cards, placedNeighbours);
  const winOf = symmetric(cards, placedWindow);
  const rnd = prng(seed);

  for (const { row, keep } of rows) {
    const { kept, refill } = rowSlots(cards, out, row, keep);
    // the kept screens actually found on the row, in the order they were picked
    const present = new Set(kept.map((i) => out[i]!.screen));
    const sources = keep.filter((id, k) => present.has(id) && keep.indexOf(id) === k && byId.has(id)).map((id) => byId.get(id)!);
    if (!sources.length || !refill.length) continue;
    const pending = new Set(refill);
    const used = new Set(out.filter((_, i) => !pending.has(i)).map(variantKey));
    const usage = new Map(sources.map((t) => [t.id, 0]));
    const rowSkins = new Map(sources.map((t) => [t.id, new Set<SkinId>()]));
    for (const i of kept) {
      const v = out[i]!;
      usage.set(v.screen, usage.get(v.screen)! + 1);
      rowSkins.get(v.screen)!.add(v.skin);
    }

    // 1. the screens: a depth-first search over the refill cards (left to right) for the least total clash, each card
    //    counted against the fixed cards and the refill cards before it; a kept screen fills at most its share of the
    //    row (ceil(cards / kept screens)). Bounded by a node budget; the first leaf is the greedy fill.
    const cap = Math.max(1, Math.ceil((kept.length + refill.length) / sources.length));
    const screenAt = new Map<number, string>();
    const placed = (i: number) => !pending.has(i) || screenAt.has(i);
    const screenOfSlot = (i: number) => screenAt.get(i) ?? out[i]!.screen;
    const clashOf = (slot: number, t: Taste): number => {
      const win = [...winOf[slot]!].filter(placed).map(screenOfSlot);
      let clash = (win.includes(t.id) ? 40 : 0) + (win.some((id) => byId.get(id)!.deck === t.deck) ? 20 : 0);
      for (const i of nbOf[slot]!) {
        if (!placed(i)) continue;
        const o = byId.get(screenOfSlot(i))!;
        if (o.id === t.id) clash += 100;
        if (o.composition === t.composition) clash += 6;
        if (o.recipe === t.recipe) clash += 4;
      }
      return clash;
    };
    let best: string[] | null = null;
    let bestCost = Infinity;
    let budget = 200_000;
    const search = (k: number, cost: number): void => {
      if (k === refill.length) {
        if (cost < bestCost) { bestCost = cost; best = refill.map((i) => screenAt.get(i)!); }
        return;
      }
      const slot = refill[k]!;
      const options = sources
        .filter((t) => usage.get(t.id)! < cap)
        .map((t) => ({ t, c: clashOf(slot, t) }))
        .sort((a, b) => a.c - b.c || usage.get(a.t.id)! - usage.get(b.t.id)!);
      for (const { t, c } of options) {
        if (cost + c >= bestCost || budget-- <= 0) break;
        screenAt.set(slot, t.id);
        usage.set(t.id, usage.get(t.id)! + 1);
        search(k + 1, cost + c);
        usage.set(t.id, usage.get(t.id)! - 1);
        screenAt.delete(slot);
        if (bestCost === 0) return;
      }
    };
    search(0, 0);
    // no fill within the cap (cannot happen while cap × kept screens ≥ the row): fall back to the first kept screen
    refill.forEach((slot, k) => screenAt.set(slot, best?.[k] ?? sources[0]!.id));

    // 2. the skins (and fonts, radius), left to right, against every neighbour placed so far
    for (const slot of refill) {
      const nb = [...nbOf[slot]!].filter((i) => !pending.has(i)).map((i) => out[i]!);
      const nbSkins = new Set(nb.map((v) => v.skin));
      const t = byId.get(screenAt.get(slot)!)!;
      const own = rowSkins.get(t.id)!;
      const pools = [
        SKIN_IDS.filter((s) => s !== t.skin && !nbSkins.has(s) && !own.has(s)),
        SKIN_IDS.filter((s) => s !== t.skin && !nbSkins.has(s)),
        SKIN_IDS.filter((s) => s !== t.skin),
      ];
      let v: Variant | null = null;
      for (let tries = 0; !v && tries < 400; tries++) {
        // the strictest pool first; relax only when its variations are all taken elsewhere on the wall
        const tier = tries < 200 ? 0 : tries < 300 ? 1 : 2;
        const skins = pools.slice(tier).find((p) => p.length)!;
        const skin: SkinId = skins[Math.floor(rnd() * skins.length)]!;
        const fonts: FontPair = rnd() < 0.5 ? FONT_PAIRS[Math.floor(rnd() * FONT_PAIRS.length)]! : t.fonts;
        const radius: Radius = rnd() < 0.5 ? RADII[Math.floor(rnd() * RADII.length)]! : t.radius;
        const cand: Variant = { slot, screen: t.id, skin, fonts, radius, base: false };
        if (!used.has(variantKey(cand))) v = cand;
      }
      if (!v) throw new Error(`no free variation for ${t.id} on row ${row}`);
      used.add(variantKey(v));
      own.add(v.skin);
      out[slot] = v;
      pending.delete(slot);
    }
  }
  return out;
}
