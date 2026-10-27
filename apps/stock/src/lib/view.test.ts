// The view models of Stock on the real index, the five dictionaries, and that every preview recipe resolves to kit organisms.
import { describe, expect, test } from "bun:test";
import { emptySearch, prepare, relaxations, search, type SearchState } from "@ui8kit/facet-search";
import { LOCALES } from "@ui8kit/facet-search/model";
import { partsOf, type Recipes } from "@ui8kit/layouts/preview/recipe";
import indexJson from "../../content/assets.v0.json";
import recipesJson from "../../content/previews.v0.json";
import en from "../../content/i18n/en.json";
import { TEXTS } from "./i18n";
import type { Index } from "./model";
import { cardView, chipViews, facetViews, popularViews, quickViews, refineViews, relaxViews, removeKey, resetFilters, selectedCount, suggestViews, typeViews, TYPE } from "./view";

const index = indexJson as unknown as Index;
const engine = prepare(index);
const recipes = recipesJson as unknown as Recipes;
const at = (s: Partial<SearchState>): SearchState => ({ ...emptySearch(), ...s });

const leaves = (o: unknown, p = ""): string[] => (o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => leaves(v, p + k + ".")) : [p]);

describe("stock view", () => {
  test("five dictionaries with the keys of English, every value non-empty, same placeholders", () => {
    const keys = leaves(en).sort();
    for (const l of LOCALES) {
      expect(leaves(TEXTS[l]).sort()).toEqual(keys);
      for (const k of keys) {
        const get = (d: unknown): string => k.slice(0, -1).split(".").reduce<unknown>((o, x) => (o as Record<string, unknown>)[x], d) as string;
        expect(get(TEXTS[l]).length).toBeGreaterThan(0);
        expect(get(TEXTS[l]).match(/\{\w+\}/g) ?? []).toEqual(get(en).match(/\{\w+\}/g) ?? []);
      }
    }
  });

  test("type tabs: All first, then the types with assets; counts add up", () => {
    const out = search(engine, at({}));
    const tabs = typeViews(index, out, "en", TEXTS.en);
    expect(tabs.map((t) => t.id)).toEqual(["", "block", "screen"]);
    expect(tabs[0]!.count).toBe(tabs[1]!.count + tabs[2]!.count);
    expect(tabs[0]!.count).toBe(out.results.length);
  });

  test("the facet column: no type facet, typed facets only for their type, labels in the chosen language, drafts marked", () => {
    const all = facetViews(index, at({}), search(engine, at({})), "ru");
    expect(all.some((f) => f.id === TYPE)).toBe(false);
    expect(all.find((f) => f.id === "job")!.draft).toBe(true);
    expect(all.find((f) => f.id === "job")!.label).toBe(index.facets.find((f) => f.id === "job")!.label.ru!);
    const screens = at({ filters: { type: ["screen"] } });
    const ids = facetViews(index, screens, search(engine, screens), "en").map((f) => f.id);
    expect(ids).not.toContain("slots");
    expect(ids).not.toContain("layout");
    expect(ids).toContain("job");
    const pattern = all.find((f) => f.id === "pattern")!;
    expect(pattern.draft).toBe(false);
    expect(pattern.values.find((v) => v.id === "modular-grid")!.draft).toBeUndefined();
    expect(pattern.values.find((v) => v.id === "z-pattern")!.draft).toBe(true);
    expect(pattern.label).toBe(index.facets.find((f) => f.id === "pattern")!.label.ru!);
  });

  test("chips, removal and reset; the type tab is not a chip and survives reset", () => {
    const s = at({ q: "hero", spec: "block.hero", variants: "all", filters: { type: ["block"], job: ["hero", "pricing"] }, page: 3 });
    const chips = chipViews(index, s, "en", TEXTS.en);
    expect(chips.map((c) => c.key)).toEqual(["q", "spec", "f:job:hero", "f:job:pricing"]);
    expect(removeKey(s, "f:job:hero")).toEqual({ ...s, filters: { type: ["block"], job: ["pricing"] }, page: 1 });
    expect(removeKey(s, "spec")).toMatchObject({ spec: "", variants: "one", page: 1 });
    expect(resetFilters(s)).toEqual({ ...emptySearch(), filters: { type: ["block"] } });
    expect(selectedCount(s)).toBe(4);
  });

  test("quick filters exist in the vocabulary; an empty result offers the filters to drop", () => {
    const out = search(engine, at({}));
    const quick = quickViews(index, at({}), out, "en");
    expect(quick.length).toBe(index.quick.length);
    expect(quick.every((q) => q.count > 0)).toBe(true);
    const none = at({ q: "zzzzzz", filters: { job: ["hero"] } });
    const relax = relaxViews(index, relaxations(engine, none), "en", TEXTS.en);
    expect(search(engine, none).results.length).toBe(0);
    expect(relax[0]!.key).toBe("q");
  });

  test("every preview resolves to organisms of the kit, screens to their frame and area", async () => {
    const kit = (await import("@codegen-x/svelte-compose")) as Record<string, unknown>;
    let n = 0;
    for (const a of index.assets) {
      if (!a.preview) continue;
      const parts = partsOf(recipes, a.preview, "t");
      expect(parts.length).toBeGreaterThan(0);
      for (const p of parts) expect(kit[p.organism]).toBeDefined(); // a .svelte import is a path under bun: present is enough
      n++;
    }
    expect(n).toBe(index.assets.length);
  });

  test("suggestions: the text with its count, the facet values it names with real counts, the assets it names", () => {
    const s = at({});
    const bare = search(engine, s).counts;
    const total = (q: string): number => search(engine, at({ q })).results.length;
    expect(suggestViews(index, "  ", s, bare, total, "en")).toEqual([]);
    const got = suggestViews(index, "pric", s, bare, total, "en");
    expect(got[0]).toEqual({ key: "q", kind: "query", label: "pric", count: total("pric") });
    const f = got.find((x) => x.kind === "filter" && x.facet === "job" && x.value === "pricing");
    expect(f && f.kind === "filter" && f.count).toBe(bare.job!.get("pricing")!);
    expect(got.some((x) => x.kind === "asset" && /pric/i.test(x.label))).toBe(true);
    for (const x of got) if (x.kind === "filter") expect(x.count).toBeGreaterThan(0);
    // an applied value is not suggested again
    const on = at({ filters: { job: ["pricing"] } });
    expect(suggestViews(index, "pric", on, search(engine, on).counts, total, "en").some((x) => x.key === "f:job:pricing")).toBe(false);
    // the current language: Russian labels match
    const ru = index.facets.find((x) => x.id === "job")!.values.find((v) => v.id === "pricing")!.label.ru;
    if (ru) expect(suggestViews(index, ru.slice(0, 4), s, bare, total, "ru").some((x) => x.key === "f:job:pricing")).toBe(true);
  });

  test("refinements narrow: each keeps some but not all results, at most two per facet, none applied", () => {
    const s = at({ filters: { [TYPE]: ["block"] } });
    const out = search(engine, s);
    const rows = refineViews(index, s, out, "en");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(8);
    for (const r of rows) {
      expect(r.count).toBeGreaterThan(0);
      expect(r.count).toBeLessThan(out.results.length);
      expect(search(engine, { ...s, filters: { ...s.filters, [r.facet]: [r.value] } }).results.length).toBe(r.count);
    }
    const per = new Map<string, number>();
    for (const r of rows) per.set(r.facet, (per.get(r.facet) ?? 0) + 1);
    for (const n of per.values()) expect(n).toBeLessThanOrEqual(2);
    const on = at({ filters: { job: ["pricing"] } });
    expect(refineViews(index, on, search(engine, on), "en").some((r) => r.facet === "job")).toBe(false);
    expect(popularViews(index, search(engine, at({})), "en").length).toBeGreaterThan(0);
  });

  test("a card names its arrangement from its own labels", () => {
    const a = index.assets.find((x) => x.id === "block.about/split")!;
    expect(cardView(index, a, 1, "en").meta).toEqual(["Two columns", "Icons"]);
  });
});

