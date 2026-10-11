import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cards } from "@ui8kit/panorama/grid";
import { wall } from "@ui8kit/panorama/wall";
import { TASTES } from "@ui8kit/taste-data/tastes";
import { INCLUDED } from "@ui8kit/taste-data/included";
import { corpus } from "./corpus";

describe("search corpus", () => {
  test("the 820 wall styles (unique keys) plus the included styles, one item each", () => {
    const items = corpus();
    const w = wall(cards(), TASTES);
    expect(w.length).toBe(820);
    const keys = new Set(items.map((i) => i.key));
    expect(keys.size).toBe(items.length);
    for (const v of w) expect(keys.has(`${v.screen}|${v.skin}|${v.fonts.display}+${v.fonts.body}|${v.radius}`)).toBe(true);
    for (const i of INCLUDED) expect(keys.has(i.key)).toBe(true);
    expect(items.length).toBeGreaterThanOrEqual(820);
    expect(items.length).toBeLessThanOrEqual(820 + INCLUDED.length);
  });
  test("the wall itself is unchanged (sha256 of its JSON + newline starts a34eb6ec)", () => {
    const h = createHash("sha256").update(JSON.stringify(wall(cards(), TASTES)) + "\n").digest("hex");
    expect(h.startsWith("a34eb6ec")).toBe(true);
  });
});
