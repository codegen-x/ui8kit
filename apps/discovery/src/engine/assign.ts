// Distribution of the taste screens over the 820 cards. Every screen appears once in its own taste (base) and fills the rest
// of the wall as variations: the same screen re-rendered with another skin, font pairing or radius. A greedy pass over the
// cards (top row first, left to right, deterministic PRNG) picks for each card the screen that clashes least with the
// cards already placed around it (same screen, composition, recipe or skin as a neighbour) and that has been used least;
// then a variation of it whose skin differs from every neighbour's. Every (screen, skin, fonts, radius) is used once.
import type { Card } from "./grid";
import { FONT_IDS, type FontId } from "../fonts";
import { RADII, SKIN_IDS, variantKey, type FontPair, type Radius, type SkinId, type Taste, type Variant } from "../taste";

/** the font pairings a variation may switch to (display + body); a pairing of one family means one family for both */
export const FONT_PAIRS: FontPair[] = [
  { display: "montserrat", body: "inter" },
  { display: "manrope", body: "manrope" },
  { display: "rubik", body: "nunito" },
  { display: "ibm-plex-sans", body: "ibm-plex-sans" },
  { display: "golos-text", body: "onest" },
  { display: "onest", body: "inter" },
  { display: "open-sans", body: "open-sans" },
  { display: "roboto", body: "roboto" },
  { display: "nunito", body: "nunito" },
  { display: "inter", body: "inter" },
  { display: "montserrat", body: "open-sans" },
  { display: "manrope", body: "ibm-plex-sans" },
  { display: "rubik", body: "rubik" },
  { display: "golos-text", body: "golos-text" },
  { display: "onest", body: "onest" },
  { display: "roboto", body: "open-sans" },
];

/** mulberry32: a small seeded PRNG so the wall is the same on every load */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** indices of the cards around `card` that come before it in placement order (left, wrap-around, the row above) */
function placedNeighbours(card: Card, all: Card[], rowStart: Map<number, number>): number[] {
  const out: number[] = [];
  if (card.col > 0) out.push(card.index - 1);
  if (card.col > 1) out.push(card.index - 2);
  // the row above in placement order is row + 1 (rows are placed from the top)
  const above = rowStart.get(card.row + 1);
  if (above !== undefined) {
    const n = all[above]!.perRow;
    const step = 360 / n;
    const pos = (((card.lon % 360) + 360) % 360) / step;
    for (const d of [-1, 0, 1, 2]) out.push(above + ((Math.floor(pos) + d + n) % n));
  }
  // the last cards of a row also touch its first ones
  if (card.col === card.perRow - 1) out.push(card.index - card.col, card.index - card.col + 1);
  return out;
}

/** a wider window of placed cards (four to the left, two rows above, three either side) where a repeat of a screen is
    still easy to spot: such repeats are penalised less than a direct neighbour but still avoided */
function placedWindow(card: Card, all: Card[], rowStart: Map<number, number>): number[] {
  const out: number[] = [];
  for (let d = 1; d <= 4; d++) out.push(card.index - card.col + ((card.col - d + card.perRow) % card.perRow));
  for (const up of [1, 2]) {
    const above = rowStart.get(card.row + up);
    if (above === undefined) continue;
    const n = all[above]!.perRow;
    const pos = Math.round((((card.lon % 360) + 360) % 360) / (360 / n));
    for (let d = -3; d <= 3; d++) out.push(above + ((pos + d + n) % n));
  }
  return out;
}

export function assign(cards: Card[], tastes: Taste[], seed = 20261008): Variant[] {
  const rnd = prng(seed);
  const byId = new Map(tastes.map((t) => [t.id, t]));
  const rowStart = new Map<number, number>();
  for (const c of cards) if (!rowStart.has(c.row)) rowStart.set(c.row, c.index);
  const used = new Set<string>();
  const usage = new Map<string, number>(tastes.map((t) => [t.id, 0]));
  const cap = Math.ceil(cards.length / tastes.length) + 1;
  const out: Variant[] = [];

  for (const card of cards) {
    const nb = placedNeighbours(card, cards, rowStart).filter((i) => i < out.length).map((i) => out[i]!);
    const nbSkins = new Set(nb.map((v) => v.skin));
    const win = placedWindow(card, cards, rowStart).filter((i) => i < out.length).map((i) => out[i]!.screen);
    const near = new Set(win);
    // screens share copy decks, so the same headline next to itself reads as a repeat too
    const nearDecks = new Set(win.map((id) => byId.get(id)!.deck));
    let best: Taste | null = null;
    let bestScore = Infinity;
    for (const t of tastes) {
      const u = usage.get(t.id)!;
      if (u >= cap) continue;
      let clash = (near.has(t.id) ? 40 : 0) + (nearDecks.has(t.deck) ? 20 : 0);
      for (const v of nb) {
        const o = byId.get(v.screen)!;
        if (o.id === t.id) clash += 100;
        if (o.composition === t.composition) clash += 6;
        if (o.recipe === t.recipe) clash += 4;
        if (v.skin === t.skin && u === 0) clash += 3;
      }
      const score = clash * 1000 + u * 10 + rnd();
      if (score < bestScore) { bestScore = score; best = t; }
    }
    const t = best!;
    const n = usage.get(t.id)!;
    usage.set(t.id, n + 1);
    let v: Variant | null = null;
    if (n === 0) v = { slot: card.index, screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius, base: true };
    for (let tries = 0; !v && tries < 400; tries++) {
      // a variation changes the skin (always, to a skin no neighbour wears) and, half of the time each, fonts and radius
      const skins = SKIN_IDS.filter((s) => s !== t.skin && !nbSkins.has(s));
      const skin: SkinId = skins[Math.floor(rnd() * skins.length)] ?? SKIN_IDS[Math.floor(rnd() * SKIN_IDS.length)]!;
      const fonts: FontPair = rnd() < 0.5 ? FONT_PAIRS[Math.floor(rnd() * FONT_PAIRS.length)]! : t.fonts;
      const radius: Radius = rnd() < 0.5 ? RADII[Math.floor(rnd() * RADII.length)]! : t.radius;
      const cand = { slot: card.index, screen: t.id, skin, fonts, radius, base: false };
      if (!used.has(variantKey(cand))) v = cand;
    }
    if (!v) throw new Error(`no free variation for ${t.id}`);
    used.add(variantKey(v));
    out.push(v);
  }
  return out;
}

/** a check used by the tests and the report: how many neighbouring pairs share a screen, a composition or a skin */
export function clashes(cards: Card[], variants: Variant[], tastes: Taste[]): { screen: number; composition: number; skin: number; pairs: number } {
  const byId = new Map(tastes.map((t) => [t.id, t]));
  const rowStart = new Map<number, number>();
  for (const c of cards) if (!rowStart.has(c.row)) rowStart.set(c.row, c.index);
  let screen = 0, composition = 0, skin = 0, pairs = 0;
  for (const card of cards) {
    const a = variants[card.index]!;
    const near = new Set<number>();
    if (card.col > 0) near.add(card.index - 1);
    const above = rowStart.get(card.row + 1);
    if (above !== undefined) {
      const n = cards[above]!.perRow;
      const pos = (((card.lon % 360) + 360) % 360) / (360 / n);
      near.add(above + (Math.round(pos) % n));
    }
    for (const i of near) {
      const b = variants[i]!;
      pairs++;
      if (a.screen === b.screen) screen++;
      if (byId.get(a.screen)!.composition === byId.get(b.screen)!.composition) composition++;
      if (a.skin === b.skin) skin++;
    }
  }
  return { screen, composition, skin, pairs };
}

export const fontsUsed = (vs: Variant[]): FontId[] => FONT_IDS.filter((f) => vs.some((v) => v.fonts.display === f || v.fonts.body === f));
