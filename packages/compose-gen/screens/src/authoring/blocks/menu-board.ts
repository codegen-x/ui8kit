// A restaurant menu board: category sections with a grid of DishCards or a denser list of menu rows. Distinct from RestaurantMenu
// (dotted-leader column, no cards, no price hide): this board composes DishCard, can hide prices, and varies density.
// Dishes map from Codex kind `dish`; sections from kind `dishsection` (same records as RestaurantMenu).
import { cond, each, eq, ref, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { spec, ts } from "../kit";
import { frame } from "../components/frames";
import { empty, id, orEmpty, title, tsOf, denseLite } from "../props";
import { muted } from "../ux";

const O = "organism.";
const lead = { name: "lead", type: "string" as const, default: "" };
const dishes = { name: "dishes", type: ts("Dish[]"), required: true };
const sections = { name: "sections", type: ts("DishSection[]"), required: true };
const labels = { name: "labels", type: ts("FoodLabels"), required: true };

const card = () => organism("DishCard", {
  dish: ref("d"), labels: { add: ref("labels.add") }, layout: "vertical",
  media: cond(eq(ref("density"), "compact"), "none", "image"), prices: ref("prices"), action: "none",
  density: ref("density"),
});

const row = () => organism("MenuRow", { dish: ref("d"), prices: ref("prices") });

const matching = (child: ReturnType<typeof card>) =>
  each(ref("dishes"), "d", ref("d.id"), when(eq(ref("d.tag"), ref("s.key")), [child]));

const section = () => use("Stack", { props: { Gap: cond(eq(ref("density"), "compact"), "2", "4") }, attrs: { id: tpl("{0}-{1}", ref("id"), ref("s.key")), "data-testid": "menusection" } },
  use("Stack", { props: { Gap: "0", Class: "border-b border-border pb-2" } }, use("Title", { props: { As: 3, Size: "xl", Weight: "bold" } }, text(ref("s.title"))), muted(ref("s.note"))),
  when(eq(ref("layout"), "grid"),
    [use("Grid", { props: { Cols: "1-3", Class: "gap-4" } }, matching(card()))],
    [use("List", { props: { Tag: "ul", Class: "flex flex-col" } }, matching(row()))]));

const menuBoard = spec(`${O}menu-board`, "MenuBoard", "A restaurant menu board: category sections with DishCards in a grid, or denser menu rows in a list or a sectioned column. Axes: layout (sections, grid, list), prices (show, hide), density. Composes DishCard; section rows use MenuRow.", {
  typeImports: [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }, { from: "RestaurantMenu", names: ["DishSection"] }],
  props: [id, title, lead, dishes, sections, empty, labels, { name: "layout", type: tsOf("sections", "grid", "list"), default: "sections" }, { name: "prices", type: tsOf("show", "hide"), default: "show" }, { name: "density", type: denseLite, default: "default" }],
  view: [frame({ id: ref("id"), title: ref("title"), lead: ref("lead"), density: ref("density") }, [orEmpty("sections", "star", [
    use("Stack", { props: { Gap: "8", Align: "stretch" } },
      when(eq(ref("layout"), "sections"), [organism("MenuSectionNav", { label: ref("labels.sections"), sections: ref("sections"), prefix: ref("id") })]),
      use("Box", { props: { Class: "flex flex-col gap-8" }, attrs: { "data-testid": "items" } },
        each(ref("sections"), "s", ref("s.id"), section()))),
  ])])],
});

export const menuBoardOrganisms: OrganismSpec[] = [menuBoard];
