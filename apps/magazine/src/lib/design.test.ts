import { describe, expect, test } from "bun:test";
import { parseStyleKey } from "@ui8kit/taste-data/picks";
import { RADII } from "@ui8kit/taste-data/taste";
import { effective, NO_OVERRIDES } from "./design";

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
