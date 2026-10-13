import { expect, test } from "bun:test";
import { isRouteHash, buildHash, collectionView, fromCodex, matchRoute, parseHash, parseSort, screenActions, type UrlPort } from "../assets/app/core";
import { at, fmtMoney, fmtNumber, tpl } from "../assets/ts/format";

const rows = [
  { name: "Beta", price: 20, tagline: "second" },
  { name: "Alpha", price: 30, tagline: "first" },
  { name: "Gamma", price: 10, tagline: "third" },
  { name: "Delta", price: 5, tagline: "alpha again" },
];
const cfg = { searchFields: ["name", "tagline"], pageSize: 3, defaultSort: "price:asc" } as const;

test("collectionView sorts, searches and pages", () => {
  const v = collectionView(rows, cfg, {});
  expect(v.rows.map((r) => r.name)).toEqual(["Delta", "Gamma", "Beta"]);
  expect([v.total, v.page, v.pages, v.from, v.to]).toEqual([4, 1, 2, 1, 3]);
  expect(collectionView(rows, cfg, { sort: "name:desc" }).rows.map((r) => r.name)).toEqual(["Gamma", "Delta", "Beta"]);
  expect(collectionView(rows, cfg, { q: "ALPHA" }).rows.map((r) => r.name)).toEqual(["Delta", "Alpha"]);
  const p2 = collectionView(rows, cfg, { page: "2" });
  expect(p2.rows.map((r) => r.name)).toEqual(["Alpha"]);
  expect(p2.qs).toBe("?page=2");
  expect(collectionView(rows, cfg, { page: "99" }).page).toBe(2);
  expect(collectionView(rows, cfg, { q: "zzz" })).toMatchObject({ total: 0, from: 0, to: 0, pages: 1 });
});

test("the query string keeps only what differs from the defaults", () => {
  expect(collectionView(rows, cfg, { sort: "price:asc" }).qs).toBe("");
  expect(collectionView(rows, cfg, { sort: "name:desc", q: "a" }).qs).toBe("?q=a&sort=name:desc");
  expect(parseSort(undefined, "price:asc")).toEqual({ field: "price", dir: "asc" });
});

test("fromCodex flattens entries by path", () => {
  const out = fromCodex<{ title: string; price: number }>([{ title: { en: "X" }, metadata: { price: { value: 7 } } }], { title: "title.en", price: "metadata.price.value" });
  expect(out).toEqual([{ title: "X", price: 7 }]);
});

test("routes match with params", () => {
  const routes = [{ path: "plans", area: "list" }, { path: "plans/:id", area: "record" }];
  expect(matchRoute(routes, "plans")).toEqual({ area: "list", params: {} });
  expect(matchRoute(routes, "plans/a%20b")).toEqual({ area: "record", params: { id: "a b" } });
  expect(matchRoute(routes, "other")).toBeNull();
});

test("hash parse and build round-trip", () => {
  const h = buildHash("plans", { sort: "price:desc", page: undefined, q: "a b" });
  expect(h).toBe("#/plans?sort=price:desc&q=a+b");
  expect(parseHash(h)).toEqual({ path: "plans", query: { sort: "price:desc", q: "a b" } });
  expect(parseHash("")).toEqual({ path: "", query: {} });
  expect([isRouteHash(""), isRouteHash("#/pricing"), isRouteHash("#main-content")]).toEqual([true, true, false]);
});

test("screen actions only change the URL and keep the list state", () => {
  const calls: Array<[string, Record<string, string | undefined> | undefined]> = [];
  const url: UrlPort = { path: "plans", query: { sort: "name:asc" }, go: (p, q) => calls.push([p, q]) };
  const view = collectionView(rows, cfg, { sort: "name:asc" });
  const a = screenActions(url, view, "plans", (id) => `plans/${id}`, () => {});
  a.sort("name");
  a.search("x");
  a.page(2);
  a.open("p1");
  a.back();
  expect(calls).toEqual([
    ["plans", { sort: "name:desc", page: undefined }],
    ["plans", { sort: "name:asc", q: "x", page: undefined }],
    ["plans", { sort: "name:asc", page: "2" }],
    ["plans/p1", { sort: "name:asc" }],
    ["plans", { sort: "name:asc" }],
  ]);
});

test("formatters", () => {
  expect(tpl("{0} of {1}", 2, 5)).toBe("2 of 5");
  expect(fmtMoney(1499, "USD")).toBe("$1,499");
  expect(fmtNumber(12000)).toBe("12,000");
  expect(at({ a: "A" }, "a")).toBe("A");
  expect(at({ a: "A" }, "b")).toBe("b");
});

test("uniqLabel drops a segment equal to the one before it", async () => {
  const { uniqLabel } = await import("../assets/ts/format");
  expect(uniqLabel("Footer, Footer, Centered")).toBe("Footer, Centered");
  expect(uniqLabel("Main navigation, main navigation, Bar")).toBe("Main navigation, Bar");
  expect(uniqLabel("Footer, Centered, Footer")).toBe("Footer, Centered, Footer");
  expect(uniqLabel(undefined)).toBe("");
});
