// The routes and the detail page model on the real index and preview recipes.
import { describe, expect, test } from "bun:test";
import type { Recipes } from "@ui8kit/layouts/preview/recipe";
import indexJson from "../../content/assets.v0.json";
import recipesJson from "../../content/previews.v0.json";
import termsJson from "../../content/terms/pattern.v0.json";
import { detailView, pageMap, pageUses, passportFacets, sameBlocks, samePattern, similar, similarFilters, usedBy, useId, type Definitions } from "./detail";
import type { Index } from "./model";
import { assetHash, frameHash, parseRoute } from "./route";

const index = indexJson as unknown as Index;
const recipes = recipesJson as unknown as Recipes;
const byId = new Map(index.assets.map((a) => [a.id, a]));
const get = (id: string) => { const a = byId.get(id); if (!a) throw new Error(id); return a; };

describe("routes", () => {
  test("search, asset and frame; anything else is the storefront", () => {
    expect(parseRoute("")).toEqual({ kind: "search", query: "" });
    expect(parseRoute("#/search?q=hero&page=2")).toEqual({ kind: "search", query: "q=hero&page=2" });
    expect(parseRoute("#/pricing")).toEqual({ kind: "search", query: "" });
    expect(parseRoute(assetHash("block.about/split"))).toEqual({ kind: "asset", id: "block.about/split" });
    expect(parseRoute(frameHash("screen.site/home"))).toEqual({ kind: "frame", id: "screen.site/home" });
    expect(parseRoute("#/asset/")).toEqual({ kind: "search", query: "" });
    expect(parseRoute("#/asset/<x>")).toEqual({ kind: "search", query: "" });
  });
  test("every asset id round-trips through its hash", () => {
    for (const a of index.assets) expect(parseRoute(assetHash(a.id))).toEqual({ kind: "asset", id: a.id });
  });
  test("the full-screen preview is in the URL: view=full and a device (desktop by default, an unknown one is desktop)", () => {
    expect(assetHash("screen.site/home", { device: "desktop" })).toBe("#/asset/screen.site/home?view=full");
    expect(assetHash("screen.site/home", { device: "phone" })).toBe("#/asset/screen.site/home?view=full&device=phone");
    for (const d of ["desktop", "tablet", "phone"] as const) expect(parseRoute(assetHash("block.about/split", { device: d }))).toEqual({ kind: "asset", id: "block.about/split", full: { device: d } });
    expect(parseRoute("#/asset/block.about/split?view=full&device=watch")).toEqual({ kind: "asset", id: "block.about/split", full: { device: "desktop" } });
    expect(parseRoute("#/asset/block.about/split?device=phone")).toEqual({ kind: "asset", id: "block.about/split" });
  });
});

describe("detail", () => {
  test("a screen page lists its blocks in page order, each a real block variant", () => {
    const a = get("screen.site/home");
    const v = detailView(index, recipes, a, "en");
    expect(v.parts.map((p) => p.href)).toEqual(["#/asset/block.header/inline", "#/asset/block.hero/centered", "#/asset/block.features/grid", "#/asset/block.cta/card", "#/asset/block.footer/minimal"]);
    expect(v.usedBy).toEqual([]);
    for (const s of index.assets.filter((x) => x.preview?.kind === "screen")) {
      const p = s.preview!; if (p.kind !== "screen") continue;
      const uses = pageUses(recipes, p.screen, p.area);
      expect(uses.length).toBeGreaterThan(0);
      for (const u of uses) expect(byId.has(useId(recipes, u)!)).toBe(true);
    }
  });
  test("a block variant lists its block's variants (itself current) and the screen pages that use the block", () => {
    const v = detailView(index, recipes, get("block.hero/centered"), "en");
    expect(v.parts.length).toBe(index.assets.filter((x) => x.group === "block.hero").length);
    expect(v.parts.filter((p) => p.current).map((p) => p.key)).toEqual(["block.hero/centered"]);
    expect(v.usedBy.map((p) => p.key)).toContain("screen.site/home");
    expect(v.usedBy.every((p) => p.key.startsWith("screen."))).toBe(true);
    expect(usedBy(index, recipes, get("screen.site/home"))).toEqual([]);
  });
  test("labels: every facet of the type but the type, the vocabulary's labels, an explicit no label, no fallback", () => {
    const a = get("block.about/split");
    const f = passportFacets(index, a, "fr");
    expect(f.map((x) => x.id)).toEqual(index.facets.filter((x) => x.id !== "type" && (!x.types || x.types.includes("block"))).map((x) => x.id));
    const pattern = f.find((x) => x.id === "pattern")!;
    expect(a.labels.pattern).toEqual([]);
    expect(pattern.values).toEqual([]);
    expect(pattern.any).toBe(false);
    const job = f.find((x) => x.id === "job")!;
    expect(job.values.map((x) => x.id)).toEqual(a.labels.job!);
    expect(job.draft).toBe(true);
    const screenFacets = passportFacets(index, get("screen.site/home"), "en").map((x) => x.id);
    expect(screenFacets).toContain("pattern");
    expect(screenFacets).not.toContain("layout");
  });
  test("similar: same type, other blocks or screens, one per collapse key, deterministic", () => {
    for (const id of ["block.about/split", "block.hero/centered", "screen.site/home"]) {
      const a = get(id);
      const s = similar(index, a);
      expect(s.length).toBe(4);
      expect(s.every((x) => x.type === a.type && x.group !== a.group)).toBe(true);
      expect(new Set(s.map((x) => x.group)).size).toBe(s.length);
      expect(similar(index, a).map((x) => x.id)).toEqual(s.map((x) => x.id));
    }
    const hero = get("block.hero/centered");
    const first = similar(index, hero)[0]!;
    expect(first.labels.layout?.some((l) => hero.labels.layout?.includes(l))).toBe(true);
  });
  test("key facts: the runtimes every asset renders in (the shared facet), the count of blocks or variants", () => {
    const v = detailView(index, recipes, get("screen.site/home"), "en");
    expect(v.runtimes.map((r) => r.id)).toEqual(["svelte", "react", "vue", "solid", "templ", "twig", "jinja2", "latte"]);
    expect(v.parts.length).toBe(5);
    expect(detailView(index, recipes, get("block.about/split"), "en").parts.length).toBe(index.assets.filter((x) => x.group === "block.about").length);
  });
  test("tags link into the catalog filtered by the value; only labels the asset carries", () => {
    const a = get("screen.site/home");
    const v = detailView(index, recipes, a, "en");
    expect(v.tags.length).toBeGreaterThan(0);
    for (const tag of v.tags) {
      const [f, val] = tag.key.split(":");
      expect(a.labels[f!]).toContain(val!);
      expect(parseRoute(tag.href).kind).toBe("search");
      expect(tag.href).toContain(`${f}=${val}`);
    }
  });
  test("page map: one row per block of the page, in page order, with its first composition or none", () => {
    const a = get("screen.site/home");
    const rows = pageMap(index, recipes, a, "en");
    expect(rows.map((r) => r.title)).toEqual(detailView(index, recipes, a, "en").parts.map((p) => p.title));
    for (const r of rows) if (r.composition) expect(r.compositionLabel.length).toBeGreaterThan(0); else expect(r.compositionLabel).toBe("");
    expect(pageMap(index, recipes, get("block.about/split"), "en").length).toBe(1);
  });
  test("pattern definitions: in the current language only, null where none is written (no fallback)", () => {
    const defs: Definitions = Object.fromEntries(termsJson.terms.map((x) => [x.id, x.definition as Definitions[string]]));
    const en = detailView(index, recipes, get("screen.site/home"), "en", defs);
    expect(en.patterns.length).toBeGreaterThan(0);
    expect(en.patterns.every((p) => typeof p.definition === "string")).toBe(true);
    const ru = detailView(index, recipes, get("screen.site/home"), "ru", defs);
    expect(ru.patterns.every((p) => p.definition === null)).toBe(true);
    expect(detailView(index, recipes, get("block.about/split"), "en", defs).patterns).toEqual([]);
  });
  test("related rows: the same pattern, the same blocks (or the pages of the block), no group twice", () => {
    const a = get("screen.site/home");
    const seen = new Set([a.group]);
    const pat = samePattern(index, a, 4, seen);
    const blocks = sameBlocks(index, recipes, a, 4, seen);
    expect(pat.length).toBeGreaterThan(0);
    for (const x of pat) expect((x.labels.pattern ?? []).some((v) => (a.labels.pattern ?? []).includes(v))).toBe(true);
    expect(blocks.every((x) => x.type === "screen")).toBe(true);
    const all = [...pat, ...blocks].map((x) => x.group);
    expect(new Set(all).size).toBe(all.length);
    expect(all).not.toContain(a.group);
    expect(samePattern(index, get("block.about/split"))).toEqual([]);
    const hero = get("block.hero/centered");
    expect(sameBlocks(index, recipes, hero).map((x) => x.id).every((id) => usedBy(index, recipes, hero).some((u) => u.key === id))).toBe(true);
  });
  test("find similar: the type and the patterns, else the compositions", () => {
    expect(similarFilters(get("screen.site/home"))).toEqual({ type: ["screen"], pattern: get("screen.site/home").labels.pattern! });
    expect(similarFilters(get("block.about/split"))).toEqual({ type: ["block"], composition: ["two-column"] });
  });
});
