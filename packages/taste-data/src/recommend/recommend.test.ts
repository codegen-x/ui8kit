import { describe, expect, test } from "bun:test";
import { COMPOSITION_OF } from "../compositions";
import { CURATED_ROWS, EXCLUDED_SCREENS, EXCLUDED_SCREENS_2 } from "../curated";
import { type StyleKey } from "../picks";
import { SKIN_IDS, variantKey } from "../taste";
import { TASTES } from "../tastes";
import { skinDistance } from "./colour";
import { recommend, ROW_ORDER, colourTerm, fontMatch, patternMatch, profileOf, scoreStyle, styleOf, WEIGHTS } from "./index";

const taste = (id: string) => TASTES.find((t) => t.id === id)!;
const ownKey = (id: string): StyleKey => variantKey({ screen: id, skin: taste(id).skin, fonts: taste(id).fonts, radius: taste(id).radius });
const excluded = new Set([...EXCLUDED_SCREENS, ...EXCLUDED_SCREENS_2]);
/** ten exact styles from the screens one curated row kept (the screens the user chose by hand), in their own taste */
const picksOfRow = (i: number): StyleKey[] => CURATED_ROWS[i]!.keep.filter((id) => !excluded.has(id)).slice(0, 10).map(ownKey);
const PICKS = picksOfRow(1);
const darkPurple = (): StyleKey[] => {
  const ids = TASTES.filter((t) => t.skin === "violet-bloom" || t.skin === "t3-chat" || t.skin === "cosmic-night").slice(0, 10).map((t) => t.id);
  return ids.map(ownKey);
};

describe("weights", () => {
  test("the seven weights sum to 1", () => expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10));
});

describe("skin distance", () => {
  test("zero for the same skin, symmetric, normalised to a maximum of 1", () => {
    let max = 0;
    for (const a of SKIN_IDS) {
      expect(skinDistance(a, a)).toBe(0);
      for (const b of SKIN_IDS) {
        expect(skinDistance(a, b)).toBeCloseTo(skinDistance(b, a), 12);
        max = Math.max(max, skinDistance(a, b));
      }
    }
    expect(max).toBeCloseTo(1, 12);
  });
  test("colour term: the picks' own skin is closer than a far one", () => {
    const p = profileOf(darkPurple());
    expect(colourTerm("violet-bloom", p)).toBeGreaterThan(colourTerm("amber-minimal", p));
    expect(colourTerm("violet-bloom", p)).toBeGreaterThan(colourTerm("sky", p));
  });
});

describe("terms", () => {
  test("font: pair 1, display 0.7, body 0.5, same category 0.3, else 0", () => {
    const f = (display: string, body: string) => ({ display, body });
    expect(fontMatch(f("inter", "roboto"), f("inter", "roboto"))).toBe(1);
    expect(fontMatch(f("inter", "onest"), f("inter", "roboto"))).toBe(0.7);
    expect(fontMatch(f("manrope", "roboto"), f("inter", "roboto"))).toBe(0.5);
    expect(fontMatch(f("manrope", "onest"), f("inter", "roboto"))).toBe(0.3);
    expect(fontMatch(f("nunito", "onest"), f("inter", "roboto"))).toBe(0);
  });
  test("pattern: primary 1, crossed 0.6, secondary 0.3, weak halves", () => {
    const p = (primary: any, secondary?: any, weak?: true) => ({ primary, secondary, note: "", ...(weak ? { weak } : {}) });
    expect(patternMatch(p("diagonal"), p("diagonal"))).toBe(1);
    expect(patternMatch(p("diagonal", "radial"), p("cross", "diagonal"))).toBe(0.6);
    expect(patternMatch(p("diagonal", "radial"), p("cross", "radial"))).toBe(0.3);
    expect(patternMatch(p("diagonal"), p("cross"))).toBe(0);
    expect(patternMatch(p("diagonal", undefined, true), p("diagonal"))).toBe(0.5);
    expect(patternMatch(undefined, p("diagonal"))).toBe(0);
  });
  test("every term of every candidate is within 0..1", () => {
    const profile = profileOf(PICKS);
    for (const t of TASTES.slice(0, 40)) {
      const r = scoreStyle(styleOf(ownKey(t.id))!, profile);
      for (const v of Object.values(r.terms)) expect(v >= 0 && v <= 1).toBe(true);
      expect(r.score >= 0 && r.score <= 1).toBe(true);
    }
  });
  test("a pick scores 1 on its own exact term set where it is the pick", () => {
    const profile = profileOf(PICKS);
    const r = scoreStyle(styleOf(PICKS[0]!)!, profile);
    expect(r.terms.font).toBe(1);
    expect(r.terms.pattern).toBe(1);
  });
});

describe("recommend", () => {
  const rows = recommend(PICKS);
  const cards = rows.flatMap((r) => r.cards);

  test("deterministic: the same picks give identical rows", () => {
    expect(JSON.stringify(recommend(PICKS))).toBe(JSON.stringify(rows));
  });
  test("rows alternate screens, fonts, skins, screens, radii, compositions, twice", () => {
    expect(rows.map((r) => r.kind)).toEqual([...ROW_ORDER, ...ROW_ORDER]);
    expect(rows.map((r) => r.cycle)).toEqual([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  });
  test("row sizes: six cards, five radii", () => {
    for (const r of rows) expect(r.cards.length).toBe(r.kind === "radii" ? 5 : 6);
  });
  test("picks are never recommended back", () => {
    const picked = new Set(PICKS);
    for (const c of cards) expect(picked.has(c.key)).toBe(false);
  });
  test("every card is a valid exact style of a screen that is not excluded", () => {
    for (const c of cards) {
      expect(styleOf(c.key)).not.toBeNull();
      expect(excluded.has(c.screen)).toBe(false);
      expect(variantKey(c as never)).toBe(c.key);
    }
  });
  test("screens rows: no neighbour shares a screen or a skin, and a screen shows once in the feed", () => {
    const seen = new Set<string>();
    for (const r of rows.filter((r) => r.kind === "screens")) {
      for (let i = 0; i < r.cards.length; i++) {
        const c = r.cards[i]!;
        expect(seen.has(c.screen)).toBe(false);
        seen.add(c.screen);
        if (i) {
          expect(c.screen).not.toBe(r.cards[i - 1]!.screen);
          expect(c.skin).not.toBe(r.cards[i - 1]!.skin);
        }
      }
    }
  });
  test("font rows: one screen, single fonts (display = body), all different", () => {
    for (const r of rows.filter((r) => r.kind === "fonts")) {
      expect(new Set(r.cards.map((c) => c.screen)).size).toBe(1);
      expect(new Set(r.cards.map((c) => c.skin)).size).toBe(1);
      expect(new Set(r.cards.map((c) => c.fonts.display)).size).toBe(r.cards.length);
      for (const c of r.cards) expect(c.fonts.display).toBe(c.fonts.body);
    }
  });
  test("skin rows: one screen with its fonts and radius, six different skins", () => {
    for (const r of rows.filter((r) => r.kind === "skins")) {
      expect(new Set(r.cards.map((c) => c.screen)).size).toBe(1);
      expect(new Set(r.cards.map((c) => c.skin)).size).toBe(6);
    }
  });
  test("radii rows: one screen at 0, 4, 8, 12, 16", () => {
    for (const r of rows.filter((r) => r.kind === "radii")) {
      expect(new Set(r.cards.map((c) => c.screen)).size).toBe(1);
      expect(r.cards.map((c) => c.radius)).toEqual([0, 4, 8, 12, 16]);
    }
  });
  test("composition rows: one card per pattern, labelled by the pattern of its screen", () => {
    for (const r of rows.filter((r) => r.kind === "compositions")) {
      expect(new Set(r.cards.map((c) => c.label)).size).toBe(r.cards.length);
      for (const c of r.cards) expect(COMPOSITION_OF[c.screen]!.primary).toBe(c.label as never);
    }
  });
  test("every card says why: up to two terms", () => {
    for (const c of cards) { expect(c.why.length).toBeLessThanOrEqual(2); expect(c.why.length).toBeGreaterThan(0); }
  });
  test("fewer than one valid pick gives no rows", () => {
    expect(recommend([])).toEqual([]);
    expect(recommend(["junk"])).toEqual([]);
  });
  test("runs in well under 100 ms", () => {
    const t0 = performance.now();
    recommend(PICKS);
    expect(performance.now() - t0).toBeLessThan(100);
  });
});

describe("colour family of the top results", () => {
  // the picks of each curated row are screens the user chose by hand: the top screens of the feed must sit closer to them in colour
  // than skins taken at random would (the mean nearest-pick distance of the first screens row against that of all 15 skins)
  for (const [i, row] of CURATED_ROWS.entries()) {
    const picks = picksOfRow(i);
    if (picks.length < 10) continue;
    test(`curated row ${row.row} (layer ${row.layer ?? 1})`, () => {
      const skins = picks.map((k) => styleOf(k)!.skin);
      const near = (s: string) => Math.min(...skins.map((p) => skinDistance(s, p)));
      const top = recommend(picks)[0]!.cards;
      const topMean = top.reduce((n, c) => n + near(c.skin), 0) / top.length;
      const allMean = SKIN_IDS.reduce((n, s) => n + near(s), 0) / SKIN_IDS.length;
      expect(topMean).toBeLessThanOrEqual(allMean);
    });
  }
  test("ten violet / night picks: the skins row stays in the family", () => {
    const rows = recommend(darkPurple());
    const skins = rows.find((r) => r.kind === "skins")!.cards.map((c) => c.skin);
    expect(skins.slice(0, 3).some((s) => s === "violet-bloom" || s === "t3-chat" || s === "cosmic-night")).toBe(true);
    expect(skins).not.toContain("amber-minimal");
  });
});
