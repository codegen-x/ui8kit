// The engine on a synthetic index (no app data): counts, collapse, missing labels, soft facets, URL, pages, speed.
// apps/stock/src/lib/search.test.ts runs the same engine on the real Stock index.
import { describe, expect, test } from "bun:test";
import type { Asset, Facet, Index } from "./model";
import { emptySearch, parseSearch, setFacet, stringifySearch, toggleValue, type SearchState } from "./query";
import { pageWindow, paginate, prepare, relaxations, search } from "./search";

const facet = (id: string, values: string[], extra: Partial<Facet> = {}): Facet => ({
  id, label: { en: id, ru: id + "-ru" }, ui: "checkbox", order: 0, scope: "shared", source: "auto", derive: "rules", values: values.map((v) => ({ id: v, label: { en: v, fr: v + "-fr" } })), ...extra,
});
const FACETS: Facet[] = [
  facet("type", ["block", "screen"], { ui: "tabs" }),
  facet("colour", ["red", "green", "blue"]),
  facet("size", ["s", "m", "l"]),
  facet("tag", ["alpha", "beta"], { mode: "soft" }),
];
let seed = 11;
const rnd = (n: number): number => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
function makeIndex(n: number): Index {
  const assets: Asset[] = [];
  for (let i = 0; i < n; i++) {
    const g = Math.floor(i / 3);
    const labels: Record<string, string[]> = { type: [g % 4 ? "block" : "screen"] };
    // a third of the assets carry no colour label: "no label", never a value
    if (rnd(3)) labels["colour"] = [["red", "green", "blue"][rnd(3)]!, ...(rnd(4) ? [] : ["blue"])].filter((v, k, a) => a.indexOf(v) === k);
    else labels["colour"] = [];
    labels["size"] = [["s", "m", "l"][rnd(3)]!];
    if (rnd(2)) labels["tag"] = [["alpha", "beta"][rnd(2)]!];
    assets.push({ id: `a${i}`, type: labels["type"]![0]!, group: `g${g}`, title: `Item ${i} ${["hero", "pricing", "faq"][g % 3]}`, subtitle: `v${i % 3}`, spec: `block.g${g}`, order: i, labels, weak: [], missing: labels["colour"]!.length ? [] : ["colour"], fields: [{ w: 6, words: [`item`, ["hero", "pricing", "faq"][g % 3]!] }], preview: null });
  }
  return { version: "0", digest: "sha256:test", counts: {}, facets: FACETS, quick: [], sorts: [{ id: "relevance", label: { en: "Relevance" } }, { id: "catalog", label: { en: "Catalog" } }, { id: "name", label: { en: "Name" } }], assets };
}
const INDEX = makeIndex(300);
const E = prepare(INDEX);
const st = (p: Partial<SearchState>): SearchState => ({ ...emptySearch(), ...p });
const vocab = { facets: FACETS, sorts: INDEX.sorts };

describe("counts", () => {
  test("the count of a value is the result size when it is selected (collapsed and not)", () => {
    for (const base of [st({}), st({ variants: "all" }), st({ q: "hero" }), st({ filters: { size: ["m"] } })])
      for (const f of FACETS.filter((x) => x.mode !== "soft")) {
        if (base.filters[f.id]) continue;
        const out = search(E, base);
        for (const v of f.values) expect(out.counts[f.id]!.get(v.id)).toBe(search(E, setFacet(base, f.id, [v.id])).results.length);
      }
  });
  test("an asset without a label is never counted as a value and drops out once the facet is filtered", () => {
    const unlabelled = INDEX.assets.filter((a) => !a.labels["colour"]!.length).length;
    expect(unlabelled).toBeGreaterThan(0);
    const all = search(E, st({ variants: "all" }));
    const sum = [...all.counts["colour"]!.values()].reduce((a, b) => a + b, 0);
    const labelled = INDEX.assets.reduce((n, a) => n + a.labels["colour"]!.length, 0);
    expect(sum).toBe(labelled);
    const any = search(E, st({ variants: "all", filters: { colour: ["red", "green", "blue"] } }));
    expect(any.results.length).toBe(INDEX.assets.length - unlabelled);
  });
  test("OR within a facet, AND across facets; soft facets never filter", () => {
    const r = search(E, st({ filters: { colour: ["red"] } })).results.length, g = search(E, st({ filters: { colour: ["green"] } })).results.length;
    const both = search(E, st({ filters: { colour: ["red", "green"] } })).results.length;
    expect(both).toBeGreaterThanOrEqual(Math.max(r, g));
    expect(search(E, st({ filters: { colour: ["red"], size: ["s"] } })).results.length).toBeLessThanOrEqual(r);
    expect(search(E, st({ filters: { tag: ["alpha"] } })).results.length).toBe(search(E, st({})).results.length);
  });
  test("variants collapse by group", () => {
    expect(search(E, st({})).results.length).toBe(100);
    expect(search(E, st({ variants: "all" })).results.length).toBe(300);
  });
  test("labels in every locale reach the text search", () => {
    expect(search(E, st({ q: "red-fr", variants: "all" })).results.every((a) => a.labels["colour"]!.includes("red"))).toBe(true);
  });
  test("relaxations name what an empty result costs", () => {
    const s = st({ q: "pricing", filters: { type: ["screen"], size: ["s"] } });
    const h = relaxations(E, s);
    expect(h.length).toBe(3);
    expect(h[0]!.count).toBeGreaterThanOrEqual(h[h.length - 1]!.count);
  });
});

describe("URL and pages", () => {
  test("canonical round trip with the page; a new selection goes back to page 1", () => {
    const s = parseSearch("#/search?page=3&size=l,s&q=hero&colour=blue&nope=1", vocab);
    expect(s).toEqual({ q: "hero", filters: { colour: ["blue"], size: ["s", "l"] }, spec: "", variants: "one", sort: null, page: 3 });
    expect(stringifySearch(s, vocab)).toBe("q=hero&colour=blue&size=s,l&page=3");
    expect(parseSearch(stringifySearch(s, vocab), vocab)).toEqual(s);
    expect(toggleValue(s, "size", "m").page).toBe(1);
    expect(parseSearch("page=0", vocab).page).toBe(1);
    expect(parseSearch("page=abc", vocab).page).toBe(1);
  });
  test("paginate clamps and counts positions; the window keeps first and last", () => {
    const list = Array.from({ length: 50 }, (_, i) => i);
    expect(paginate(list, 1, 24)).toMatchObject({ page: 1, pages: 3, from: 1, to: 24 });
    expect(paginate(list, 3, 24)).toMatchObject({ items: [48, 49], page: 3, from: 49, to: 50 });
    expect(paginate(list, 9, 24).page).toBe(3);
    expect(paginate([], 2, 24)).toMatchObject({ page: 1, pages: 1, from: 0, to: 0 });
    expect(pageWindow(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });
});

describe("performance", () => {
  test("< 50 ms per search on 2,000 assets", () => {
    const big = prepare(makeIndex(2000));
    const states = [st({}), st({ q: "hero" }), st({ filters: { colour: ["red", "blue"], size: ["m"] } }), st({ q: "item", variants: "all", sort: "name" })];
    for (const s of states) search(big, s);
    let worst = 0;
    for (let r = 0; r < 5; r++) for (const s of states) { const t = performance.now(); search(big, s); worst = Math.max(worst, performance.now() - t); }
    expect(worst).toBeLessThan(50);
  });
});
