// A vegetable box filled by weight, and a side-by-side compare of grill cuts (an accessible table or compare cards).
import { cond, each, eachAt, eq, money, ref, str, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { spec, ts } from "../kit";
import { frame } from "../components/frames";
import { empty, id, orEmpty, title, tsOf, toneLite } from "../props";
import { muted, strong, surface } from "../ux";

const O = "organism.";
const lead = { name: "lead", type: "string" as const, default: "" };
const common = { id: ref("id"), title: ref("title"), lead: ref("lead"), tone: ref("tone"), density: "default" };
const dishes = { name: "dishes", type: ts("Dish[]"), required: true };
const labels = { name: "labels", type: ts("FoodLabels"), required: true };
const types = [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }];
const priceOf = (d = "d") => money(ref(`${d}.price`), ref(`${d}.currency`));
/** one fact of a compare card: the label on the left, the value on the right */
const fact = (label: string, value: Value) => use("ListItem", { props: { Class: "flex items-center justify-between gap-4" } }, use("Inline", { props: { Class: "text-muted-foreground" } }, text(ref(label))), use("Inline", { props: { Class: "font-semibold" } }, text(value)));
const head = (label: string) => use("TableHeadCell", { props: { Scope: "col", Class: "py-2" } }, text(ref(label)));

const veggieBox = spec(`${O}veggie-box`, "VeggieBox", "A vegetable box by weight: produce tiles (picture, name, price per kg, a weight field in kg named after the item) beside the box card with a meter of how full the box is, the total and the order button. Axes: layout (split, stacked), tone.", {
  typeImports: types,
  props: [id, title, lead, dishes, empty, labels, { name: "fill", type: "number", default: 60, docs: "how full the box is, percent" }, { name: "total", type: "number", required: true, docs: "minor units" }, { name: "currency", type: "string", required: true }, { name: "layout", type: tsOf("split", "stacked"), default: "split" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "package", [use("Box", { props: { Class: "grid grid-cols-1 items-start gap-8 lg:grid-cols-3" } },
    use("Box", { props: { Class: cond(eq(ref("layout"), "split"), "grid grid-cols-2 gap-4 md:grid-cols-3 lg:col-span-2", "grid grid-cols-2 gap-4 md:grid-cols-3 lg:col-span-3 lg:grid-cols-6") }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Stack", { props: { Gap: "2", Class: surface("p-4") }, attrs: { "data-testid": "item" } },
          organism("MediaFrame", { alt: ref("d.name"), ratio: "1/1" }),
          strong(ref("d.name"), "sm"), muted(tpl(ref("labels.perKg"), priceOf()), "xs"),
          organism("NumberField", { value: "1", name: tpl("{0}-kg-{1}", ref("id"), ref("d.id")), min: "0", label: tpl(ref("labels.weightOf"), ref("d.name")), decrease: tpl(ref("labels.decreaseOf"), ref("d.name")), increase: tpl(ref("labels.increaseOf"), ref("d.name")) })))),
    use("Stack", { props: { Gap: "4", Class: cond(eq(ref("layout"), "split"), surface("p-6 lg:sticky lg:top-8"), surface("p-6 lg:col-span-3")) }, attrs: { "data-testid": "summary" } },
      strong(ref("labels.summary"), "lg"),
      use("Label", { props: { For: tpl("{0}-fill", ref("id")), Class: "text-sm text-muted-foreground" } }, text(ref("labels.boxFill"))),
      use("Meter", { props: { Value: ref("fill"), Min: 0, Max: 100 }, attrs: { id: tpl("{0}-fill", ref("id")) } }),
      use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, muted(ref("labels.total")), use("Inline", { props: { Class: "text-2xl font-bold" }, attrs: { role: "status", "aria-live": "polite", "data-testid": "total" } }, text(money(ref("total"), ref("currency"))))),
      use("Button", { props: { Variant: "default", Size: "lg", Type: "button", Class: "w-full" } }, use("LucideIcon", { props: { Name: "shopping-bag", Size: 16 } }), text(ref("labels.order")))))])])],
});

const dishCompare = spec(`${O}dish-compare`, "DishCompare", "Grill cuts side by side: an accessible table (caption, column and row headers) of the cut, weight, cooking time, heat, marinade and price, or one compare card per cut with the same facts as a description list. Axes: layout (table, cards), tone.", {
  typeImports: types,
  props: [id, title, lead, dishes, empty, labels, { name: "layout", type: tsOf("table", "cards"), default: "table" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "scale", [when(eq(ref("layout"), "table"),
    [use("Box", { props: { Class: "w-full overflow-x-auto" }, attrs: { "data-testid": "compare-table" } },
      use("Table", { props: { Class: "w-full text-sm" } },
        use("TableCaption", { props: { Class: "sr-only" } }, text(ref("labels.caption"))),
        use("TableHead", {}, use("TableRow", {}, head("labels.cut"), head("labels.weight"), head("labels.minutes"), head("labels.heat"), head("labels.marinade"), head("labels.price"))),
        use("TableBody", {}, each(ref("dishes"), "d", ref("d.id"),
          use("TableRow", { attrs: { "data-testid": "item" } },
            use("TableHeadCell", { props: { Scope: "row", Class: "py-2 font-semibold" } }, text(ref("d.name"))),
            use("TableCell", {}, text(ref("d.weight"))),
            use("TableCell", {}, text(tpl(ref("labels.minutes"), str(ref("d.minutes"))))),
            use("TableCell", {}, text(ref("d.tag"))),
            use("TableCell", {}, each(ref("d.items"), "x", ref("x"), text(ref("x")))),
            use("TableCell", { props: { Class: "font-semibold" } }, text(priceOf())))))))],
    [organism("CutCards", { dishes: ref("dishes"), labels: ref("labels") })])])])],
});



const cutCards = spec("pattern.cut-cards", "CutCards", "The cards layout of DishCompare: one compare card per cut with a picture, the name, the summary, the weight, heat and price as a description list, and the cooking time.", {
  typeImports: [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }],
  props: [dishes, labels],
  view: [use("Grid", { props: { Cols: "1-4", Class: "gap-4" }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Stack", { props: { Gap: "4", Class: surface("p-4") }, attrs: { "data-testid": "item" } },
          organism("MediaFrame", { alt: ref("d.name"), ratio: "4/3" }),
          strong(ref("d.name"), "lg"), muted(ref("d.summary")),
          use("List", { props: { Tag: "ul", Class: "flex flex-col gap-2 text-sm" } }, fact("labels.weight", ref("d.weight")), fact("labels.heat", ref("d.tag")), fact("labels.price", priceOf())),
          use("Badge", { props: { Variant: "secondary", Size: "default", Class: "w-fit" } }, use("LucideIcon", { props: { Name: "timer", Size: 16 } }), text(tpl(ref("labels.minutes"), str(ref("d.minutes"))))))))],
});

export const meatCards = spec("pattern.meat-cards", "MeatCards", "The meat of a grill dish as picture cards in one radio group (fieldset with role radiogroup named by its legend): a picture, the name and the price per 500 g; the first checked.", {
  typeImports: [{ from: "OptionChips", names: ["DishOption"] }],
  props: [
    { name: "name", type: "string", required: true, docs: "name of the radio group; the legend id is `<name>-legend`" },
    { name: "legend", type: "string", required: true },
    { name: "options", type: ts("DishOption[]"), required: true },
  ],
  view: [use("Fieldset", { props: { Class: "flex flex-col gap-2" }, attrs: { role: "radiogroup", "aria-labelledby": tpl("{0}-legend", ref("name")), "data-testid": "meat" } },
    use("Legend", { props: { Size: "sm", Class: "mb-2" }, attrs: { id: tpl("{0}-legend", ref("name")) } }, text(ref("legend"))),
    use("Box", { props: { Class: "grid grid-cols-2 gap-4 md:grid-cols-4" } },
      eachAt(ref("options"), "o", "i", ref("o.id"),
        use("Box", { props: { Class: "flex flex-col gap-2 rounded p-2 text-sm inset-ring inset-ring-border has-checked:bg-muted has-checked:inset-ring-foreground" }, attrs: { "data-testid": "option" } },
          organism("MediaFrame", { alt: ref("o.name"), ratio: "4/3" }),
          use("Label", { props: { Class: "flex items-center gap-2 font-medium" } }, use("Radio", { props: { Name: ref("name"), Value: ref("o.id"), Checked: eq(ref("i"), 0) } }), use("Inline", {}, text(ref("o.name")))),
          use("Inline", { props: { Class: "text-xs text-muted-foreground" } }, text(tpl("{0} · {1}", money(ref("o.price"), ref("o.currency")), ref("o.note"))))))))],
});

export const foodBoxOrganisms: OrganismSpec[] = [cutCards, veggieBox, dishCompare];
