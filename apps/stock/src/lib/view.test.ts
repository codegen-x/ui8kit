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
import { chipViews, facetViews, quickViews, relaxViews, removeKey, resetFilters, selectedCount, typeViews, TYPE } from "./view";

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
});
