import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { cleanTheme, densityOf, isDefault, NO_THEME, patchTheme, readTheme, rootAttrs, rootStyle, setDensity, writeTheme } from "./global-theme";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m }; };

describe("global theme", () => {
  test("cleans unknown values", () => {
    expect(cleanTheme({ skin: "nope", font: "inter", radius: 7, tokens: { "radius-card": 16, x: 1 } })).toEqual({ skin: null, font: "inter", radius: null, tokens: { "radius-card": 16 } });
    expect(isDefault(cleanTheme(null))).toBe(true);
  });
  test("round trip through storage; the default is not stored", () => {
    const s = mem();
    const t = { skin: "claude", font: "manrope", radius: 12, tokens: { "shadow-card": "sm" } };
    writeTheme("magazine:v1:theme", t, s);
    expect(readTheme("magazine:v1:theme", s)).toEqual(t);
    expect(readTheme("stock:v1:theme", s)).toEqual(NO_THEME);
    writeTheme("stock:v1:theme", { ...t, skin: "sky" }, s);
    expect(readTheme("magazine:v1:theme", s)).toEqual(t);
    writeTheme("magazine:v1:theme", NO_THEME, s);
    expect(s.m.has("magazine:v1:theme")).toBe(false);
    expect([...s.m.keys()]).toEqual(["stock:v1:theme"]);
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

// ---- coverage parity: one model, every field in both views, in export/import, applied to the site ----
import { RADII, SKIN_IDS } from "@ui8kit/taste-data/taste";
import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
import { presetOf } from "@ui8kit/taste-data/preset";
import { cleanTokens, DENSITY_ELEMENTS, ELEMENTS, SHADOW_ELEMENTS } from "./design";
import { FIELD_IDS, FIELDS, fieldValue, fromConfig, setThemeField, THEME_SCHEMA, toConfig, viewFields, type GlobalTheme } from "./global-theme";

/** every key the model can hold: the mode, the theme's own fields, every token key cleanTokens keeps */
const MODEL_KEYS = ["mode", ...Object.keys(NO_THEME).filter((k) => k !== "tokens"),
  ...ELEMENTS.map((e) => "radius-" + e), ...DENSITY_ELEMENTS.map((e) => "density-" + e), ...SHADOW_ELEMENTS.map((e) => "shadow-" + e)];
/** a theme with every field set to a non-default value (the i-th allowed value, wrapping) */
const full = (i: number): { mode: "light" | "dark"; theme: GlobalTheme } => {
  let theme: GlobalTheme = NO_THEME;
  for (const f of FIELDS) if (f.store !== "mode") { const vs = f.values.filter((v) => v !== f.unset); theme = setThemeField(theme, f.id, vs[i % vs.length]!); }
  return { mode: i % 2 ? "dark" : "light", theme };
};

describe("theme coverage parity", () => {
  test("the schema has exactly the fields of the model", () => {
    expect([...FIELD_IDS].sort()).toEqual([...MODEL_KEYS].sort());
    for (const k of MODEL_KEYS.filter((k) => k.includes("-"))) expect(Object.keys(cleanTokens({ [k]: FIELDS.find((f) => f.id === k)!.values.find((v) => v !== "default") }))).toEqual([k]);
    expect(FIELDS.find((f) => f.id === "skin")!.values).toEqual(SKIN_IDS);
    expect(FIELDS.find((f) => f.id === "font")!.values).toEqual(FONT_IDS);
    expect(FIELDS.find((f) => f.id === "radius")!.values).toEqual(RADII);
  });
  test("both views (Theme panel and Design system panel) render every field", () => {
    for (const view of ["sheet", "design"] as const) {
      const v = viewFields(view);
      expect(v.map((r) => r.field.id)).toEqual([...FIELD_IDS]);
      for (const r of v) expect(["radio", "select"]).toContain(r.control);
    }
  });
  test("every value of every field survives set -> export -> JSON -> import", () => {
    for (const f of FIELDS) for (const v of f.values) {
      const s = f.store === "mode" ? { mode: v as "light" | "dark", theme: NO_THEME } : { mode: "light" as const, theme: setThemeField(NO_THEME, f.id, v) };
      expect(fieldValue(s, f.id)).toBe(v);
      const r = fromConfig(JSON.stringify(toConfig(s)));
      if (!r.ok) throw new Error(r.error);
      expect(r.dropped).toEqual([]);
      expect(fieldValue({ mode: r.mode ?? "light", theme: r.theme }, f.id)).toBe(v);
    }
  });
  test("a full theme round trips whole; every field is in the export", () => {
    for (let i = 0; i < 5; i++) {
      const s = full(i);
      const cfg = toConfig(s);
      const r = fromConfig(JSON.parse(JSON.stringify(cfg)));
      if (!r.ok) throw new Error(r.error);
      expect({ mode: r.mode, theme: r.theme }).toEqual({ mode: s.mode, theme: cleanTheme(s.theme) });
      for (const id of FIELD_IDS) expect(fieldValue({ mode: cfg.mode, theme: { skin: cfg.skin, font: cfg.font, radius: cfg.radius, tokens: cfg.tokens } }, id)).toBe(fieldValue(s, id));
    }
  });
  test("every field reaches the site root (CSS variable, data attribute or the mode)", () => {
    for (const f of FIELDS.filter((f) => f.store !== "mode")) {
      const v = f.values.find((x) => x !== f.unset)!;
      const t = setThemeField(NO_THEME, f.id, v);
      expect(rootStyle(t, String) + JSON.stringify(rootAttrs(t))).not.toBe(rootStyle(NO_THEME, String) + JSON.stringify(rootAttrs(NO_THEME)));
    }
  });
  test("the palette round trips through the config and reaches the root as the skin's colour tokens", () => {
    const t = cleanTheme({ skin: "claude", palette: { harmony: "triadic", h: 200, s: 60, l: 45 } });
    const r = fromConfig(JSON.stringify(toConfig({ mode: "dark", theme: t })));
    expect(r.ok && r.theme).toEqual(t);
    expect(rootStyle(t, String, "light")).toContain("--primary:hsl(200 60% ");
    expect(rootStyle(t, String, "light")).not.toBe(rootStyle(t, String, "dark"));
    expect(isDefault({ ...NO_THEME, palette: t.palette })).toBe(false);
    // the contrast level travels with the palette; a config without it (or written before it existed) reads as AA
    const aaa = cleanTheme({ skin: "claude", palette: { harmony: "triadic", h: 200, s: 60, l: 45, contrast: "AAA" } });
    const back = fromConfig(JSON.parse(JSON.stringify(toConfig({ mode: "light", theme: aaa }))));
    expect(back.ok && back.theme.palette).toEqual({ harmony: "triadic", h: 200, s: 60, l: 45, contrast: "AAA" });
    const old = fromConfig({ palette: { harmony: "triadic", h: 200, s: 60, l: 45 } });
    expect(old.ok && old.theme.palette?.contrast).toBeUndefined();
    const bad = fromConfig({ palette: { harmony: "pentad", h: 1, s: 1, l: 1 } });
    expect(bad.ok && bad.dropped).toEqual(["palette"]);
  });
  test("import: older shapes and a style preset; bad input is refused or dropped", () => {
    const stored = { v: 1, theme: { skin: "claude", font: "inter", radius: 4, tokens: { "radius-card": 16 } } };
    const r1 = fromConfig(stored);
    expect(r1.ok && r1.theme).toEqual(stored.theme);
    const preset = { ...presetOf("t071-poster-dots|bubblegum|montserrat+open-sans|0")!, tokens: { "shadow-card": "sm" } };
    const r2 = fromConfig(JSON.stringify(preset));
    expect(r2.ok && r2.theme).toEqual({ skin: "bubblegum", font: "open-sans", radius: 0, tokens: { "shadow-card": "sm" } });
    expect(fromConfig("{nope").ok).toBe(false);
    expect(fromConfig([1]).ok).toBe(false);
    expect(fromConfig({ format: "other" }).ok).toBe(false);
    expect(fromConfig({ format: "magazine-theme", version: 3 }).ok).toBe(false);
    const r3 = fromConfig({ format: "magazine-theme", version: 2, mode: "dim", skin: "nope", radius: 4, tokens: { "radius-card": 5, "density-card": "default", x: 1 } });
    expect(r3.ok && r3.dropped.sort()).toEqual(["mode", "radius-card", "skin", "x"]);
    expect(r3.ok && r3.theme).toEqual({ skin: null, font: null, radius: 4, tokens: {} });
  });
  test("the JSON Schema names every field and its values", () => {
    const p = THEME_SCHEMA.properties as unknown as Record<string, { enum?: unknown[] }>;
    const tp = (THEME_SCHEMA.properties.tokens as { properties: Record<string, { enum: unknown[] }> }).properties;
    // the palette (the colour wheel) is one object, not a field of FIELDS: its own schema entry, and its own test (palette.test.ts);
    // so are the type scale and width (type.ts), written only when set
    const OWN = ["format", "version", "tokens", "palette", "fontScale", "fontWidth"];
    expect([...Object.keys(p).filter((k) => !OWN.includes(k)), ...Object.keys(tp)].sort()).toEqual([...FIELD_IDS].sort());
    for (const f of FIELDS) for (const v of f.values) expect((f.store === "tokens" ? tp[f.id]! : p[f.id]!).enum).toContain(v);
    expect(Object.keys(toConfig({ mode: "dark", theme: NO_THEME })).filter((k) => k !== "tokens" && k !== "format" && k !== "version").sort()).toEqual(Object.keys(p).filter((k) => !["format", "version", "tokens", "fontScale", "fontWidth"].includes(k)).sort());
  });
});

describe("per-element tokens: field -> data-slot -> kit.css", () => {
  const root = new URL("../../../", import.meta.url).pathname;
  const read = (p: string): string => readFileSync(root + p, "utf8");
  const kit = read("packages/kit-compose/svelte/src/styles/kit.css");
  const map = read("packages/kit-compose/src/map.ts");
  const media = read("packages/compose-gen/specs/patterns/media-frame.json");
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  test("every token field names the data-slot and the CSS variables kit.css reads, and a composition carries that data-slot", () => {
    for (const f of FIELDS.filter((f) => f.store === "tokens")) {
      expect(f.slot, f.id).toBeDefined();
      expect(f.css?.length, f.id).toBeGreaterThan(0);
      const sel = `[data-slot="${f.slot}"]`;
      for (const v of f.css!) expect(kit, `${f.id}: ${sel} reads ${v}`).toMatch(new RegExp(`${esc(sel)}[^{]*\\{[^}]*var\\(${esc(v)},`));
      if (f.group === "density") for (const d of ["compact", "comfortable"]) for (const v of f.css!) expect(kit, `${f.id}=${d} sets ${v}`).toMatch(new RegExp(`\\[data-${f.id}="${d}"\\] \\{[^}]*${esc(v)}:`));
      if (f.slot === "media-frame") expect(media).toContain(`"data-slot": "media-frame"`);
      else expect(map, `${f.id}: a composition with data-slot ${f.slot}`).toContain(`"data-slot": "${f.slot}" }`);
    }
  });
});

describe("choosing a skin drops the custom palette (patchTheme, the rule of every controller)", () => {
  const pal = { harmony: "triadic" as const, h: 200, s: 60, l: 45 };
  test("a skin, Default or the same skin returns to the skin's own colours; other patches keep the palette", () => {
    const t = cleanTheme({ skin: "claude", palette: pal });
    expect(patchTheme(t, { skin: "supabase" }).palette).toBeUndefined();
    expect(patchTheme(t, { skin: null }).palette).toBeUndefined();
    expect(patchTheme(t, { skin: "claude" }).palette).toBeUndefined();
    expect(patchTheme(t, { font: "inter" }).palette).toEqual(pal);
    expect(patchTheme(t, { skin: "claude", palette: { ...pal, h: 10 } }).palette?.h).toBe(10);
    expect("palette" in patchTheme(t, { palette: undefined })).toBe(false);
    expect(setThemeField(t, "skin", "supabase").palette).toBeUndefined();
    expect(rootStyle(setThemeField(t, "skin", "supabase"), String, "dark")).not.toContain("--primary");
  });
});

describe("the type scale and width (Fonts panel header): stored only when set, in the config, in the root style", () => {
  test("round trip through the config; absent fields read as 100% and the font's own width", () => {
    const t = cleanTheme({ font: "roboto", fontScale: 90, fontWidth: 80 });
    expect(t).toEqual({ skin: null, font: "roboto", radius: null, tokens: {}, fontScale: 90, fontWidth: 80 });
    const cfg = JSON.parse(JSON.stringify(toConfig({ mode: "light", theme: t })));
    expect(cfg.fontScale).toBe(90);
    expect(cfg.fontWidth).toBe(80);
    const back = fromConfig(cfg);
    expect(back.ok && back.theme).toEqual(t);
    expect(back.ok && back.dropped).toEqual([]);
    const plain = toConfig({ mode: "light", theme: cleanTheme({ font: "roboto" }) });
    expect("fontScale" in plain || "fontWidth" in plain).toBe(false);
    const old = fromConfig({ format: "magazine-theme", version: 2, font: "roboto" });
    expect(old.ok && old.theme.fontScale === undefined && old.theme.fontWidth === undefined).toBe(true);
    expect(isDefault(cleanTheme({ fontScale: 100 }))).toBe(true);
    expect(isDefault(cleanTheme({ fontScale: 110 }))).toBe(false);
  });
  test("values out of the steps, or a width the font has not, are dropped and named; the defaults are not", () => {
    const r = fromConfig({ font: "inter", fontScale: 93, fontWidth: 80 });
    expect(r.ok && r.dropped.sort()).toEqual(["fontScale", "fontWidth"]);
    const d = fromConfig({ font: "roboto", fontScale: 100, fontWidth: 100 });
    expect(d.ok && d.dropped).toEqual([]);
    expect(d.ok && d.theme.fontWidth).toBeUndefined();
    expect(cleanTheme({ font: "roboto", fontWidth: 74 }).fontWidth).toBeUndefined();
    expect(cleanTheme({ font: "roboto", fontWidth: 80.5 }).fontWidth).toBeUndefined();
  });
  test("choosing a font drops the width, the scale stays; the root gets --text-* and font-stretch", () => {
    const t = cleanTheme({ font: "open-sans", fontScale: 110, fontWidth: 85 });
    expect(patchTheme(t, { font: "roboto" })).toEqual({ skin: null, font: "roboto", radius: null, tokens: {}, fontScale: 110 });
    expect(patchTheme(t, { fontScale: undefined }).fontScale).toBeUndefined();
    expect("fontScale" in patchTheme(t, { fontScale: undefined })).toBe(false);
    const s = rootStyle(t, String);
    expect(s).toContain("--text-sm:0.9625rem");
    expect(s).toContain("--text-base:1.1rem");
    expect(s).toContain("font-stretch:85%");
    expect(rootStyle(cleanTheme({ font: "open-sans" }), String)).not.toContain("--text-");
  });
});

