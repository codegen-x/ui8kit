import { describe, expect, test } from "bun:test";
import { makeData, rebrand } from "./data";

describe("template data", () => {
  test("rebrand swaps the fixtures' one fictional name for the deck wordmark, deeply, keeping case", () => {
    const out = rebrand({ a: "Northwind Freight", b: ["northwind"], c: { d: 3 } }, "Keystra");
    expect(out).toEqual({ a: "Keystra Freight", b: ["keystra"], c: { d: 3 } });
  });
  test("every collection a template reads is filled, and no fixture name leaks through the rebranded parts", () => {
    const d = makeData("Keystra");
    for (const k of ["posts", "products", "projects", "tiers", "faq", "sidenav", "metrics", "series", "article", "photos", "sitemap"] as const) expect(d[k].length).toBeGreaterThan(0);
    expect(JSON.stringify([d.projects, d.sidenav, d.ui]).toLowerCase()).not.toContain("northwind");
  });
});
