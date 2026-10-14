import { describe, expect, test } from "bun:test";
import { cleanTheme, densityOf, isDefault, NO_THEME, readTheme, rootAttrs, rootStyle, setDensity, STORE_THEME, writeTheme } from "./global-theme";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; };

describe("global theme", () => {
  test("cleans unknown values", () => {
    expect(cleanTheme({ skin: "nope", font: "inter", radius: 7, tokens: { "radius-card": 16, x: 1 } })).toEqual({ skin: null, font: "inter", radius: null, tokens: { "radius-card": 16 } });
    expect(isDefault(cleanTheme(null))).toBe(true);
  });
  test("round trip through storage; the default is not stored", () => {
    const s = mem();
    const t = { skin: "claude", font: "manrope", radius: 12, tokens: { "shadow-card": "sm" } };
    writeTheme(t, s);
    expect(readTheme(s)).toEqual(t);
    writeTheme(NO_THEME, s);
    expect(s.m.has(STORE_THEME)).toBe(false);
  });
  test("one density for all elements", () => {
    const t = setDensity({}, "compact");
    expect(densityOf(t)).toBe("compact");
    expect(densityOf(setDensity(t, "default"))).toBe("default");
    expect(Object.keys(setDensity(t, "default"))).toEqual([]);
  });
  test("root style and attributes", () => {
    const t = { skin: "claude", font: "inter", radius: 0, tokens: { "radius-card": 16, "density-card": "compact" } };
    expect(rootStyle(t, (f) => "taste-" + f)).toBe("--radius:0px;--font-sans:taste-inter,sans-serif;--taste-heading:taste-inter,sans-serif;--radius-card:16px");
    expect(rootAttrs(t)).toEqual({ "data-skin": "claude", "data-density-card": "compact" });
    expect(rootStyle(NO_THEME, String)).toBe("");
  });
});
