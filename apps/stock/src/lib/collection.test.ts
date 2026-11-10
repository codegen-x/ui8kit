// Collections and Compare on the real index: items from assets, the shelf from storage, toggles and limits, the
// buildy-collection:v1 document against the contract schema (scripts/fixtures/collection.schema.json, a copy of
// ui8kit/contract schemas/collection.schema.json at a7e9a7f), the Open in BuildY link and its size check, the page views.
import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import indexJson from "../../content/assets.v0.json";
import installJson from "../../content/install.v0.json";
import { TEXTS } from "./i18n";
import type { InstallIndex } from "./install";
import type { Index } from "./model";
import {
  activeOf, addCollection, assetIdOf, BUILDY_URL, buildyLink, decodeDoc, deleteCollection, emptyShelf, fileName, itemOf, kept, MAX_COMPARE,
  MAX_ITEMS, MAX_LINK, moveItem, newCollection, readShelf, removeItem, rename, setActive, setNote, toDoc, toggleCompare, toggleKept,
} from "./collection";
import { compareRows, compareViews, keptViews } from "./shelf-view";

const index = indexJson as unknown as Index;
const inst = installJson as unknown as InstallIndex;
const byId = new Map(index.assets.map((a) => [a.id, a]));
const at = (id: string) => byId.get(id)!;
const now = new Date("2026-11-11T09:00:00.000Z");
const rand = () => 0.5;
const schema = JSON.parse(fs.readFileSync(path.join(import.meta.dir, "../../scripts/fixtures/collection.schema.json"), "utf8"));
const valid = new Ajv2020({ strict: false, allErrors: true }).compile(schema);
const fresh = () => emptyShelf("Collection 1", now, rand);

describe("collections", () => {
  test("the chat target is the real BuildY chat, never staging", () => {
    expect(BUILDY_URL).toBe("https://buildychat.vercel.app");
    expect(BUILDY_URL).not.toContain("staging");
  });

  test("an item of every asset of the index; its asset id is the asset id", () => {
    for (const a of index.assets) {
      const it = itemOf(a);
      expect(assetIdOf(it)).toBe(a.id);
      expect(it.kind).toBe(a.type as "screen" | "block");
    }
    expect(itemOf(at("block.hero/centered"))).toEqual({ kind: "block", id: "block.hero", variant: "centered", registry: "hero-classic", title: "Hero / " + at("block.hero/centered").subtitle });
    expect(itemOf(at("screen.theme-food-grill/home"))).toMatchObject({ kind: "screen", id: "screen.theme-food-grill/home" });
  });

  test("toggle, limits, order, notes, rename, several collections", () => {
    let s = fresh();
    s = toggleKept(s, at("screen.theme-food-grill/home"), now);
    s = toggleKept(s, at("block.hero/centered"), now);
    s = toggleKept(s, at("block.dishshowcase/grid3"), now);
    expect(kept(s, "block.hero/centered")).toBe(true);
    s = moveItem(s, s.active, "block.dishshowcase/grid3", -1, now);
    expect(activeOf(s).items.map(assetIdOf)).toEqual(["screen.theme-food-grill/home", "block.dishshowcase/grid3", "block.hero/centered"]);
    expect(moveItem(s, s.active, "screen.theme-food-grill/home", -1, now)).toEqual(s);
    s = setNote(s, s.active, "block.hero/centered", "Big promo", now);
    expect(activeOf(s).items[2]).toMatchObject({ note: "Big promo" });
    s = setNote(s, s.active, "block.hero/centered", " ", now);
    expect("note" in activeOf(s).items[2]!).toBe(false);
    s = toggleKept(s, at("block.hero/centered"), now);
    expect(kept(s, "block.hero/centered")).toBe(false);
    s = removeItem(s, s.active, "block.dishshowcase/grid3", now);
    expect(activeOf(s).items.length).toBe(1);
    expect(rename(s, s.active, "   ", now)).toEqual(s);
    s = rename(s, s.active, "Grill promo", now);
    const first = s.active;
    s = addCollection(s, "Collection 2", new Date(now.getTime() + 1), rand);
    expect(s.collections.length).toBe(2);
    expect(activeOf(s).items).toEqual([]);
    s = setActive(s, first);
    expect(activeOf(s).title).toBe("Grill promo");
    s = deleteCollection(s, first, () => newCollection("Collection 1", now, rand));
    expect(s.collections.length).toBe(1);
    s = deleteCollection(s, s.active, () => newCollection("Collection 1", now, rand));
    expect(s.collections.length).toBe(1);
    expect(activeOf(s).items).toEqual([]);
    let full = fresh();
    for (const a of index.assets.slice(0, MAX_ITEMS + 5)) full = toggleKept(full, a, now);
    expect(activeOf(full).items.length).toBe(MAX_ITEMS);
  });

  test("compare holds at most four", () => {
    let s = fresh();
    const ids = index.assets.slice(0, MAX_COMPARE + 1).map((a) => a.id);
    for (const id of ids) s = toggleCompare(s, id);
    expect(s.compare).toEqual(ids.slice(0, MAX_COMPARE));
    s = toggleCompare(s, ids[0]!);
    expect(s.compare).toEqual(ids.slice(1, MAX_COMPARE));
  });

  test("the shelf from storage drops what it cannot read and never guesses", () => {
    expect(readShelf(null, fresh)).toEqual(fresh());
    expect(readShelf("{not json", fresh)).toEqual(fresh());
    let s = toggleKept(fresh(), at("block.hero/centered"), now);
    s = toggleCompare(s, "screen.site/home");
    expect(readShelf(JSON.stringify(s), fresh)).toEqual(s);
    const raw = { active: "nope", compare: ["screen.site/home", "x", "screen.site/home"], collections: [
      { id: "col-a", title: "A", createdAt: now.toISOString(), items: [{ kind: "block", id: "block.hero", variant: "centered" }, { kind: "block", id: "block.hero", variant: "centered" }, { kind: "block", id: "block.hero", variant: "1bad" }, { kind: "page", id: "x" }] },
      { id: "col-a", title: "dup" }, { id: "bad id", title: "B" }, { id: "col-c" },
    ] };
    const r = readShelf(JSON.stringify(raw), fresh);
    expect(r.collections.map((c) => c.id)).toEqual(["col-a"]);
    expect(r.active).toBe("col-a");
    expect(r.collections[0]!.items).toEqual([{ kind: "block", id: "block.hero", variant: "centered" }]);
    expect(r.compare).toEqual(["screen.site/home"]);
  });

  test("the document is a valid buildy-collection:v1 pinned to the index, and the link round-trips", () => {
    let s = fresh();
    for (const id of ["screen.theme-food-grill/home", "block.hero/centered", "block.dishshowcase/grid3", "block.grillbuilder/split"]) s = toggleKept(s, at(id), now);
    s = setNote(s, s.active, "block.grillbuilder/split", "Grünes Menü: build your own set", now);
    const doc = toDoc(activeOf(s), { assetsDigest: index.digest }, "rose", "https://app.codegen-x.com/");
    expect(valid(doc) ? [] : valid.errors).toEqual([]);
    expect(doc.pins.stock.assetsDigest).toMatch(/^sha256:[0-9a-f]{64}$/);
    const link = buildyLink(doc);
    expect(link.href.startsWith("https://buildychat.vercel.app/?collection=")).toBe(true);
    expect(link.href).not.toMatch(/[+/=]$/);
    expect(link.fits).toBe(true);
    expect(decodeDoc(link.href.split("collection=")[1]!)).toEqual(JSON.parse(JSON.stringify(doc)));
    expect(valid(toDoc(activeOf(fresh()), { assetsDigest: index.digest }, null, "https://app.codegen-x.com/"))).toBe(true);
  });

  test("a full collection is too long for a link: the page downloads the file instead", () => {
    let s = fresh();
    for (const a of index.assets.slice(0, MAX_ITEMS)) s = toggleKept(s, a, now);
    const doc = toDoc(activeOf(s), { assetsDigest: index.digest }, null, "https://app.codegen-x.com/");
    expect(valid(doc)).toBe(true);
    const link = buildyLink(doc);
    expect(link.length).toBeGreaterThan(MAX_LINK);
    expect(link.fits).toBe(false);
    expect(fileName("Grill promo: New Year!")).toBe("grill-promo-new-year.buildy-collection.json");
    expect(fileName("Ölmühle")).toBe("olmuhle.buildy-collection.json");
    expect(fileName("\u0428\u0430\u0448")).toBe("collection.buildy-collection.json");
  });

  test("page views: kept items, compare columns and rows", () => {
    let s = fresh();
    s = toggleKept(s, at("screen.theme-food-grill/home"), now);
    s = toggleKept(s, at("block.hero/centered"), now);
    const items = [...activeOf(s).items, { kind: "block" as const, id: "block.gone", variant: "x", title: "Gone" }];
    const v = keptViews(index, items, "en");
    expect(v.map((x) => [x.key, !!x.href])).toEqual([["screen.theme-food-grill/home", true], ["block.hero/centered", true], ["block.gone/x", false]]);
    expect(v[2]!.title).toBe("Gone");
    const ids = ["screen.theme-food-grill/home", "block.hero/centered"];
    expect(compareViews(index, ids, "ru").map((x) => x.key)).toEqual(ids);
    const rows = compareRows(index, inst, ids, "en", TEXTS.en);
    expect(rows[0]!.id).toBe("registry");
    expect(rows[0]!.values[1]).toBe("hero-classic");
    expect(rows[0]!.values[0]!.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.values.length).toBe(ids.length);
  });
});
