import { describe, expect, test } from "bun:test";
import { FONT_IDS } from "../font-ids";
import { RADII, SKIN_IDS, variantKey } from "../taste";
import { TASTES } from "../tastes";
import { colourWords, SKIN_WORDS } from "./colour-words";
import { activeCount, buildCorpus, type Ctx, effectiveSort, emptySearch, FACETS, parseSearch, queryTokens, relevance, runSearch, searchHash, similarityScores, stringifySearch, type Item } from "./index";

// a deterministic 820-style corpus shaped like the Discovery wall (every screen in several skins, fonts and radii)
const styles = Array.from({ length: 900 }, (_, i) => {
  const t = TASTES[i % TASTES.length]!;
  const skin = SKIN_IDS[(i * 7 + (i % 3)) % SKIN_IDS.length]!;
  const display = FONT_IDS[(i * 3) % FONT_IDS.length]!, body = FONT_IDS[(i * 5 + 1) % FONT_IDS.length]!;
  const fonts = { display, body: i % 2 ? display : body };
  const radius = RADII[i % RADII.length]!;
  return { key: variantKey({ screen: t.id, skin, fonts, radius } as never), screen: t.id, skin, fonts, radius };
});
const ITEMS = buildCorpus(styles.slice(0, 820));
const none: Ctx = { hearted: new Set<string>(), similar: null };
const run = (patch: Partial<ReturnType<typeof emptySearch>>, ctx: Ctx = none) => runSearch(ITEMS, { ...emptySearch(), ...patch }, ctx);

describe("corpus", () => {
  test("unique keys, wall styles first, included styles added", () => {
    expect(new Set(ITEMS.map((i) => i.key)).size).toBe(ITEMS.length);
    expect(ITEMS.length).toBeGreaterThanOrEqual(800);
    expect(ITEMS.some((i) => i.included)).toBe(true);
    for (const i of ITEMS) { expect(i.layout.length).toBeGreaterThan(0); expect(i.pattern.length).toBeGreaterThan(0); }
  });
});

describe("query parse", () => {
  test("round trip, canonical order, values dropped when unknown", () => {
    const s = parseSearch("#/search?sort=newest&radius=8,0&q=dark%20hero&skin=sky,claude,nope&font=inter&layout=fullbleed,dense&theme=dark&included=1&pattern=radial&recipe=mesh");
    expect(s).toEqual({ q: "dark hero", skin: ["sky", "claude"], font: ["inter"], radius: [0, 8], pattern: ["radial"], layout: ["fullbleed", "dense"], recipe: ["mesh"], theme: ["dark"], included: true, hearted: false, sort: "newest" });
    const q = stringifySearch(s);
    expect(q).toBe("q=dark%20hero&skin=sky,claude&font=inter&radius=0,8&pattern=radial&layout=fullbleed,dense&recipe=mesh&theme=dark&included=1&sort=newest");
    expect(parseSearch(q)).toEqual(s);
    expect(parseSearch("#/search?" + q)).toEqual(s);
  });
  test("empty, repeated keys, junk", () => {
    expect(stringifySearch(emptySearch())).toBe("");
    expect(searchHash(emptySearch())).toBe("#/search");
    expect(parseSearch("#/search")).toEqual(emptySearch());
    expect(parseSearch("skin=sky&skin=claude&radius=7&sort=bogus&included=0").skin).toEqual(["sky", "claude"]);
    expect(parseSearch("radius=7&sort=bogus&included=0")).toEqual(emptySearch());
    expect(parseSearch("q=%20%20a%20%20b%20").q).toBe("a b");
    expect(queryTokens("Dark, warm-ish  T146")).toEqual(["dark", "warm", "ish", "t146"]);
  });
  test("activeCount", () => {
    expect(activeCount(emptySearch())).toBe(0);
    expect(activeCount({ ...emptySearch(), q: "a", skin: ["sky", "claude"], included: true, theme: ["dark"] })).toBe(5);
    expect(activeCount({ ...emptySearch(), theme: ["dark", "light"] })).toBe(0);
  });
});

describe("colour words", () => {
  test("deterministic mapping from the skin tokens", () => {
    expect(colourWords("modern-minimal")).toContain("blue");
    expect(colourWords("modern-minimal")).toContain("cool");
    expect(colourWords("doom-64")).toEqual(expect.arrayContaining(["red", "warm", "dark", "blue"])); // red primary, blue accent
    expect(colourWords("amber-minimal")).toEqual(expect.arrayContaining(["orange", "warm", "light"]));
    expect(colourWords("notebook")).toEqual(expect.arrayContaining(["neutral", "grey", "dark"]));
    expect(colourWords("violet-bloom")).toEqual(expect.arrayContaining(["purple", "cool", "dark", "vivid"]));
    expect(colourWords("bubblegum")).toEqual(expect.arrayContaining(["pink", "warm"]));
    expect(colourWords("nope")).toEqual([]);
    expect(colourWords("sky")).toEqual(colourWords("sky"));
    for (const s of SKIN_IDS) expect(SKIN_WORDS[s]!.some((w) => w === "warm" || w === "cool" || w === "neutral")).toBe(true);
    expect(SKIN_IDS.some((s) => SKIN_WORDS[s]!.includes("dark"))).toBe(true);
  });
  test("a colour word finds styles through the query", () => {
    const r = run({ q: "dark" });
    expect(r.results.length).toBeGreaterThan(0);
    for (const i of r.results) expect(colourWords(i.skin).includes("dark") || relevance(i, ["dark"]) > 0).toBe(true);
    const blue = run({ q: "blue" });
    expect(new Set(blue.results.map((i) => i.skin))).toEqual(new Set(SKIN_IDS.filter((s) => colourWords(s).includes("blue") ).filter((s) => ITEMS.some((i) => i.skin === s))));
  });
});

describe("text query", () => {
  test("every token must match; prefix; ids; fonts; layouts; empty result", () => {
    const one = ITEMS[0]!;
    expect(run({ q: one.skin.split("-")[0]! }).results.some((i) => i.key === one.key)).toBe(true);
    expect(run({ q: one.screen.slice(0, 4) + " " + one.layout }).results.every((i) => i.layout === one.layout)).toBe(true);
    expect(run({ q: "plex" }).results.every((i) => i.fonts.display === "ibm-plex-sans" || i.fonts.body === "ibm-plex-sans")).toBe(true);
    expect(run({ q: "fullbleed" }).results.every((i) => i.layout === "fullbleed")).toBe(true);
    expect(run({ q: "full-bleed" }).results.length).toBe(run({ q: "fullbleed" }).results.length);
    expect(run({ q: "zzzz nothing" }).results).toEqual([]);
    expect(run({ q: "dark zzzz" }).results).toEqual([]);
  });
  test("relevance: an exact skin word outranks a prefix and a screen id word", () => {
    const sky = ITEMS.find((i) => i.skin === "sky")!;
    expect(relevance(sky, ["sky"])).toBe(12);
    expect(relevance(sky, ["sk"])).toBe(6);
    expect(relevance(sky, ["zz"])).toBe(0);
    expect(relevance(sky, [])).toBe(1);
    const r = run({ q: "sky", sort: "relevance" });
    expect(r.sort).toBe("relevance");
    expect(r.results[0]!.skin).toBe("sky");
  });
});

describe("filters and facets", () => {
  test("multi-select is OR inside a facet, AND across facets", () => {
    const a = run({ skin: ["sky"] }).results.length, b = run({ skin: ["claude"] }).results.length;
    expect(run({ skin: ["sky", "claude"] }).results.length).toBe(a + b);
    const both = run({ skin: ["sky", "claude"], radius: [0, 16] });
    expect(both.results.every((i) => (i.skin === "sky" || i.skin === "claude") && (i.radius === 0 || i.radius === 16))).toBe(true);
  });
  test("font matches either face of the pair", () => {
    const r = run({ font: ["inter"] });
    expect(r.results.every((i) => i.fonts.display === "inter" || i.fonts.body === "inter")).toBe(true);
    expect(r.results.length).toBe(ITEMS.filter((i) => i.fonts.display === "inter" || i.fonts.body === "inter").length);
  });
  test("facet counts follow the other filters but not their own", () => {
    const base = run({ skin: ["sky"], radius: [8] });
    // radius counts: obey skin=sky, ignore the radius selection itself
    for (const r of RADII) expect(base.facets.radius.get(r)).toBe(ITEMS.filter((i) => i.skin === "sky" && i.radius === r).length);
    // skin counts: obey radius=8, ignore skin
    for (const s of SKIN_IDS) expect(base.facets.skin.get(s)).toBe(ITEMS.filter((i) => i.skin === s && i.radius === 8).length);
    // a facet that has no selection counts under every selection
    for (const l of base.facets.layout.keys()) expect(base.facets.layout.get(l)).toBe(ITEMS.filter((i) => i.layout === l && i.skin === "sky" && i.radius === 8).length);
    // with no filter the counts sum to the corpus (font counts a pair twice)
    const all = run({});
    for (const f of FACETS.filter((f) => f !== "font")) expect([...all.facets[f].values()].reduce((a, b) => a + b, 0)).toBe(ITEMS.length);
  });
  test("the query narrows the counts; included and hearted toggles", () => {
    const q = run({ q: "dark" });
    expect([...q.facets.skin.values()].reduce((a, b) => a + b, 0)).toBe(q.results.length);
    const inc = run({ included: true });
    expect(inc.results.every((i) => i.included)).toBe(true);
    expect(inc.included).toBe(inc.results.length);
    const hearted = new Set([ITEMS[3]!.key, ITEMS[40]!.key]);
    const h = run({ hearted: true }, { hearted, similar: null });
    expect(h.results.map((i) => i.key).sort()).toEqual([...hearted].sort());
    expect(h.hearted).toBe(2);
    expect(run({ skin: [ITEMS[3]!.skin] }, { hearted, similar: null }).hearted).toBeGreaterThanOrEqual(1);
    expect(run({ included: true }, { hearted, similar: null }).hearted).toBe(ITEMS.filter((i) => hearted.has(i.key) && i.included).length);
  });
  test("an empty result still reports counts (all zero)", () => {
    const r = run({ q: "zzzz" });
    expect(r.results).toEqual([]);
    expect([...r.facets.skin.values()].every((n) => n === 0)).toBe(true);
  });
});

describe("sort", () => {
  const picks = ITEMS.slice(0, 10).map((i) => i.key);
  const similar = similarityScores(ITEMS, picks);
  test("default sort: relevance with a query, similarity with picks, else skin", () => {
    expect(effectiveSort(emptySearch(), false)).toBe("skin");
    expect(effectiveSort(emptySearch(), true)).toBe("similar");
    expect(effectiveSort({ ...emptySearch(), q: "x" }, true)).toBe("relevance");
    expect(effectiveSort({ ...emptySearch(), sort: "relevance" }, true)).toBe("similar");
    expect(effectiveSort({ ...emptySearch(), sort: "similar" }, false)).toBe("skin");
    expect(effectiveSort({ ...emptySearch(), sort: "newest" }, true)).toBe("newest");
  });
  test("newest: highest screen number first, ties by skin then key", () => {
    const r = run({ sort: "newest" }).results;
    for (let i = 1; i < r.length; i++) expect(r[i - 1]!.n).toBeGreaterThanOrEqual(r[i]!.n);
  });
  test("skin: vocabulary order of the skins", () => {
    const r = run({ sort: "skin" }).results;
    const order = (s: string) => SKIN_IDS.indexOf(s as never);
    for (let i = 1; i < r.length; i++) expect(order(r[i - 1]!.skin)).toBeLessThanOrEqual(order(r[i]!.skin));
  });
  test("similar: by the recommender score, best first; deterministic", () => {
    expect(similar).not.toBeNull();
    const r = run({}, { hearted: new Set(), similar }).results;
    for (let i = 1; i < r.length; i++) expect(similar!.get(r[i - 1]!.key)!).toBeGreaterThanOrEqual(similar!.get(r[i]!.key)!);
    expect(run({}, { hearted: new Set(), similar }).results.map((i) => i.key)).toEqual(r.map((i) => i.key));
    expect(similarityScores(ITEMS, [])).toBeNull();
  });
});

describe("performance", () => {
  test("filtering 820 styles with a query, filters and facet counts takes < 20 ms", () => {
    const similar = similarityScores(ITEMS, ITEMS.slice(0, 10).map((i) => i.key));
    const s = { ...emptySearch(), q: "dark warm", skin: ["sky", "claude", "doom-64"], radius: [0, 4, 8], layout: ["poster", "split"] };
    run(s, { hearted: new Set(), similar }); // warm up the JIT
    const t0 = performance.now();
    for (let i = 0; i < 10; i++) runSearch(ITEMS, s, { hearted: new Set(), similar });
    const per = (performance.now() - t0) / 10;
    expect(ITEMS.length).toBeGreaterThanOrEqual(820);
    expect(per).toBeLessThan(20);
    const t1 = performance.now();
    runSearch(ITEMS, emptySearch(), { hearted: new Set(), similar });
    expect(performance.now() - t1).toBeLessThan(20);
  });
});
