import { describe, expect, test } from "bun:test";
import { parseStyleKey } from "@ui8kit/taste-data/picks";
import { RADII } from "@ui8kit/taste-data/taste";
import { presetOf } from "@ui8kit/taste-data/preset";
import { cleanTokens, effective, NO_OVERRIDES, setToken, tokenAttrs, tokenStyle, withTokens, type Tokens } from "./design";

const KEY = "t071-poster-dots|bubblegum|montserrat+open-sans|0";
const parts = parseStyleKey(KEY)!;

describe("design playground overrides", () => {
  test("no overrides: the style's own values, unchanged, same key", () => {
    const e = effective(parts, NO_OVERRIDES);
    expect(e.radius).toBe(0); expect(e.changed).toBe(false); expect(e.key).toBe(KEY);
  });
  test("the radius starts from the key and every tile changes only the radius", () => {
    for (const r of RADII) {
      const e = effective(parts, { ...NO_OVERRIDES, radius: r });
      expect(e.radius).toBe(r);
      expect(e.changed).toBe(r !== parts.radius);
      expect(e.key).toBe(KEY.replace(/\|0$/, "|" + r));
      expect(e.skin).toBe("bubblegum");
    }
  });
  test("picking the style's own radius again is not a change; an unknown radius falls back", () => {
    expect(effective(parts, { ...NO_OVERRIDES, radius: 0 }).changed).toBe(false);
    expect(effective(parts, { ...NO_OVERRIDES, radius: 7 }).radius).toBe(0);
  });
  test("skin, font and radius combine; Save key carries all three; reset (no overrides) returns", () => {
    const e = effective(parts, { skin: "claude", font: "inter", radius: 12 });
    expect(e.key).toBe("t071-poster-dots|claude|inter+inter|12");
    expect(e.changed).toBe(true);
    expect(effective(parts, NO_OVERRIDES).key).toBe(KEY);
  });
});

describe("per-element tokens", () => {
  test("only known keys with known non-default values survive; density default is not stored", () => {
    expect(cleanTokens({ "radius-card": 16, "radius-button": 7, "density-card": "default", "density-alert": "comfortable", "shadow-card": "lg", "shadow-media": "md", bogus: 1 }))
      .toEqual({ "radius-card": 16, "density-alert": "comfortable", "shadow-media": "md" });
    expect(cleanTokens(null)).toEqual({}); expect(cleanTokens([1])).toEqual({});
  });
  test("setToken adds, replaces and removes; null and density default go back to the style's own", () => {
    let t = setToken({}, "radius-button", 0);
    t = setToken(t, "density-card", "comfortable");
    expect(t).toEqual({ "radius-button": 0, "density-card": "comfortable" });
    expect(setToken(t, "density-card", "default")).toEqual({ "radius-button": 0 });
    expect(setToken(t, "radius-button", null)).toEqual({ "density-card": "comfortable" });
  });
  test("tokens become CSS variables and data attributes only", () => {
    const t = { "radius-button": 0, "radius-card": 16, "shadow-card": "sm", "shadow-alert": "none", "density-button": "compact" };
    expect(tokenStyle(t)).toBe("--radius-button:0px;--radius-card:16px;--shadow-card:var(--shadow-sm);--shadow-alert:0 0 #0000");
    expect(tokenAttrs(t)).toEqual({ "data-density-button": "compact" });
    expect(tokenStyle({})).toBe(""); expect(tokenAttrs({})).toEqual({});
  });
  test("tokens change `changed`, never the key", () => {
    const e = effective(parts, { ...NO_OVERRIDES, tokens: { "shadow-card": "md" } });
    expect(e.changed).toBe(true); expect(e.key).toBe(KEY); expect(e.tokens).toEqual({ "shadow-card": "md" });
    expect(effective(parts, { ...NO_OVERRIDES, tokens: {} }).changed).toBe(false);
  });
  test("preset round trip: tokens go into the preset JSON compactly and come back identical; no tokens, no key", () => {
    const t: Tokens = { "radius-card": 16, "density-card": "comfortable", "shadow-media": "sm" };
    const preset = withTokens(presetOf(KEY)!, t);
    const back = JSON.parse(JSON.stringify(preset));
    expect(back.style).toBe(KEY);
    expect(cleanTokens(back.tokens)).toEqual(t);
    expect("tokens" in withTokens(presetOf(KEY)!, {})).toBe(false);
  });
});
