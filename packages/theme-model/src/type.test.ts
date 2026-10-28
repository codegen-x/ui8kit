import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { FONT_IDS, FONT_WIDTH } from "@ui8kit/taste-data/font-ids";
import { cleanScale, cleanWidth, FONT_SCALES, TEXT_SIZES, typeStyle, widthAxis } from "./type";

describe("the type scale and width", () => {
  test("TEXT_SIZES is Tailwind's type scale (tailwindcss/theme.css)", () => {
    const css = readFileSync(require.resolve("tailwindcss/theme.css"), "utf8");
    for (const [k, rem] of Object.entries(TEXT_SIZES)) expect(css).toContain(`--text-${k}: ${rem}rem;`);
    expect([...css.matchAll(/--text-([a-z0-9]+): [\d.]+rem;/g)].map((m) => m[1]).sort()).toEqual(Object.keys(TEXT_SIZES).sort());
  });
  test("the scale: 80..120% in 5% steps; 100% and anything else is not stored", () => {
    expect(FONT_SCALES[0]).toBe(80);
    expect(FONT_SCALES.at(-1)).toBe(120);
    for (let i = 1; i < FONT_SCALES.length; i++) expect(FONT_SCALES[i]! - FONT_SCALES[i - 1]!).toBe(5);
    expect(cleanScale(90)).toBe(90);
    for (const bad of [100, 93, 125, "90", null]) expect(cleanScale(bad)).toBeNull();
  });
  test("the width: only the fonts with a wdth axis (Roboto, Open Sans, IBM Plex Sans: 75..100), whole percents, not the default", () => {
    expect(FONT_IDS.filter((f) => FONT_WIDTH[f]).sort()).toEqual(["ibm-plex-sans", "open-sans", "roboto"]);
    expect(widthAxis(null)).toBeNull();
    expect(widthAxis("inter")).toBeNull();
    expect(widthAxis("roboto")).toEqual({ min: 75, max: 100, default: 100 });
    expect(cleanWidth("roboto", 75)).toBe(75);
    for (const bad of [74, 100, 101, 80.5, "80"]) expect(cleanWidth("roboto", bad)).toBeNull();
    expect(cleanWidth("inter", 80)).toBeNull();
  });
  test("the root declarations: every --text-* times the scale, font-stretch for the width, nothing at the defaults", () => {
    expect(typeStyle(null, null)).toBe("");
    const s = typeStyle(90, 80);
    expect(s).toContain("--text-xs:0.675rem");
    expect(s).toContain("--text-9xl:7.2rem");
    expect(s.split(";").filter((d) => d.startsWith("--text-")).length).toBe(Object.keys(TEXT_SIZES).length);
    expect(s.endsWith("font-stretch:80%")).toBe(true);
  });
});
