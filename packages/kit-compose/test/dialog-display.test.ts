// A recipe on the native <dialog> (Dialog, Sheet, any brick whose primitive is Dialog) may set `display` only while it is open
// (`open:flex`): an author display utility beats the UA rule `dialog:not([open]) { display: none }`, so a closed dialog stays on the
// page (da922a2f: the Stock Theme sheet drawn again below the results). Checked on the authored variants and on the recipes every
// runtime ships (TS for svelte/react/vue/solid, compose.json for templ/twig/latte/jinja2).
import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BRICKS } from "../src/map";
import { RECIPES, type Recipe } from "../src/recipes";

const KIT = join(import.meta.dir, "..");
const DISPLAY = /^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|contents|flow-root|list-item|table|inline-table|table-[a-z-]+)$/;
const dialogRecipes = [...new Set(Object.values(BRICKS).filter((b) => b.primitive === "Dialog" && b.recipe).map((b) => b.recipe!))].sort();

/** Every class of a recipe: base, each value of each key, each compound. */
const classesOf = (r: Pick<Recipe, "base" | "byKey" | "compound">): string[] => [
  r.base, ...Object.values(r.byKey ?? {}).flatMap((v) => Object.values(v)), ...(r.compound ?? []).map((c) => c.class ?? ""),
].flatMap((s) => s.split(/\s+/)).filter(Boolean);

/** Display utilities that apply while the dialog is closed: no `open:` among their variants (md:flex, hover:grid count too). */
function closedDisplay(classes: string[]): string[] {
  return classes.filter((c) => {
    const parts = c.replace(/^!|!$/g, "").split(":");
    return DISPLAY.test(parts.at(-1)!) && !parts.slice(0, -1).includes("open");
  });
}

test("the dialog-based recipes are found (dialog and sheet at least)", () => {
  expect(dialogRecipes).toEqual(expect.arrayContaining(["dialog", "sheet"]));
});

test("the detector catches an unconditional display and lets an open-only one through", () => {
  expect(closedDisplay(["fixed", "flex", "md:grid", "open:flex", "open:flex-col", "flex-row", "md:open:block"])).toEqual(["flex", "md:grid"]);
});

for (const id of dialogRecipes) test(`variants/${id}: display only while open`, () => {
  expect(closedDisplay(classesOf(RECIPES[id]!))).toEqual([]);
});

const TS = ["svelte", "react", "vue", "solid"], JSON_RT = ["templ", "twig", "latte", "jinja2"];
for (const rt of [...TS, ...JSON_RT]) test(`${rt}: the shipped dialog recipes set display only while open`, async () => {
  let shipped: Record<string, Recipe>;
  if (TS.includes(rt)) {
    const f = join(KIT, rt, "src", "compose", "recipes.ts");
    expect(existsSync(f)).toBe(true);
    const m = (await import(f)) as Record<string, unknown>;
    shipped = (Object.values(m).find((v) => v && typeof v === "object" && "dialog" in (v as object)) ?? {}) as Record<string, Recipe>;
  } else {
    const j = JSON.parse(readFileSync(join(KIT, rt, "src", "compose", "compose.json"), "utf8")) as Record<string, unknown>;
    shipped = (j.recipes ?? Object.values(j).find((v) => v && typeof v === "object" && "dialog" in (v as object)) ?? {}) as Record<string, Recipe>;
  }
  for (const id of dialogRecipes) {
    expect(shipped[id], `${rt}: recipe ${id}`).toBeDefined();
    expect(closedDisplay(classesOf(shipped[id]!)), `${rt}: ${id}`).toEqual([]);
  }
});
