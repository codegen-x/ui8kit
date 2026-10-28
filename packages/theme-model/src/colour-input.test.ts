import { describe, expect, test } from "bun:test";
import { formatHsl, hslToHex, parseColour, parseHex, parseHsl, rgbToHsl } from "./colour-input";

describe("the typed colour of the palette's Options: Hex <-> HSL", () => {
  test("Hex in every form, or null", () => {
    expect(parseHex("#3b82f6")).toEqual([59, 130, 246]);
    expect(parseHex("3B82F6")).toEqual([59, 130, 246]);
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex(" f00 ")).toEqual([255, 0, 0]);
    for (const bad of ["#ff", "#ffff", "#gggggg", "#3b82f6ff", "", "blue"]) expect(parseHex(bad)).toBeNull();
  });
  test("Hex to whole-number HSL (the palette's steps)", () => {
    expect(rgbToHsl([255, 0, 0])).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl([0, 0, 0])).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl([255, 255, 255])).toEqual({ h: 0, s: 0, l: 100 });
    expect(rgbToHsl([128, 128, 128])).toEqual({ h: 0, s: 0, l: 50 });
    expect(rgbToHsl(parseHex("#3b82f6")!)).toEqual({ h: 217, s: 91, l: 60 });
    expect(rgbToHsl([255, 0, 1]).h).toBe(0); // 359.8 rounds to 360, which is 0
  });
  test("HSL to Hex, and the round trip stays within the rounding of whole-number HSL", () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe("#ff0000");
    expect(hslToHex({ h: 120, s: 100, l: 25 })).toBe("#008000");
    expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe("#ffffff");
    let worst = 0;
    for (let v = 0; v < 4096; v += 7) {
      const rgb: [number, number, number] = [(v >> 8) * 17, ((v >> 4) & 15) * 17, (v & 15) * 17];
      const back = parseHex(hslToHex(rgbToHsl(rgb)))!;
      worst = Math.max(worst, ...back.map((c, i) => Math.abs(c - rgb[i]!)));
    }
    expect(worst).toBeLessThanOrEqual(4);
  });
  test("HSL in the token format and its neighbours; out of range or garbage is null", () => {
    expect(parseHsl("217 91% 60%")).toEqual({ h: 217, s: 91, l: 60 });
    expect(parseHsl("hsl(217 91% 60%)")).toEqual({ h: 217, s: 91, l: 60 });
    expect(parseHsl("217, 91%, 60%")).toEqual({ h: 217, s: 91, l: 60 });
    expect(parseHsl("217deg 91 60")).toEqual({ h: 217, s: 91, l: 60 });
    expect(parseHsl("360 50% 50%")).toEqual({ h: 0, s: 50, l: 50 });
    expect(parseHsl("12.6 40.4% 50.5%")).toEqual({ h: 13, s: 40, l: 51 });
    for (const bad of ["361 50% 50%", "10 101% 50%", "10 50% 120%", "-1 50% 50%", "10 50%", "a b c", ""]) expect(parseHsl(bad)).toBeNull();
    expect(formatHsl({ h: 217, s: 91, l: 60 })).toBe("217 91% 60%");
  });
  test("a typed colour: HSL, else Hex, else nothing", () => {
    expect(parseColour("217 91% 60%")).toEqual({ hsl: { h: 217, s: 91, l: 60 }, from: "hsl" });
    expect(parseColour("#3b82f6")).toEqual({ hsl: { h: 217, s: 91, l: 60 }, from: "hex" });
    expect(parseColour("123")).toEqual({ hsl: rgbToHsl([17, 34, 51]), from: "hex" });
    expect(parseColour("nope")).toBeNull();
  });
});
