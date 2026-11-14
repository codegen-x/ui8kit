// The custom palette in Stock's export/import (lib/theme.ts, what the Theme sheet's Export / import calls): the config carries it,
// an import restores it and its colour tokens, an import without it clears it.
import { describe, expect, test } from "bun:test";
import { NO_THEME, rootStyle, type ThemeState } from "@ui8kit/theme-model/global-theme";
import { readFileSync } from "node:fs";
import indexJson from "../../content/assets.v0.json";
import type { Index } from "./model";
import { parseSearch } from "@ui8kit/facet-search";
import { exportConfig, hashWithoutSkin, importConfig, resetTheme, skinOfHash, withHashSkin } from "./theme";

const palette = { harmony: "triadic" as const, h: 200, s: 60, l: 45 };
const withPalette: ThemeState = { mode: "dark", theme: { ...NO_THEME, skin: "claude", palette } };

describe("theme export/import: the custom palette", () => {
  test("export -> reset -> import restores the palette and its tokens", () => {
    const cfg = JSON.stringify(exportConfig(withPalette));
    expect(JSON.parse(cfg).palette).toEqual(palette);
    const reset = resetTheme(withPalette);
    expect(reset.theme.palette).toBeUndefined();
    const { state, result } = importConfig(reset, cfg);
    expect(result.ok).toBe(true);
    expect(state.theme.palette).toEqual(palette);
    expect(rootStyle(state.theme, String, state.mode)).toBe(rootStyle(withPalette.theme, String, withPalette.mode));
    expect(rootStyle(state.theme, String, state.mode)).toContain("--primary:hsl(200 60% ");
  });
  test("a config without a palette clears it (an import replaces the theme)", () => {
    const plain = JSON.stringify(exportConfig({ mode: "dark", theme: { ...NO_THEME, skin: "supabase" } }));
    expect(JSON.parse(plain).palette).toBeNull();
    const { state } = importConfig(withPalette, plain);
    expect(state.theme.palette).toBeUndefined();
    expect(state.theme.skin).toBe("supabase");
    expect(rootStyle(state.theme, String, "dark")).not.toContain("--primary");
  });
  test("the contrast level (AA/AAA) is in the export; an import without it reads as AA", () => {
    const aaa: ThemeState = { mode: "light", theme: { ...NO_THEME, skin: "claude", palette: { ...palette, contrast: "AAA" } } };
    const cfg = JSON.stringify(exportConfig(aaa));
    expect(JSON.parse(cfg).palette.contrast).toBe("AAA");
    const { state } = importConfig(resetTheme(aaa), cfg);
    expect(state.theme.palette).toEqual({ ...palette, contrast: "AAA" });
    expect(rootStyle(state.theme, String, "light")).toBe(rootStyle(aaa.theme, String, "light"));
    const old = JSON.parse(cfg); delete old.palette.contrast;
    const plain = importConfig(aaa, JSON.stringify(old)).state;
    expect(plain.theme.palette).toEqual(palette);
    expect(rootStyle(plain.theme, String, "light")).toBe(rootStyle({ ...aaa.theme, palette }, String, "light"));
    expect(rootStyle(plain.theme, String, "light")).not.toBe(rootStyle(aaa.theme, String, "light"));
  });
  test("the font size % and width are in the export; an import without them reads as 100% and the font's own width", () => {
    const typed: ThemeState = { mode: "dark", theme: { ...NO_THEME, font: "roboto", fontScale: 90, fontWidth: 80, fontWeight: 500, headingWeight: 700, tracking: 0.025 } };
    const cfg = JSON.stringify(exportConfig(typed));
    expect(JSON.parse(cfg)).toMatchObject({ fontScale: 90, fontWidth: 80, fontWeight: 500, headingWeight: 700, tracking: 0.025 });
    const { state } = importConfig(resetTheme(typed), cfg);
    expect(state.theme).toEqual(typed.theme);
    expect(rootStyle(state.theme, String, "dark")).toContain("font-stretch:80%");
    const old = JSON.parse(cfg); delete old.fontScale; delete old.fontWeight; delete old.headingWeight; delete old.tracking; delete old.fontWidth;
    const plain = importConfig(typed, JSON.stringify(old)).state;
    expect(plain.theme.fontScale).toBeUndefined();
    expect(plain.theme.fontWidth).toBeUndefined();
    expect(plain.theme.fontWeight).toBeUndefined();
    expect(plain.theme.headingWeight).toBeUndefined();
    expect(plain.theme.tracking).toBeUndefined();
    expect(rootStyle(plain.theme, String, "dark")).not.toContain("--text-");
    expect(JSON.parse(JSON.stringify(exportConfig({ mode: "dark", theme: NO_THEME })))).not.toHaveProperty("fontScale");
  });
});


// The skin of a link (`#/search?type=screen&section=marketing&skin=sky`): lib/theme.ts skinOfHash, withHashSkin, hashWithoutSkin.
describe("the skin in the hash", () => {
  const link = "#/search?type=screen&section=marketing&skin=sky";
  const stored: ThemeState = { mode: "light", theme: { ...NO_THEME, skin: "claude", font: "inter", palette } };

  test("skinOfHash reads a known skin from the query of any route, nothing else", () => {
    expect(skinOfHash(link)).toBe("sky");
    expect(skinOfHash("#/search?skin=t3-chat&page=2")).toBe("t3-chat");
    expect(skinOfHash("#/asset/block.about/split?skin=rose&view=full")).toBe("rose");
    expect(skinOfHash("#/search?skin=nope")).toBeNull();
    expect(skinOfHash("#/search?skin=")).toBeNull();
    expect(skinOfHash("#/search?type=screen")).toBeNull();
    expect(skinOfHash("#/search")).toBeNull();
    expect(skinOfHash("")).toBeNull();
  });
  test("every skin of packages/skins is known", () => {
    const ids = JSON.parse(readFileSync(new URL("../../../../packages/skins/skins/index.json", import.meta.url), "utf8")) as { skins: { id: string }[] };
    const list = ids.skins.map((x) => x.id);
    expect(list.length).toBeGreaterThan(10);
    for (const id of list) expect(skinOfHash(`#/search?skin=${id}`)).toBe(id);
  });
  test("the link's skin beats the stored one; the rest of the stored theme stays, a custom palette goes (a skin pick)", () => {
    const s = withHashSkin(stored, link);
    expect(s.theme.skin).toBe("sky");
    expect(s.theme.font).toBe("inter");
    expect(s.theme.palette).toBeUndefined();
    expect(s.mode).toBe("light");
  });
  test("no skin, an unknown skin or the skin already on: the same state", () => {
    expect(withHashSkin(stored, "#/search?type=screen")).toBe(stored);
    expect(withHashSkin(stored, "#/search?skin=nope")).toBe(stored);
    expect(withHashSkin(stored, "#/search?skin=claude")).toBe(stored);
  });
  test("skin is no search term or facet: the filters of the link parse the same with and without it", () => {
    const vocab = { facets: [{ id: "type", values: [{ id: "screen", label: { en: "Screen" } }] }, { id: "section", values: [{ id: "marketing", label: { en: "Marketing" } }] }], sorts: [] };
    const without = parseSearch("type=screen&section=marketing", vocab);
    expect(without.filters).toEqual({ type: ["screen"], section: ["marketing"] });
    expect(parseSearch(link, vocab)).toEqual(without);
    expect(parseSearch(link, vocab).q).toBe("");
  });
  test("on the real Stock vocabulary the link is the screens of the marketing section, no q, no skin facet", () => {
    const index = indexJson as unknown as Index;
    const vocab = { facets: index.facets, sorts: index.sorts };
    const s = parseSearch(link, vocab);
    expect(s.filters.type).toEqual(["screen"]);
    expect(s.filters.section).toEqual(["marketing"]);
    expect(Object.keys(s.filters).sort()).toEqual(["section", "type"]);
    expect(s.q).toBe("");
    expect(index.facets.some((f) => f.id === "skin")).toBe(false);
  });
  test("hashWithoutSkin removes only skin, keeps the other parameters as they are", () => {
    expect(hashWithoutSkin(link)).toBe("#/search?type=screen&section=marketing");
    expect(hashWithoutSkin("#/search?skin=sky&q=hero%20big&page=2")).toBe("#/search?q=hero%20big&page=2");
    expect(hashWithoutSkin("#/search?skin=sky")).toBe("#/search");
    expect(hashWithoutSkin("#/search?type=screen")).toBe("#/search?type=screen");
    expect(hashWithoutSkin("#/collections")).toBe("#/collections");
    expect(skinOfHash(hashWithoutSkin(link))).toBeNull();
  });
});
