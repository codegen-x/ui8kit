// The routes and the detail page model on the real index and preview recipes.
import { describe, expect, test } from "bun:test";
import type { Recipes } from "@ui8kit/layouts/preview/recipe";
import indexJson from "../../content/assets.v0.json";
import recipesJson from "../../content/previews.v0.json";
import { detailView, pageUses, passportFacets, similar, usedBy, useId } from "./detail";
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
});
