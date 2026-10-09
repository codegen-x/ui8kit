// Wave 2 (screens t121 and up): the wall of the 120 base screens (assign + curate + exclude, see wall.ts) is laid first and
// stays as it is except for the cards this layer replaces with variations of the new screens. Rules:
//  - a card whose full style is in included.json is never touched, nor is a card showing a screen in its own taste (base);
//  - the cards replaced first are those whose screen repeats most and whose screen+skin fails the contrast measure most
//    (wave-contrast.json: failing axe color-contrast elements per screen+skin, from shots/discovery/contrast-measure.mjs);
//  - the new card shares no screen and no skin with a neighbour (two to either side, four above, and the ones below),
//    every screen+skin+fonts+radius of the wall stays unique, and a new screen is capped at WAVE_CAP cards;
//  - soft preferences: another composition, recipe and composition pattern than the neighbours, no repeat of a screen or copy
//    deck in the wider window. Deterministic (seeded PRNG), consumes nothing of the layers below.
import { patternOf } from "@ui8kit/taste-data/compositions";
import { INCLUDED } from "@ui8kit/taste-data/included";
import contrast from "@ui8kit/taste-data/wave-contrast.json";
import { FONT_PAIRS, placedNeighbours, placedWindow, prng } from "./assign";
import type { Card } from "./grid";
import { RADII, SKIN_IDS, variantKey, type FontPair, type Radius, type SkinId, type Taste, type Variant } from "@ui8kit/taste-data/taste";

/** screens of the second wave: t121 and up */
export const isWave = (id: string): boolean => Number(id.slice(1, 4)) >= 121;
export const WAVE_CAP = 12;
const FAILS = contrast as Record<string, number>;

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

/** the neighbours the wave enforces: those of assign.ts (both ways) plus, geometrically, two either side on the row (wrap-around
    included) and every card of the rows above and below within 12° of longitude */
function adjacency(cards: Card[]): Set<number>[] {
  const out = symmetric(cards, placedNeighbours);
  const byRow = new Map<number, Card[]>();
  for (const c of cards) (byRow.get(c.row) ?? byRow.set(c.row, []).get(c.row)!).push(c);
  for (const c of cards) {
    const row = byRow.get(c.row)!;
    for (const d of [-2, -1, 1, 2]) out[c.index]!.add(row[(c.col + d + row.length) % row.length]!.index);
    for (const dr of [-1, 1]) {
      for (const o of byRow.get(c.row + dr) ?? []) {
        const diff = Math.abs((((o.lon - c.lon) % 360) + 540) % 360 - 180);
        if (180 - diff <= 12) { out[c.index]!.add(o.index); out[o.index]!.add(c.index); }
      }
    }
  }
  for (const c of cards) for (const j of out[c.index]!) out[j]!.add(c.index);
  return out;
}

export function wave(cards: Card[], base: Variant[], tastes: Taste[], seed = 20261012): Variant[] {
  const news = tastes.filter((t) => isWave(t.id));
  if (!news.length) return base;
  const byId = new Map(tastes.map((t) => [t.id, t]));
  const out = base.slice();
  const nbOf = adjacency(cards);
  const winOf = symmetric(cards, placedWindow);
  const rnd = prng(seed);
  const included = new Set(INCLUDED.map((s) => s.key));
  const used = new Set(out.map(variantKey));
  const count = new Map<string, number>();
  for (const v of out) count.set(v.screen, (count.get(v.screen) ?? 0) + 1);
  const usage = new Map(news.map((t) => [t.id, 0]));
  const done = new Set<number>();

  const eligible = (i: number): boolean => !out[i]!.base && !included.has(variantKey(out[i]!)) && !isWave(out[i]!.screen);
  const priority = (i: number): number => {
    const v = out[i]!;
    return (FAILS[`${v.screen}|${v.skin}`] ?? 0) + 6 * (count.get(v.screen) ?? 0);
  };
  const order = cards.map((c) => c.index).filter(eligible);

  for (;;) {
    // the card of the highest priority that is still eligible; repeats shrink as cards are replaced
    let slot = -1;
    let best = -Infinity;
    for (const i of order) {
      if (done.has(i)) continue;
      const v = out[i]!;
      const worth = (FAILS[`${v.screen}|${v.skin}`] ?? 0) >= 3 || (count.get(v.screen) ?? 0) >= 7;
      if (!worth) continue;
      const p = priority(i);
      if (p > best) { best = p; slot = i; }
    }
    if (slot < 0) break;
    done.add(slot);

    const nb = [...nbOf[slot]!].map((j) => out[j]!);
    const nbScreens = new Set(nb.map((v) => v.screen));
    const nbSkins = new Set(nb.map((v) => v.skin));
    const win = [...winOf[slot]!].map((j) => byId.get(out[j]!.screen)!).filter(Boolean);
    const old = out[slot]!;
    let pick: { v: Variant; clash: number } | null = null;
    for (const t of news) {
      if (usage.get(t.id)! >= WAVE_CAP || nbScreens.has(t.id)) continue;
      const first = usage.get(t.id) === 0;
      let clash = (win.some((o) => o.id === t.id) ? 40 : 0) + (win.some((o) => o.deck === t.deck) ? 12 : 0);
      for (const v of nb) {
        const o = byId.get(v.screen);
        if (!o) continue;
        if (o.composition === t.composition) clash += 6;
        if (o.recipe === t.recipe) clash += 4;
        if (patternOf(o.id) && patternOf(o.id) === patternOf(t.id)) clash += 3;
      }
      clash += usage.get(t.id)! * 2;
      let v: Variant | null = null;
      if (first && !nbSkins.has(t.skin) && !used.has(variantKey({ screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius }))) {
        v = { slot, screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius, base: true };
      }
      for (let tries = 0; !v && tries < 60; tries++) {
        const skins = SKIN_IDS.filter((s) => s !== t.skin && !nbSkins.has(s));
        if (!skins.length) break;
        const skin: SkinId = skins[Math.floor(rnd() * skins.length)]!;
        const fonts: FontPair = rnd() < 0.6 ? FONT_PAIRS[Math.floor(rnd() * FONT_PAIRS.length)]! : t.fonts;
        const radius: Radius = rnd() < 0.6 ? RADII[Math.floor(rnd() * RADII.length)]! : t.radius;
        const cand: Variant = { slot, screen: t.id, skin, fonts, radius, base: false };
        if (!used.has(variantKey(cand))) v = cand;
      }
      if (!v) continue;
      const score = clash - (v.base ? 5 : 0) + rnd();
      if (!pick || score < pick.clash) pick = { v, clash: score };
    }
    if (!pick) continue;
    used.delete(variantKey(old));
    used.add(variantKey(pick.v));
    out[slot] = pick.v;
    count.set(old.screen, count.get(old.screen)! - 1);
    usage.set(pick.v.screen, usage.get(pick.v.screen)! + 1);
  }
  return out;
}
