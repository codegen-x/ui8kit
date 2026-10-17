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
  // the contract rules of the magazine: no links (no routes, so no href) and media only as base64 data URIs of published media
  test("no href and no media other than data URIs in the data of the templates", () => {
    const { ui: _ui, ...data } = makeData("Keystra");
    const hrefs: string[] = [], media: string[] = [];
    const walk = (v: unknown, path: string): void => {
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
        if (/^href$/i.test(k) && x) hrefs.push(`${path}.${k}`);
        if (/^(image|src|avatar|cover|photo|file|logo)$/i.test(k) && typeof x === "string" && x && !x.startsWith("data:image/")) media.push(`${path}.${k}`);
        walk(x, `${path}.${k}`);
      }
    };
    walk(data, "d");
    expect(hrefs).toEqual([]);
    expect(media).toEqual([]);
  });
});
