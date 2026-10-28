import { describe, expect, test } from "bun:test";
import { AA, baseHueFor, cleanPalette, contrast, FOREGROUND_PAIRS, HARMONIES, harmonyColours, hueAt, OFFSETS, PALETTE_TOKENS, paletteTokens, type Hsl, type Palette } from "./palette";

const parse = (v: string): Hsl => { const m = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(v)!; return { h: +m[1]!, s: +m[2]!, l: +m[3]! }; };

describe("palette", () => {
  test("the harmonies keep their angles as the base turns", () => {
    expect(OFFSETS.complementary).toEqual([0, 180]);
    expect(OFFSETS.triadic).toEqual([0, 120, 240]);
    expect(OFFSETS.square).toEqual([0, 90, 180, 270]);
    expect(OFFSETS.tetradic).toEqual([0, 60, 180, 240]);
    expect(OFFSETS.split).toEqual([0, 150, 210]);
    expect(OFFSETS.analogous).toEqual([0, -30, 30]);
    for (const harmony of HARMONIES) for (const h of [0, 47, 200, 359]) {
      const cs = harmonyColours({ harmony, h, s: 70, l: 50 });
      if (harmony === "monochromatic") { expect(new Set(cs.map((c) => c.h)).size).toBe(1); continue; }
      cs.forEach((c, i) => expect(((c.h - h + 360) % 360)).toBe((OFFSETS[harmony][i]! + 360) % 360));
    }
  });
  test("dragging any marker turns the whole harmony", () => {
    const p: Palette = { harmony: "triadic", h: 10, s: 50, l: 50 };
    expect(baseHueFor(p, 1, 200)).toBe(80);
    expect(harmonyColours({ ...p, h: baseHueFor(p, 1, 200) })[1]!.h).toBe(200);
    expect(hueAt(0, -1)).toBe(0);
    expect(hueAt(1, 0)).toBe(90);
    expect(hueAt(0, 1)).toBe(180);
  });
  test("only the skin's own colour tokens, in the skins' hsl(H S% L%) format", () => {
    const t = paletteTokens({ harmony: "square", h: 120, s: 60, l: 40 }, "light");
    expect(Object.keys(t)).toEqual([...PALETTE_TOKENS]);
    for (const v of Object.values(t)) expect(v).toMatch(/^hsl\([\d.]+ [\d.]+% [\d.]+%\)$/);
    expect(Object.keys(t).some((k) => ["background", "foreground", "card", "muted", "border", "destructive"].includes(k))).toBe(false);
  });
  test("every -foreground pair passes WCAG AA, for any base colour and both modes", () => {
    let n = 0;
    for (const harmony of HARMONIES) for (let h = 0; h < 360; h += 15) for (const s of [0, 35, 70, 100]) for (let l = 0; l <= 100; l += 10) for (const mode of ["light", "dark"] as const) {
      const t = paletteTokens({ harmony, h, s, l }, mode);
      for (const [bg, fg] of FOREGROUND_PAIRS) { expect(contrast(parse(t[bg]), parse(t[fg]))).toBeGreaterThanOrEqual(AA); n++; }
    }
    expect(n).toBeGreaterThan(10000);
  });
  test("cleans stored palettes", () => {
    expect(cleanPalette({ harmony: "triadic", h: 370, s: 120, l: -4 })).toEqual({ harmony: "triadic", h: 10, s: 100, l: 0 });
    expect(cleanPalette({ harmony: "pentad", h: 1, s: 1, l: 1 })).toBeNull();
    expect(cleanPalette(null)).toBeNull();
  });
});
