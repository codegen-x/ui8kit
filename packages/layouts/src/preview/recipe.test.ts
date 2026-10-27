import { describe, expect, test } from "bun:test";
import { axisProps, blockPart, mergeProps, resolve, screenParts, sourcesOf, type Recipes } from "./recipe";

const R: Recipes = {
  version: "0",
  blocks: {
    hero: {
      organism: "Hero", defaults: { layout: "center", tone: "default" },
      sample: { title: { $: "ui.hero.title" }, actions: { cta: { $: "ui.hero.cta" }, href: "#/" }, items: { $: "feats" } },
      variants: [{ id: "center", set: {} }, { id: "split", set: { layout: "split", "media.kind": "image" }, props: { actions: { mode: "two" } } }],
      data: [{ as: "feats", collection: "features", fields: { id: "id" } }], orgProps: { Hero: ["id", "title", "actions", "items", "layout", "tone", "media"] },
    },
    plans: {
      organism: "Plans", alt: { axis: "view", values: ["cards", "table"], organism: "PlanTable" }, defaults: { view: "cards" },
      sample: { plan: { op: "pick", args: [{ $: "tiers" }, "b"] }, first: { op: "nth", args: [{ $: "tiers" }, 0] }, rows: { op: "list", args: [1, { op: "undef", args: [] }] }, only: "plans" },
      variants: [{ id: "cards", set: {} }, { id: "table", set: { view: "table" } }],
      data: [{ as: "tiers", collection: "tiers", fields: {} }], orgProps: { Plans: ["plan", "first", "rows", "only"], PlanTable: ["plan"] },
    },
  },
  screens: { shop: { name: "ShopScreen", before: [{ block: "hero", variant: "center", props: { links: { $: "nav.links" } } }], after: [], areas: { home: [{ block: "plans" }, { block: "nope" }] } } },
};
const ctx = { ui: { hero: { title: "Hi", cta: "Go" } }, data: { feats: [{ id: "f1" }], tiers: [{ id: "a" }, { id: "b" }] }, nav: { links: [1, 2], current: "home" } };

describe("recipe", () => {
  test("merge order: sample < axes < variant props < the use; grouped axes; nested groups merge", () => {
    expect(axisProps({ layout: "split", "media.kind": "image" })).toEqual({ layout: "split", media: { kind: "image" } });
    expect(mergeProps({ a: { x: 1, y: 2 } }, { a: { y: 3 } })).toEqual({ a: { x: 1, y: 3 } });
    const p = blockPart(R, { block: "hero", variant: "split", props: { title: "Own" } }, "k", { id: "card-1", unknown: 1 })!;
    expect(p.organism).toBe("Hero");
    expect(p.props).toEqual({ title: "Own", actions: { cta: { $: "ui.hero.cta" }, href: "#/", mode: "two" }, items: { $: "feats" }, layout: "split", tone: "default", media: { kind: "image" }, id: "card-1" });
  });
  test("an alt block draws its second organism with only its own props", () => {
    const t = blockPart(R, { block: "plans", variant: "table" }, "k")!;
    expect(t.organism).toBe("PlanTable");
    expect(Object.keys(t.props)).toEqual(["plan"]);
    expect(blockPart(R, { block: "plans", variant: "x" }, "k")).toBeNull();
  });
  test("references and operations resolve against the context", () => {
    const hero = resolve(blockPart(R, { block: "hero" }, "k")!.props, ctx) as Record<string, unknown>;
    expect(hero).toMatchObject({ title: "Hi", actions: { cta: "Go", href: "#/" }, items: [{ id: "f1" }] });
    const plans = resolve(blockPart(R, { block: "plans" }, "k")!.props, ctx) as Record<string, unknown>;
    expect(plans).toEqual({ plan: { id: "b" }, first: { id: "a" }, rows: [1, undefined], only: "plans" });
    expect(resolve({ "...": { $: "ui.hero" }, cta: "Own" }, ctx)).toEqual({ title: "Hi", cta: "Own" });
  });
  test("a screen page: frame before, the area, frame after; unknown blocks skipped; unique ids; its sources", () => {
    const parts = screenParts(R, "shop", "home", "pv7");
    expect(parts.map((p) => p.key)).toEqual(["before0", "home0"]);
    expect(resolve(parts[0]!.props, ctx)).toMatchObject({ links: [1, 2], id: "pv7-before0" });
    expect(sourcesOf(R, parts).map((d) => d.as)).toEqual(["feats", "tiers"]);
    expect(screenParts(R, "nope", "home", "x")).toEqual([]);
  });
});
