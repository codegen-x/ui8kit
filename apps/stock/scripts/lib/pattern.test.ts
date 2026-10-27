import { describe, expect, test } from "bun:test";
import { evaluate, isModular, rootGrid, variantProps, widest } from "./pattern";

const each = { each: { $: "items" }, as: "x", do: [{ use: "Card", children: [] }] };
const orgs = new Map([["Frame", { props: [], view: [{ use: "Title", children: [] }] }]]);
describe("pattern rule", () => {
  test("evaluate: refs, cond, eq, unknowns stay unknown; a sample data list is non-empty", () => {
    const p = variantProps([{ name: "cols", default: "1-3" }], { items: { $: "rows" } }, ["rows"], { layout: "grid" });
    expect(evaluate({ op: "cond", args: [{ op: "eq", args: [{ $: "layout" }, "grid"] }, { $: "cols" }, "1"] }, p)).toBe("1-3");
    expect(evaluate({ op: "eq", args: [{ op: "len", args: [{ $: "items" }] }, 0] }, p)).toBe(false);
    expect(typeof evaluate({ op: "fitCols", args: ["1-4", 3] }, p)).toBe("symbol");
    expect(widest("1-4")).toBe(4);
    expect(widest("3")).toBe(3);
    expect(widest("x")).toBe(0);
  });
  test("root grid of one module, through an organism slot, with a heading beside it", () => {
    const view = [{ organism: "Frame", props: {}, slots: { children: { do: [{ use: "Title", children: [] }, { use: "Grid", props: { Cols: "1-3" }, children: [each] }] } } }];
    expect(isModular(rootGrid(view, {}, orgs))).toBe(true);
    expect(isModular(rootGrid([{ use: "Grid", props: { Cols: "1-2" }, children: [each] }], {}, orgs))).toBe(false);
    expect(isModular(rootGrid([{ use: "Grid", props: { Cols: "1-3" }, children: [each, each] }], {}, orgs))).toBe(false);
    expect(isModular(rootGrid([{ use: "Grid", props: { Cols: "1-3" }, children: [{ ...each, do: [{ use: "Card", props: { Class: "md:col-span-2" } }] }] }], {}, orgs))).toBe(false);
    expect(isModular(rootGrid([{ use: "MediaFrame" }, { use: "Grid", props: { Cols: "1-3" }, children: [each] }], {}, orgs))).toBe(false);
    const unknown = variantProps([], { flag: { $: "ui.some.text" } }, [], {});
    expect(isModular(rootGrid([{ when: { $: "flag" }, then: [{ use: "Grid", props: { Cols: "1-3" }, children: [each] }] }], unknown, orgs))).toBe(false);
    expect(isModular(rootGrid([{ when: { $: "flag" }, then: [{ use: "Grid", props: { Cols: "1-3" }, children: [each] }] }], { flag: true }, orgs))).toBe(true);
  });
});
