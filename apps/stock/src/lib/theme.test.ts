// The custom palette in Stock's export/import (lib/theme.ts, what the Theme sheet's Export / import calls): the config carries it,
// an import restores it and its colour tokens, an import without it clears it.
import { describe, expect, test } from "bun:test";
import { NO_THEME, rootStyle, type ThemeState } from "@ui8kit/theme-model/global-theme";
import { exportConfig, importConfig, resetTheme } from "./theme";

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
});
