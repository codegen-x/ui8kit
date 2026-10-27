import { describe, expect, test } from "bun:test";
import indexJson from "../../content/assets.v0.json";
import type { Asset, Index } from "./model";
import { emptySearch, parseSearch, searchHash, setFacet, stringifySearch, toggleValue, type SearchState } from "./query";
import { prepare, queryTokens, relaxations, search } from "./search";

const INDEX = indexJson as unknown as Index;
const E = prepare(INDEX);
const vocab = { facets: INDEX.facets, sorts: INDEX.sorts };
const st = (patch: Partial<SearchState>): SearchState => ({ ...emptySearch(), ...patch });
const filtering = INDEX.facets.filter((f) => f.mode !== "soft");

/** a few base states that the per-value checks run under (none of them touches the facet under test) */
const bases = (facet: string): SearchState[] => [
  st({}),
  st({ variants: "all" }),
  ...(facet === "type" ? [st({ filters: { section: ["marketing"] } }), st({ q: "card" })] : [st({ filters: { type: ["block"] } }), st({ filters: { type: ["block"] }, variants: "all" })]),
  ...(facet === "density" || facet === "type" ? [] : [st({ filters: { type: ["block"], density: ["dense"] } })]),
  ...(facet === "job" ? [] : [st({ q: "hero" })]),
];

describe("disjunctive counts", () => {
  test("the count of a value equals the size of the result when it is selected (every facet, every value)", () => {
    let checked = 0;
    for (const f of filtering) for (const base of bases(f.id)) {
      if (base.filters[f.id]) continue;
      const out = search(E, base);
      for (const v of f.values) {
        const n = out.counts[f.id]!.get(v.id)!;
        expect({ f: f.id, v: v.id, n: search(E, setFacet(base, f.id, [v.id])).results.length }).toEqual({ f: f.id, v: v.id, n });
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(500);
  });
  test("a facet's counts ignore its own selection: count(b) under job=a is the result of job=b", () => {
    const base = st({ filters: { type: ["block"], job: ["hero"] } });
    const out = search(E, base);
    for (const v of INDEX.facets.find((f) => f.id === "job")!.values) expect(out.counts["job"]!.get(v.id)).toBe(search(E, setFacet(base, "job", [v.id])).results.length);
  });
  test("multi-select is OR within a facet, AND across facets", () => {
    const a = search(E, st({ filters: { job: ["hero"] } })).results.length;
    const b = search(E, st({ filters: { job: ["pricing"] } })).results.length;
    const both = search(E, st({ filters: { job: ["hero", "pricing"] } })).results.length;
    expect(both).toBeGreaterThanOrEqual(Math.max(a, b));
    expect(both).toBeLessThanOrEqual(a + b);
    expect(search(E, st({ filters: { job: ["hero"], density: ["dense"] } })).results.length).toBeLessThanOrEqual(a);
  });
  test("variants collapse into one card per block; every variant with variants=all", () => {
    const one = search(E, st({ filters: { type: ["block"] } }));
    expect(one.results.length).toBe(92);
    expect(new Set(one.results.map((a) => a.group)).size).toBe(92);
    const all = search(E, st({ filters: { type: ["block"] }, variants: "all" }));
    expect(all.results.length).toBe(INDEX.counts["block"]!);
    expect(one.counts["type"]!.get("block")).toBe(92);
    expect(all.counts["type"]!.get("block")).toBe(INDEX.counts["block"]!);
    const hero = search(E, st({ spec: "block.hero", variants: "all" }));
    expect(hero.results.every((a) => a.spec === "block.hero")).toBe(true);
    expect(hero.results.length).toBe(one.variantsOf.get("block.hero") ?? -1);
  });
  test("wildcards: a block matches every skin and radius", () => {
    const sky = search(E, st({ filters: { type: ["block"], skin: ["sky"] } }));
    expect(sky.results.length).toBe(92);
    expect(search(E, st({ filters: { skin: ["sky"] } })).counts["type"]!.get("skin")).toBe(1);
  });
  test("soft facets rank and never filter", () => {
    const base = search(E, st({}));
    const soft = search(E, st({ filters: { industry: ["ecommerce"] } }));
    expect(soft.results.length).toBe(base.results.length);
    expect(soft.results[0]!.labels["industry"]).toContain("ecommerce");
  });
});

describe("text and sorts", () => {
  test("tokens in any script, prefix match, every token must match", () => {
    expect(queryTokens("Bento, two-col  Hero")).toEqual(["bento", "two", "col", "hero"]);
    const r = search(E, st({ q: "bento" })).results;
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.title.toLowerCase()).toContain("bento");
    expect(search(E, st({ q: "pric" })).results.length).toBeGreaterThan(0);
    expect(search(E, st({ q: "zzzqqq" })).results.length).toBe(0);
    // vocabulary synonyms reach the text search: "testimonials" finds the blocks of that job
    expect(search(E, st({ q: "testimonials", filters: { type: ["block"] } })).results.some((a) => a.labels["job"]!.includes("testimonials"))).toBe(true);
  });
  test("sorts: catalog by default, relevance with a query, name, unlabelled first", () => {
    expect(search(E, st({})).sort).toBe("catalog");
    expect(search(E, st({ q: "hero" })).sort).toBe("relevance");
    const byName = search(E, st({ sort: "name", filters: { type: ["block"] } })).results.map((a) => (a.title + " " + a.subtitle).toLowerCase());
    expect(byName).toEqual([...byName].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    const un = search(E, st({ sort: "unlabelled" })).results;
    expect(un[0]!.missing.length).toBe(Math.max(...un.map((a) => a.missing.length)));
  });
  test("an empty result names the filters to drop", () => {
    const s = st({ filters: { type: ["skin"], job: ["hero"] } });
    expect(search(E, s).results.length).toBe(0);
    const hints = relaxations(E, s);
    expect(hints[0]!.count).toBeGreaterThan(0);
  });
});

describe("canonical URL", () => {
  test("round trip without loss, canonical order", () => {
    const s = parseSearch("#/search?sort=name&density=dense,airy&q=dark%20hero&job=pricing,hero,nope&bogus=1&variants=all&spec=block.hero", vocab);
    expect(s).toEqual({ q: "dark hero", filters: { job: ["hero", "pricing"], density: ["airy", "dense"] }, spec: "block.hero", variants: "all", sort: "name" });
    const q = stringifySearch(s, vocab);
    expect(q).toBe("q=dark%20hero&job=hero,pricing&density=airy,dense&spec=block.hero&variants=all&sort=name");
    expect(parseSearch(q, vocab)).toEqual(s);
    expect(parseSearch(searchHash(s, vocab), vocab)).toEqual(s);
    expect(stringifySearch(emptySearch(), vocab)).toBe("");
    expect(parseSearch("#/search", vocab)).toEqual(emptySearch());
    expect(parseSearch("job=hero&job=faq&sort=bogus&spec=../x", vocab)).toEqual(st({ filters: { job: ["hero", "faq"] } }));
  });
  test("random states survive the round trip (seeded)", () => {
    let seed = 7;
    const rnd = (n: number): number => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
    for (let i = 0; i < 300; i++) {
      let s = st({ q: ["", "hero", "a b", "price & plan"][rnd(4)]!, variants: rnd(2) ? "all" : "one", sort: [null, ...INDEX.sorts.map((x) => x.id)][rnd(INDEX.sorts.length + 1)]!, spec: rnd(3) ? "" : "block.cta" });
      for (let k = rnd(5); k > 0; k--) { const f = INDEX.facets[rnd(INDEX.facets.length)]!; if (f.values.length) s = toggleValue(s, f.id, f.values[rnd(f.values.length)]!.id); }
      const canon = parseSearch(stringifySearch(s, vocab), vocab);
      expect(parseSearch(stringifySearch(canon, vocab), vocab)).toEqual(canon);
      expect(stringifySearch(canon, vocab)).toBe(stringifySearch(s, vocab));
      for (const [f, vals] of Object.entries(s.filters)) expect([...canon.filters[f]!].sort()).toEqual([...vals].sort());
    }
  });
});

describe("performance", () => {
  test("< 50 ms per search on 2,000 assets", () => {
    const assets: Asset[] = [];
    for (let k = 0; assets.length < 2000; k++) for (const a of INDEX.assets) { if (assets.length >= 2000) break; assets.push({ ...a, id: `${a.id}#${k}`, group: `${a.group}#${k}`, order: assets.length }); }
    const big = prepare({ ...INDEX, assets });
    const states = [st({}), st({ q: "hero" }), st({ filters: { type: ["block"], job: ["hero", "pricing"], density: ["dense"] } }), st({ q: "card", filters: { composition: ["grid"] }, variants: "all", sort: "name" }), st({ filters: { industry: ["saas"], skin: ["sky"] } })];
    for (const s of states) search(big, s); // warm up
    const times: number[] = [];
    for (let r = 0; r < 5; r++) for (const s of states) { const t = performance.now(); search(big, s); times.push(performance.now() - t); }
    times.sort((a, b) => a - b);
    const worst = times[times.length - 1]!;
    console.log(`search on ${assets.length} assets: median ${times[times.length >> 1]!.toFixed(2)} ms, worst ${worst.toFixed(2)} ms`);
    expect(worst).toBeLessThan(50);
  });
});
