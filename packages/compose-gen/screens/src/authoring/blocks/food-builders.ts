// Food pickers and builders: pizza with a size and crust radio group, a combo of main, side and drink, a grill (mangal) dish of meat,
// weight and sides, recipe kits with their ingredients and portions, a vegetable box by weight, and a side-by-side compare of cuts.
import { cond, each, eq, money, ref, str, text, tpl, use, when, organism } from "../../build";
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
const opts = (name: string, docs: string) => ({ name, type: ts("DishOption[]"), required: true, docs });
const types = [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }, { from: "OptionChips", names: ["DishOption"] }];
const priceOf = (d = "d") => money(ref(`${d}.price`), ref(`${d}.currency`));
const pic = (alt: Value, ratio: string, cls = "") => organism("MediaFrame", { alt, ratio, ...(cls ? { className: cls } : {}) });
const chips = (name: Value, legend: string, options: string, extra = "none", layout = "wrap") => organism("OptionChips", { name, legend: ref(legend), options: ref(options), extra, layout });
const split = (aside: boolean) => cond(eq(ref("layout"), "split"), aside ? surface("flex flex-col gap-4 p-6 lg:sticky lg:top-8") : "flex flex-col gap-8 lg:col-span-2", aside ? surface("flex flex-col gap-4 p-6") : "flex flex-col gap-8 lg:col-span-3");
/** the summary card of a builder: a line, the total and the order button */
const summary = (total: Value) => use("Stack", { props: { Gap: "4", Class: split(true) }, attrs: { "data-testid": "summary" } },
  strong(ref("labels.summary"), "lg"),
  use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, muted(ref("labels.total")), use("Inline", { props: { Class: "text-2xl font-bold" }, attrs: { role: "status", "aria-live": "polite", "data-testid": "total" } }, text(total))),
  use("Button", { props: { Variant: "default", Size: "lg", Type: "button", Class: "w-full" } }, use("LucideIcon", { props: { Name: "shopping-bag", Size: 16 } }), text(ref("labels.add"))));

const pizzaPicker = spec(`${O}pizza-picker`, "PizzaPicker", "Pizzas with a picker on each card: the picture, name and toppings, a radio group of sizes and one of crusts (each a fieldset with role radiogroup), the price and an add button. Axes: layout (cards, rows), tone.", {
  typeImports: types,
  props: [id, title, lead, dishes, empty, labels, opts("sizes", "the sizes, the first checked"), opts("crusts", "the crusts, the first checked"), { name: "layout", type: tsOf("cards", "rows"), default: "cards" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "star", [
    use("Box", { props: { Class: cond(eq(ref("layout"), "rows"), "flex flex-col gap-4", "grid grid-cols-1 gap-4 md:grid-cols-3") }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Box", { props: { Class: cond(eq(ref("layout"), "rows"), surface("grid grid-cols-1 gap-4 p-4 md:grid-cols-3"), surface("flex flex-col gap-4 p-4")) }, attrs: { "data-testid": "item" } },
          pic(ref("d.name"), "1/1"),
          use("Stack", { props: { Gap: "4", Class: cond(eq(ref("layout"), "rows"), "md:col-span-2", "") } },
            use("Stack", { props: { Gap: "2" } }, strong(ref("d.name"), "lg"), muted(ref("d.summary"))),
            chips(tpl("{0}-size-{1}", ref("id"), ref("d.id")), "labels.size", "sizes"),
            chips(tpl("{0}-crust-{1}", ref("id"), ref("d.id")), "labels.crust", "crusts"),
            use("Group", { props: { Gap: "4", Align: "center", Justify: "between", Class: "mt-auto" } }, use("Inline", { props: { Class: "text-xl font-bold" } }, text(priceOf())),
              use("Button", { props: { Variant: "default", Size: "default", Type: "button", AriaLabel: tpl(ref("labels.addOf"), ref("d.name")) }, attrs: { "data-testid": "add" } }, text(ref("labels.add"))))))))])])],
});

const comboBuilder = spec(`${O}combo-builder`, "ComboBuilder", "A set (combo) builder: three numbered steps, each a radio group of cards with the price (main, side, drink), beside or under a summary with the live total and the order button. Axes: layout (split, stacked), tone.", {
  typeImports: types,
  props: [id, title, lead, labels, opts("mains", "main dishes"), opts("sides", "sides"), opts("drinks", "drinks"), { name: "total", type: "number", required: true, docs: "the total of the first choices, minor units" }, { name: "currency", type: "string", required: true }, { name: "layout", type: tsOf("split", "stacked"), default: "split" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [use("Box", { props: { Class: "grid grid-cols-1 items-start gap-8 lg:grid-cols-3" } },
    use("Box", { props: { Class: split(false) }, attrs: { "data-testid": "steps" } },
      chips(tpl("{0}-main", ref("id")), "labels.main", "mains", "price", "column"),
      chips(tpl("{0}-side", ref("id")), "labels.side", "sides", "price", "column"),
      chips(tpl("{0}-drink", ref("id")), "labels.drink", "drinks", "price", "column")),
    summary(money(ref("total"), ref("currency"))))])],
});

const grillBuilder = spec(`${O}grill-builder`, "GrillBuilder", "A grill (mangal) dish builder: the meat as picture cards in a radio group, the weight as chips, the sides as checkboxes with prices, then a summary with the live total and the order button. Axes: layout (split, stacked), tone.", {
  typeImports: types,
  props: [id, title, lead, labels, opts("meats", "the meats, price per 500 g"), opts("weights", "the weights"), opts("sides", "the sides (checkboxes)"), { name: "total", type: "number", required: true, docs: "the total of the first choices, minor units" }, { name: "currency", type: "string", required: true }, { name: "layout", type: tsOf("split", "stacked"), default: "split" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [use("Box", { props: { Class: "grid grid-cols-1 items-start gap-8 lg:grid-cols-3" } },
    use("Box", { props: { Class: split(false) }, attrs: { "data-testid": "steps" } },
      organism("MeatCards", { name: tpl("{0}-meat", ref("id")), legend: ref("labels.meat"), options: ref("meats") }),
      chips(tpl("{0}-weight", ref("id")), "labels.weight", "weights", "note"),
      organism("SideChecks", { name: tpl("{0}-sides", ref("id")), legend: ref("labels.sides"), options: ref("sides") })),
    summary(money(ref("total"), ref("currency"))))])],
});

const recipeKits = spec(`${O}recipe-kits`, "RecipeKits", "Recipe kits delivered home: a picture beside the kit name, cooking time, the ingredients list, a portions radio group and the price with an add button. Axes: layout (rows, cards), tone.", {
  typeImports: types,
  props: [id, title, lead, dishes, empty, labels, opts("portions", "the portion sizes, the first checked"), { name: "layout", type: tsOf("rows", "cards"), default: "rows" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "package", [
    use("Box", { props: { Class: cond(eq(ref("layout"), "cards"), "grid grid-cols-1 gap-8 md:grid-cols-3", "flex flex-col gap-8") }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Box", { props: { Class: cond(eq(ref("layout"), "cards"), surface("flex flex-col gap-4 p-4"), surface("grid grid-cols-1 gap-8 p-6 md:grid-cols-2")) }, attrs: { "data-testid": "item" } },
          pic(ref("d.name"), "4/3"),
          use("Stack", { props: { Gap: "4" } },
            use("Group", { props: { Gap: "2", Class: "flex-wrap" } },
              use("Badge", { props: { Variant: "secondary", Size: "default" } }, use("LucideIcon", { props: { Name: "timer", Size: 16 } }), text(tpl(ref("labels.minutes"), str(ref("d.minutes"))))),
              when(ref("d.badge"), [use("Badge", { props: { Variant: "outline", Size: "default" } }, text(ref("d.badge")))])),
            use("Stack", { props: { Gap: "2" } }, strong(ref("d.name"), "xl"), muted(ref("d.summary"))),
            use("Stack", { props: { Gap: "2" } }, strong(ref("labels.ingredients"), "sm"),
              use("List", { props: { Tag: "ul", Class: "grid grid-cols-1 gap-2 text-sm sm:grid-cols-2" }, attrs: { "data-testid": "ingredients" } },
                each(ref("d.items"), "x", ref("x"), use("ListItem", { props: { Class: "flex items-center gap-2" } }, use("LucideIcon", { props: { Name: "check", Size: 16, Class: "text-primary" } }), use("Inline", {}, text(ref("x"))))))),
            chips(tpl("{0}-portions-{1}", ref("id"), ref("d.id")), "labels.portions", "portions"),
            use("Group", { props: { Gap: "4", Align: "center", Justify: "between", Class: "mt-auto" } }, use("Inline", { props: { Class: "text-xl font-bold" } }, text(priceOf())),
              use("Button", { props: { Variant: "default", Size: "default", Type: "button", AriaLabel: tpl(ref("labels.addOf"), ref("d.name")) }, attrs: { "data-testid": "add" } }, text(ref("labels.add"))))))))])])],
});

export const foodBuilderOrganisms: OrganismSpec[] = [pizzaPicker, comboBuilder, grillBuilder, recipeKits];
