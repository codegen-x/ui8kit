// Food catalogs and showcases: dish cards that open a dish page, a cart grid with quantity fields, a one-click order list, a sushi set
// grid, a horizontal strip, a featured bento, a compact grocery list and a week of meals. Dish pictures are the MediaFrame placeholders.
import { cn, coalesce, cond, each, eq, gt, money, ref, str, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec, ts } from "../kit";
import { frame } from "../components/frames";
import { empty, id, orEmpty, title, tsOf, toneLite } from "../props";
import { muted, strong, surface } from "../ux";

const O = "organism.";
const lead = { name: "lead", type: "string" as const, default: "" };
const common = { id: ref("id"), title: ref("title"), lead: ref("lead"), tone: ref("tone"), density: "default" };
export const Dish = fields(["id", "string"], ["name", "string"], ["summary", "string"], ["price", "number"], ["currency", "string"], ["weight", "string"], ["tag", "string"], ["items", "string[]"], ["minutes", "number"], ["badge", "string", true], ["href", "string", true]);
/** the words of every food block: one dictionary object (ui.food.labels) */
export const FoodLabels = fields(["add", "string"], ["open", "string"], ["order", "string"], ["qtyOf", "string"], ["decreaseOf", "string"], ["increaseOf", "string"], ["addOf", "string"], ["orderOf", "string"],
  ["inCart", "string"], ["total", "string"], ["minutes", "string"], ["ingredients", "string"], ["portions", "string"], ["size", "string"], ["crust", "string"], ["perKg", "string"], ["weightOf", "string"],
  ["boxFill", "string"], ["main", "string"], ["side", "string"], ["drink", "string"], ["meat", "string"], ["weight", "string"], ["sides", "string"], ["summary", "string"], ["phone", "string"],
  ["cut", "string"], ["heat", "string"], ["price", "string"], ["marinade", "string"], ["caption", "string"], ["pieces", "string"], ["strip", "string"], ["sections", "string"]);
const dishes = { name: "dishes", type: ts("Dish[]"), required: true };
const labels = { name: "labels", type: ts("FoodLabels"), required: true };
const dishTypes = [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }];
const priceOf = (d = "d") => money(ref(`${d}.price`), ref(`${d}.currency`));
const pic = (alt: Value, ratio: string, cls = "") => organism("MediaFrame", { alt, ratio, ...(cls ? { className: cls } : {}) });
const badge = (d = "d") => when(ref(`${d}.badge`), [use("Badge", { props: { Variant: "secondary", Size: "sm", Class: "w-fit" } }, text(ref(`${d}.badge`)))]);

const showcase = spec(`${O}dish-showcase`, "DishShowcase", "A showcase of dishes: each card is one link to the dish page (picture, badge, name, weight, summary, price and an arrow). No cart here. Axes: cols (3, 4), ratio (4/3, 1/1), tone.", {
  records: { Dish, FoodLabels },
  props: [id, title, lead, dishes, empty, labels, { name: "cols", type: tsOf("3", "4"), default: "3" }, { name: "ratio", type: tsOf("4/3", "1/1"), default: "4/3" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "star", [
    use("Grid", { props: { Cols: cond(eq(ref("cols"), "4"), "2-4", "1-3"), Class: "gap-8" }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Link", { props: { Href: coalesce(ref("d.href"), tpl("#/dish/{0}", ref("d.id"))), Variant: "block", Class: "group flex-col items-stretch gap-4" }, attrs: { "data-testid": "item" } },
          pic(ref("d.name"), ref("ratio") as unknown as string),
          use("Stack", { props: { Gap: "2" } },
            badge(),
            use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, use("Inline", { props: { Class: "text-lg font-semibold" } }, text(ref("d.name"))), use("Inline", { props: { Class: "text-sm text-muted-foreground" } }, text(ref("d.weight")))),
            use("Inline", { props: { Class: "text-sm font-normal text-muted-foreground" } }, text(ref("d.summary"))),
            use("Group", { props: { Gap: "2", Align: "center", Justify: "between" } }, use("Inline", { props: { Class: "text-base font-bold" } }, text(priceOf())),
              use("Inline", { props: { Class: "flex items-center gap-2 text-sm text-primary" } }, text(ref("labels.open")), use("LucideIcon", { props: { Name: "arrow-right", Size: 16 } })))))))])])],
});

const cartGrid = spec(`${O}dish-cart-grid`, "DishCartGrid", "Dishes added to the cart from the card: the live cart count over a grid of cards, each with a picture, name, weight, price and a quantity field named after the dish beside the add button. Axes: media (image, none), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "count", type: "number", default: 0, docs: "dishes in the cart" }, { name: "media", type: tsOf("image", "none"), default: "image" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "shopping-bag", [use("Stack", { props: { Gap: "4", Align: "stretch" } },
    use("Group", { props: { Justify: "end" } }, organism("CartCount", { count: ref("count"), label: ref("labels.inCart") })),
    use("Grid", { props: { Cols: "1-3", Class: "gap-4" }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Stack", { props: { Gap: "4", Class: surface("overflow-hidden pb-4") }, attrs: { "data-testid": "item" } },
          when(eq(ref("media"), "image"), [pic(ref("d.name"), "16/9")]),
          use("Stack", { props: { Gap: "2", Class: cond(eq(ref("media"), "image"), "px-4", "px-4 pt-4") } },
            use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, strong(ref("d.name")), muted(ref("d.weight"), "xs")),
            use("Text", { props: { Size: "lg", Weight: "bold" } }, text(priceOf()))),
          use("Box", { props: { Class: "px-4" } }, organism("AddQty", { name: tpl("{0}-qty-{1}", ref("id"), ref("d.id")), dish: ref("d.name"), labels: ref("labels") }))))))])])],
});

const quickOrder = spec(`${O}quick-order`, "QuickOrder", "Quick order in one click: compact rows (name, weight, summary, price) each with an order button named after the dish, under a phone field that the one click uses. Axes: phone (show, hide), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "phone", type: tsOf("show", "hide"), default: "show" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "zap", [use("Stack", { props: { Gap: "4", Align: "stretch", Class: "mx-auto w-full max-w-3xl" } },
    when(eq(ref("phone"), "show"), [organism("Field", { label: ref("labels.phone"), htmlFor: tpl("{0}-phone", ref("id")) }, { slots: { children: { args: [], do: [
      use("Input", { props: { Type: "tel", Name: tpl("{0}-phone", ref("id")) }, attrs: { id: tpl("{0}-phone", ref("id")) } })] } } })]),
    use("List", { props: { Tag: "ul", Class: "flex flex-col" }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("ListItem", { props: { Class: "flex flex-wrap items-center gap-4 border-b border-border py-4" }, attrs: { "data-testid": "item" } },
          use("Stack", { props: { Gap: "0", Class: "min-w-0 flex-1" } },
            use("Group", { props: { Gap: "2", Align: "baseline" } }, strong(ref("d.name")), muted(ref("d.weight"), "xs")), muted(ref("d.summary"))),
          use("Inline", { props: { Class: "text-base font-bold" } }, text(priceOf())),
          use("Button", { props: { Variant: "default", Size: "sm", Type: "button", AriaLabel: tpl(ref("labels.orderOf"), ref("d.name")) }, attrs: { "data-testid": "order" } },
            use("LucideIcon", { props: { Name: "zap", Size: 16 } }), text(ref("labels.order")))))))])])],
});

export const foodOrganisms: OrganismSpec[] = [showcase, cartGrid, quickOrder];
