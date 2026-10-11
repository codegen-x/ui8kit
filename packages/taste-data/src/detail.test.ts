import { describe, expect, test } from "bun:test";
import { relatedOf } from "./recommend";
import { presetOf, cliLine } from "./preset";
import { seriesOf } from "./series";
import { COMPOSITIONS } from "./taste";

const KEY = "t053-fullbleed-geometric|bubblegum|onest+inter|4";

describe("series", () => {
  test("one item per layout family, same skin, fonts and radius", () => {
    const s = seriesOf(KEY);
    expect(s.map((i) => i.family)).toEqual([...COMPOSITIONS]);
    for (const i of s) { expect(i.skin).toBe("bubblegum"); expect(i.fonts).toEqual({ display: "onest", body: "inter" }); expect(i.radius).toBe(4); }
  });
  test("deterministic, and the own family keeps the own screen", () => {
    expect(seriesOf(KEY)).toEqual(seriesOf(KEY));
    expect(seriesOf(KEY).find((i) => i.family === "full-bleed")!.screen).toBe("t053-fullbleed-geometric");
    expect(new Set(seriesOf(KEY).map((i) => i.screen)).size).toBe(10);
  });
  test("a bad key has no series", () => { expect(seriesOf("nope")).toEqual([]); });
});

describe("preset", () => {
  test("valid JSON with skin, font, radius, screen", () => {
    const p = presetOf(KEY)!;
    const back = JSON.parse(JSON.stringify(p));
    expect(back).toMatchObject({ format: 1, screen: "t053-fullbleed-geometric", skin: "bubblegum", font: "inter", radius: 4 });
    expect(cliLine(p)).toBe("npx cgenx add --skin bubblegum --font inter --radius 4");
    expect(presetOf("x")).toBeNull();
  });
});

describe("related", () => {
  test("six nearest, never the style itself, deterministic", () => {
    const r = relatedOf(KEY);
    expect(r.length).toBe(6);
    expect(r.some((c) => c.key === KEY)).toBe(false);
    expect(relatedOf(KEY).map((c) => c.key)).toEqual(r.map((c) => c.key));
  });
});
