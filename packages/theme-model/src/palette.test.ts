import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { SKIN_IDS } from "@ui8kit/taste-data/taste";
import { build, OUT_FILE } from "../scripts/skin-neutrals";
import { SKIN_NEUTRALS } from "./skin-neutrals";
import { AA, baseHueFor, NEUTRAL_PAIRS, NEUTRAL_TOKENS, neutralTokens, PRESETS, samePalette, cleanPalette, contrast, FOREGROUND_PAIRS, HARMONIES, harmonyColours, hueAt, OFFSETS, PALETTE_TOKENS, paletteTokens, type Hsl, type Palette } from "./palette";

const parse = (v: string): Hsl => { const m = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(v)!; return { h: +m[1]!, s: +m[2]!, l: +m[3]! }; };

describe("palette", () => {
  test("the harmonies keep their angles as the base turns", () => {
    expect(OFFSETS.complementary).toEqual([0, 180]);
    expect(OFFSETS.triadic).toEqual([0, 120, 240]);
    expect(OFFSETS.square).toEqual([0, 90, 180, 270]);
    expect(OFFSETS.tetradic).toEqual([0, 60, 180, 240]);
    expect(OFFSETS.split).toEqual([0, 150, 210]);
    expect(OFFSETS.analogous).toEqual([0, -30, 30]);
    expect(OFFSETS["double-split"]).toEqual([0, 30, 180, 210]);
    expect(OFFSETS.compound).toEqual([0, -30, 30, 165, 195]);
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
  test("only the skin's own colour tokens, in the skins' hsl(H S% L%) format; destructive stays the skin's", () => {
    const t = paletteTokens({ harmony: "square", h: 120, s: 60, l: 40 }, "light", "claude");
    expect(Object.keys(t)).toEqual([...PALETTE_TOKENS]);
    for (const v of Object.values(t)) expect(v).toMatch(/^hsl\([\d.]+ [\d.]+% [\d.]+%( \/ [\d.]+)?\)$/);
    expect(Object.keys(t)).not.toContain("destructive");
    expect(Object.keys(t)).not.toContain("destructive-foreground");
  });
  test("the neutrals are tinted: the palette's hue, a low saturation, the skin's own lightness (and alpha)", () => {
    const p: Palette = { harmony: "triadic", h: 265, s: 70, l: 45 };
    const t = neutralTokens(p, "light", "claude");
    for (const k of NEUTRAL_TOKENS) expect(parse(t[k]).h).toBe(265);
    expect(t.background).toBe("hsl(265 8% 97%)");
    expect(t.border).toBe("hsl(265 12% 84%)");
    expect(parse(t.foreground).s).toBe(10);
    // the kit's own dark theme draws its lines in translucent white: the alpha stays
    expect(neutralTokens(p, "dark", null).border).toBe("hsl(265 12% 100% / 0.1)");
    // monochromatic tints everything more; a grey palette leaves the neutrals grey
    expect(parse(neutralTokens({ ...p, harmony: "monochromatic" }, "light", "claude").background).s).toBe(20);
    expect(parse(neutralTokens({ ...p, s: 0 }, "light", "claude").muted).s).toBe(0);
    expect(() => neutralTokens(p, "light", "no-such-skin")).toThrow();
  });
  test("the lightness table is the skin CSS now (skin-neutrals.ts is generated, not edited)", () => {
    expect(build()).toBe(readFileSync(OUT_FILE, "utf8"));
    expect(Object.keys(SKIN_NEUTRALS)).toEqual(["default", ...SKIN_IDS]);
  });
  test("every neutral text passes AA on each of its surfaces, for every skin, both modes and any base colour", () => {
    let n = 0;
    for (const skin of [null, ...SKIN_IDS]) for (const harmony of ["monochromatic", "triadic"] as const) for (let h = 0; h < 360; h += 45) for (const s of [0, 50, 100]) for (const l of [20, 50, 80]) for (const mode of ["light", "dark"] as const) {
      const t = paletteTokens({ harmony, h, s, l }, mode, skin);
      for (const [text, surfaces] of NEUTRAL_PAIRS) for (const bg of surfaces) { expect(contrast(parse(t[text]), parse(t[bg]))).toBeGreaterThanOrEqual(AA); n++; }
    }
    expect(n).toBeGreaterThan(20000);
  });
  test("every -foreground pair passes WCAG AA, for any base colour and both modes", () => {
    let n = 0;
    for (const harmony of HARMONIES) for (let h = 0; h < 360; h += 15) for (const s of [0, 35, 70, 100]) for (let l = 0; l <= 100; l += 10) for (const mode of ["light", "dark"] as const) {
      const t = paletteTokens({ harmony, h, s, l }, mode, null);
      for (const [bg, fg] of FOREGROUND_PAIRS) { expect(contrast(parse(t[bg]), parse(t[fg]))).toBeGreaterThanOrEqual(AA); n++; }
    }
    expect(n).toBeGreaterThan(10000);
  });
  test("16 presets, each a clean palette whose -foreground pairs and neutral texts pass AA in both modes over every skin", () => {
    expect(PRESETS.length).toBe(16);
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(16);
    for (const { palette } of PRESETS) {
      expect(cleanPalette(palette)).toEqual(palette);
      expect(samePalette(cleanPalette(palette), palette)).toBe(true);
      for (const mode of ["light", "dark"] as const) {
        for (const skin of [null, ...SKIN_IDS]) {
          const t = paletteTokens(palette, mode, skin);
          for (const [bg, fg] of FOREGROUND_PAIRS) expect(contrast(parse(t[bg]), parse(t[fg]))).toBeGreaterThanOrEqual(AA);
          for (const [text, surfaces] of NEUTRAL_PAIRS) for (const bg of surfaces) expect(contrast(parse(t[text]), parse(t[bg]))).toBeGreaterThanOrEqual(AA);
        }
      }
    }
  });
  test("cleans stored palettes", () => {
    expect(cleanPalette({ harmony: "triadic", h: 370, s: 120, l: -4 })).toEqual({ harmony: "triadic", h: 10, s: 100, l: 0 });
    expect(cleanPalette({ harmony: "pentad", h: 1, s: 1, l: 1 })).toBeNull();
    expect(cleanPalette(null)).toBeNull();
  });
});
