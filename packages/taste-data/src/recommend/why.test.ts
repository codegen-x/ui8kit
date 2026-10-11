import { describe, expect, test } from "bun:test";
import { recommend, profileOf, scoreStyle, styleOf, whyLegend, whyLine, WHY_TERMS, WEIGHTS, TERMS } from "./index";

const PICKS = [
  "t071-poster-dots|bubblegum|montserrat+open-sans|0", "t094-dense-flat|amber-minimal|open-sans+open-sans|4", "t143-poster-stripes|neo-brutalism|montserrat+open-sans|0",
  "t053-fullbleed-geometric|bubblegum|onest+inter|4", "t033-fullbleed-rings|doom-64|onest+inter|16", "t081-poster-conic|neo-brutalism|onest+inter|8",
  "t053-fullbleed-geometric|amber-minimal|onest+inter|4", "t053-fullbleed-geometric|supabase|onest+inter|0", "t093-fullbleed-dots|sky|montserrat+inter|12",
  "t053-fullbleed-geometric|claude|onest+inter|8",
];

describe("whyLine", () => {
  test("words the two terms in plain English, first one capitalised", () => {
    expect(whyLine(["colour", "pattern"])).toBe("Close colour, same pattern");
    expect(whyLine(["font", "radius"])).toBe("Same font, similar corners");
    expect(whyLine(["layout", "recipe"])).toBe("Same layout, same imagery");
  });
  test("one term, no terms, never more than two, and `included` is never worded", () => {
    expect(whyLine(["colour"])).toBe("Close colour");
    expect(whyLine([])).toBe("");
    expect(whyLine(["colour", "pattern", "layout"])).toBe("Close colour, same pattern");
    expect(whyLine(["included", "font"])).toBe("Same font");
  });
  test("the legend lists every term once, in weight order, with a meaning", () => {
    const legend = whyLegend();
    expect(legend.map((l) => l.term)).toEqual([...WHY_TERMS]);
    expect([...WHY_TERMS]).toEqual(TERMS.filter((t) => t !== "included"));
    for (const l of legend) { expect(l.phrase.length).toBeGreaterThan(0); expect(l.meaning.length).toBeGreaterThan(8); }
    for (let i = 1; i < WHY_TERMS.length; i++) expect(WEIGHTS[WHY_TERMS[i - 1]!]).toBeGreaterThanOrEqual(WEIGHTS[WHY_TERMS[i]!]);
  });
});

describe("the why terms of recommended cards", () => {
  const rows = recommend(PICKS);
  const profile = profileOf(PICKS);
  test("every card has one or two terms, none is `included`, and they are the two largest contributions of the breakdown", () => {
    let n = 0;
    for (const row of rows) for (const c of row.cards) {
      n++;
      expect(c.why.length).toBeGreaterThanOrEqual(1);
      expect(c.why.length).toBeLessThanOrEqual(2);
      expect(c.why).not.toContain("included");
      const { terms } = scoreStyle(styleOf(c.key)!, profile);
      const top = [...WHY_TERMS].filter((k) => terms[k] > 0).sort((a, b) => WEIGHTS[b] * terms[b] - WEIGHTS[a] * terms[a] || TERMS.indexOf(a) - TERMS.indexOf(b)).slice(0, 2);
      expect(c.why).toEqual(top);
      expect(whyLine(c.why)).not.toBe("");
    }
    expect(n).toBeGreaterThan(30);
  });
  test("the line is deterministic for the same picks", () => {
    expect(rows.flatMap((r) => r.cards.map((c) => whyLine(c.why)))).toEqual(recommend(PICKS).flatMap((r) => r.cards.map((c) => whyLine(c.why))));
  });
});
