// The feed of plan/MAGAZINE.md §6: rows that alternate, six cards each (a radii row has five):
//   screens by similarity → fonts → skins → screens → radii → compositions, then the same again with the next ranks.
// Pure and deterministic: the same picks give the same rows (ties break by key; no randomness); the picks themselves are never returned.
import { COMPOSITION_OF } from "../compositions";
import { EXCLUDED_SCREENS, EXCLUDED_SCREENS_2 } from "../curated";
import { FONT_IDS } from "../font-ids";
import { INCLUDED } from "../included";
import { type StyleKey } from "../picks";
import { RADII, SKIN_IDS, variantKey } from "../taste";
import { TASTES } from "../tastes";
import { colourTerm, fontTerm, profileOf, radiusTerm, scoreStyle, screenInfo, styleOf, type Profile, type Style } from "./score";
import { CYCLES, DIVERSITY_PENALTY, ROW_SIZE, TOP_RADII, TOP_SKINS, type Term } from "./weights";

export type RowKind = "screens" | "fonts" | "skins" | "radii" | "compositions";
export type Card = Style & { score: number; why: Term[]; /** compositions row: the pattern the card stands for */ label?: string };
export type Row = { kind: RowKind; /** which six-row cycle of the feed, from 0 */ cycle: number; cards: Card[] };

/** the order of the rows inside one cycle */
export const ROW_ORDER: readonly RowKind[] = ["screens", "fonts", "skins", "screens", "radii", "compositions"];

const EXCLUDED = new Set([...EXCLUDED_SCREENS, ...EXCLUDED_SCREENS_2]);
const SCREENS = TASTES.filter((t) => !EXCLUDED.has(t.id));
const byScore = (a: { score: number; key: string }, b: { score: number; key: string }): number => b.score - a.score || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

const keyOf = (screen: string, skin: string, display: string, body: string, radius: number): StyleKey => variantKey({ screen, skin, fonts: { display, body }, radius } as Parameters<typeof variantKey>[0]);

function card(s: Style, profile: Profile, label?: string): Card {
  const r = scoreStyle(s, profile);
  return { ...s, score: r.score, why: r.why, ...(label ? { label } : {}) };
}

/** every style the screens rows may show: per screen its own style plus its best skins × best radii on its own fonts, and every included style */
function candidates(profile: Profile): Card[] {
  const skins = [...SKIN_IDS].map((id) => ({ id, v: colourTerm(id, profile) })).sort((a, b) => b.v - a.v || (a.id < b.id ? -1 : 1)).slice(0, TOP_SKINS).map((s) => s.id);
  const radii = [...RADII].map((r) => ({ r, v: radiusTerm(r, profile) })).sort((a, b) => b.v - a.v || a.r - b.r).slice(0, TOP_RADII).map((s) => s.r);
  const seen = new Map<StyleKey, Card>();
  const add = (s: Style) => {
    if (profile.keys.has(s.key) || seen.has(s.key) || !screenInfo(s.screen) || EXCLUDED.has(s.screen)) return;
    seen.set(s.key, card(s, profile));
  };
  for (const t of SCREENS) {
    add({ key: keyOf(t.id, t.skin, t.fonts.display, t.fonts.body, t.radius), screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius });
    for (const skin of skins) for (const radius of radii) add({ key: keyOf(t.id, skin, t.fonts.display, t.fonts.body, radius), screen: t.id, skin, fonts: t.fonts, radius });
  }
  for (const i of INCLUDED) {
    const s = styleOf(i.key);
    if (s) add(s);
  }
  return [...seen.values()].sort(byScore);
}

/**
 * One row of screens: left to right the best card whose screen is not used yet, with DIVERSITY_PENALTY off a card that shares its
 * screen or skin with the card just placed (the rule of engine/curate.ts: no neighbour shares a screen or a skin).
 */
function screensRow(pool: Card[], used: Set<string>): Card[] {
  const row: Card[] = [];
  const left = pool.filter((c) => !used.has(c.screen));
  while (row.length < ROW_SIZE && left.length) {
    const prev = row[row.length - 1];
    let best = -1, bestV = -Infinity;
    for (let i = 0; i < left.length; i++) {
      const c = left[i]!;
      const v = c.score - (prev && (prev.screen === c.screen || prev.skin === c.skin) ? DIVERSITY_PENALTY : 0);
      if (v > bestV + 1e-12) { best = i; bestV = v; }
    }
    const pick = left.splice(best, 1)[0]!;
    row.push(pick);
    used.add(pick.screen);
    for (let i = left.length - 1; i >= 0; i--) if (left[i]!.screen === pick.screen) left.splice(i, 1);
  }
  return row;
}

/** the same screen in other single fonts (display = body), the closest to the picks' type first; k cycles through the ranking */
function fontsRow(ref: Card, profile: Profile, cycle: number): Card[] {
  const ranked = FONT_IDS.map((f) => ({ f, v: fontTerm({ display: f, body: f }, profile) })).sort((a, b) => b.v - a.v || (a.f < b.f ? -1 : 1));
  const start = (cycle * 4) % ranked.length;
  const out: Card[] = [];
  for (let i = 0; out.length < ROW_SIZE && i < ranked.length; i++) {
    const f = ranked[(start + i) % ranked.length]!.f;
    const key = keyOf(ref.screen, ref.skin, f, f, ref.radius);
    if (profile.keys.has(key)) continue;
    out.push(card({ key, screen: ref.screen, skin: ref.skin, fonts: { display: f, body: f }, radius: ref.radius }, profile));
  }
  return out;
}

/** the same screen in the skins nearest to the picks' colours */
function skinsRow(ref: Card, profile: Profile, cycle: number): Card[] {
  const ranked = [...SKIN_IDS].map((id) => ({ id, v: colourTerm(id, profile) })).sort((a, b) => b.v - a.v || (a.id < b.id ? -1 : 1));
  const out: Card[] = [];
  for (let i = 0; out.length < ROW_SIZE && i < ranked.length; i++) {
    const skin = ranked[(cycle * ROW_SIZE + i) % ranked.length]!.id;
    const key = keyOf(ref.screen, skin, ref.fonts.display, ref.fonts.body, ref.radius);
    if (profile.keys.has(key) || out.some((c) => c.skin === skin)) continue;
    out.push(card({ key, screen: ref.screen, skin, fonts: ref.fonts, radius: ref.radius }, profile));
  }
  return out;
}

/** the same screen at every radius, smallest first */
function radiiRow(ref: Card, profile: Profile): Card[] {
  return RADII.flatMap((radius) => {
    const key = keyOf(ref.screen, ref.skin, ref.fonts.display, ref.fonts.body, radius);
    return profile.keys.has(key) ? [] : [card({ key, screen: ref.screen, skin: ref.skin, fonts: ref.fonts, radius }, profile)];
  });
}

/** the best card of each composition pattern of the profile (the most common first), then of the other patterns; one screen each, labelled by pattern */
function compositionsRow(pool: Card[], profile: Profile, used: Set<string>): Card[] {
  const weight = new Map<string, number>();
  for (const i of profile.infos) {
    if (i.pattern) weight.set(i.pattern.primary, (weight.get(i.pattern.primary) ?? 0) + 1);
    if (i.pattern?.secondary) weight.set(i.pattern.secondary, (weight.get(i.pattern.secondary) ?? 0) + 0.5);
  }
  const all = [...new Set(Object.values(COMPOSITION_OF).map((c) => c.primary))];
  const order = [...all].sort((a, b) => (weight.get(b) ?? 0) - (weight.get(a) ?? 0) || (a < b ? -1 : 1));
  const out: Card[] = [];
  for (const pattern of order) {
    if (out.length >= ROW_SIZE) break;
    const best = pool.find((c) => COMPOSITION_OF[c.screen]?.primary === pattern && !used.has(c.screen));
    if (!best) continue;
    used.add(best.screen);
    out.push({ ...best, label: pattern });
  }
  return out;
}

/** the feed for the picks: `cycles` runs of the six rows; empty when no pick is a valid exact style */
export function recommend(picks: readonly StyleKey[], cycles: number = CYCLES): Row[] {
  const profile = profileOf(picks);
  if (!profile.picks.length) return [];
  const pool = candidates(profile);
  const used = new Set<string>();
  const rows: Row[] = [];
  for (let cycle = 0; cycle < cycles; cycle++) {
    const a = screensRow(pool, used);
    const b = screensRow(pool, used);
    if (!a.length) break;
    const refA = a[0]!;
    const refSkin = a[1] ?? a[0]!;
    const refB = b[0] ?? a[a.length - 1]!;
    rows.push({ kind: "screens", cycle, cards: a });
    rows.push({ kind: "fonts", cycle, cards: fontsRow(refA, profile, cycle) });
    rows.push({ kind: "skins", cycle, cards: skinsRow(refSkin, profile, cycle) });
    rows.push({ kind: "screens", cycle, cards: b });
    rows.push({ kind: "radii", cycle, cards: radiiRow(refB, profile) });
    rows.push({ kind: "compositions", cycle, cards: compositionsRow(pool, profile, used) });
  }
  return rows.filter((r) => r.cards.length);
}
