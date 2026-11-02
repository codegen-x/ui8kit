// More food catalogs: a sushi set grid, a horizontal strip of dishes, a featured bento, a compact grocery list, a week of meals and a
// restaurant menu by sections. Dish pictures are the MediaFrame placeholders.
import { cn, coalesce, cond, each, eachAt, eq, money, ne, ref, str, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec, ts } from "../kit";
import { frame } from "../components/frames";
import { empty, id, orEmpty, title, tsOf, toneLite } from "../props";
import { muted, strong, surface } from "../ux";

const O = "organism.";
const lead = { name: "lead", type: "string" as const, default: "" };
const common = { id: ref("id"), title: ref("title"), lead: ref("lead"), tone: ref("tone"), density: "default" };
const dishes = { name: "dishes", type: ts("Dish[]"), required: true };
const labels = { name: "labels", type: ts("FoodLabels"), required: true };
const sections = { name: "sections", type: ts("DishSection[]"), required: true };
const dishTypes = [{ from: "DishShowcase", names: ["Dish", "FoodLabels"] }];
const priceOf = (d = "d") => money(ref(`${d}.price`), ref(`${d}.currency`));
const pic = (alt: Value, ratio: string, cls = "") => organism("MediaFrame", { alt, ratio, ...(cls ? { className: cls } : {}) });
const add = (d = "d", variant = "outline") => organism("AddIcon", { label: tpl(ref("labels.addOf"), ref(`${d}.name`)), variant });

const sushiSets = spec(`${O}sushi-sets`, "SushiSets", "Sushi sets as a dense grid of tiles: a square picture with the piece count over it, the name, the rolls of the set as a list, the price and an add button. Axes: cols (3, 4), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "cols", type: tsOf("3", "4"), default: "4" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "package", [
    use("Grid", { props: { Cols: cond(eq(ref("cols"), "3"), "1-3", "1-4"), Class: "gap-4" }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("Stack", { props: { Gap: "4", Class: surface("p-4") }, attrs: { "data-testid": "item" } },
          use("Box", { props: { Class: "relative" } }, pic(ref("d.name"), "1/1"),
            use("Badge", { props: { Variant: "default", Size: "default", Class: "absolute left-2 top-2" } }, text(ref("d.weight")))),
          strong(ref("d.name")),
          use("List", { props: { Tag: "ul", Class: "flex flex-col gap-2 text-sm text-muted-foreground" }, attrs: { "aria-label": tpl(ref("labels.pieces"), ref("d.name")) } },
            each(ref("d.items"), "r", ref("r"), use("ListItem", { props: { Class: "flex items-center gap-2" } }, use("LucideIcon", { props: { Name: "check", Size: 16 } }), use("Inline", {}, text(ref("r")))))),
          use("Group", { props: { Gap: "2", Align: "center", Justify: "between", Class: "mt-auto" } }, use("Inline", { props: { Class: "text-lg font-bold" } }, text(priceOf())), add("d", "default")))))])])],
});

const strip = spec(`${O}dish-strip`, "DishStrip", "A horizontal strip of dishes that scrolls sideways (a focusable, named region with snap points): small cards with a picture, name, weight, price and an add button. Axes: size (sm, lg), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "size", type: tsOf("sm", "lg"), default: "sm" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "star", [
    use("List", { props: { Tag: "ul", Class: "-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4" }, attrs: { tabindex: 0, "aria-label": ref("labels.strip"), "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("ListItem", { props: { Class: cond(eq(ref("size"), "lg"), "flex w-64 shrink-0 snap-start flex-col gap-2", "flex w-48 shrink-0 snap-start flex-col gap-2") }, attrs: { "data-testid": "item" } },
          pic(ref("d.name"), cond(eq(ref("size"), "lg"), "4/3", "1/1") as unknown as string),
          use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, strong(ref("d.name"), "sm"), muted(ref("d.weight"), "xs")),
          use("Group", { props: { Gap: "2", Align: "center", Justify: "between" } }, use("Inline", { props: { Class: "text-sm font-bold" } }, text(priceOf())), add()))))])])],
});

const bento = spec(`${O}dish-bento`, "DishBento", "Featured dishes as a bento: the first dish in a large tile (two by two) with its summary and a link to its page, the others in small tiles around it. Axes: feature (start, end), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "feature", type: tsOf("start", "end"), default: "start" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "star", [
    use("Box", { props: { Class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" }, attrs: { "data-testid": "items" } },
      eachAt(ref("dishes"), "d", "i", ref("d.id"),
        when(eq(ref("i"), 0),
          [use("Stack", { props: { Gap: "4", Class: cn(surface("p-6 sm:col-span-2 lg:row-span-2"), cond(eq(ref("feature"), "end"), "lg:col-start-3 lg:row-start-1", "")) }, attrs: { "data-testid": "feature" } },
            pic(ref("d.name"), "4/3"),
            use("Badge", { props: { Variant: "secondary", Size: "default", Class: "w-fit" } }, text(ref("d.weight"))),
            use("Title", { props: { As: 3, Size: "2xl", Weight: "bold" } }, text(ref("d.name"))), muted(ref("d.summary"), "base"),
            use("Group", { props: { Gap: "4", Align: "center", Justify: "between", Class: "mt-auto" } }, use("Inline", { props: { Class: "text-xl font-bold" } }, text(priceOf())),
              use("Link", { props: { Href: coalesce(ref("d.href"), tpl("#/dish/{0}", ref("d.id"))), Variant: "default" } }, text(ref("labels.open")), use("LucideIcon", { props: { Name: "arrow-right", Size: 16 } }))))],
          [use("Stack", { props: { Gap: "2", Class: surface("p-4") }, attrs: { "data-testid": "item" } },
            pic(ref("d.name"), "16/9"), strong(ref("d.name"), "sm"),
            use("Group", { props: { Gap: "2", Align: "center", Justify: "between" } }, use("Inline", { props: { Class: "text-sm font-bold" } }, text(priceOf())), add()))])))])])],
});


const compactList = spec(`${O}grocery-list`, "GroceryList", "Groceries as a compact list: a small square picture (or none), the name, the pack size, the price and an add button, in one or two columns. Axes: thumbs (show, hide), cols (1, 2), tone.", {
  typeImports: dishTypes,
  props: [id, title, lead, dishes, empty, labels, { name: "thumbs", type: tsOf("show", "hide"), default: "show" }, { name: "cols", type: tsOf("1", "2"), default: "2" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("dishes", "shopping-bag", [
    use("List", { props: { Tag: "ul", Class: cond(eq(ref("cols"), "2"), "grid grid-cols-1 gap-x-8 md:grid-cols-2", "grid grid-cols-1") }, attrs: { "data-testid": "items" } },
      each(ref("dishes"), "d", ref("d.id"),
        use("ListItem", { props: { Class: "flex items-center gap-4 border-b border-border py-2" }, attrs: { "data-testid": "item" } },
          when(eq(ref("thumbs"), "show"), [pic(ref("d.name"), "1/1", "size-12 shrink-0")]),
          use("Stack", { props: { Gap: "0", Class: "min-w-0 flex-1" } }, strong(ref("d.name"), "sm"), muted(tpl("{0} · {1}", ref("d.weight"), ref("d.tag")), "xs")),
          use("Inline", { props: { Class: "text-sm font-bold" } }, text(priceOf())), add())))])])],
});

const weekMenu = spec(`${O}week-menu`, "WeekMenu", "Meal delivery as a week: one column per day (its name and delivery note) with the meal of that day as a small card (picture, name, weight, price). Axes: media (image, none), tone.", {
  typeImports: [...dishTypes, { from: "RestaurantMenu", names: ["DishSection"] }],
  props: [id, title, lead, dishes, sections, empty, labels, { name: "media", type: tsOf("image", "none"), default: "image" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("sections", "calendar", [
    use("Box", { props: { Class: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" }, attrs: { "data-testid": "items" } },
      each(ref("sections"), "s", ref("s.id"),
        use("Stack", { props: { Gap: "2", Class: "border-t-2 border-primary pt-4" }, attrs: { "data-testid": "day" } },
          strong(ref("s.title"), "sm"), muted(ref("s.note"), "xs"),
          each(ref("dishes"), "d", ref("d.id"), when(eq(ref("d.tag"), ref("s.key")), [
            use("Stack", { props: { Gap: "2", Class: surface("p-4") }, attrs: { "data-testid": "item" } },
              when(eq(ref("media"), "image"), [pic(ref("d.name"), "4/3")]),
              strong(ref("d.name"), "sm"),
              use("Group", { props: { Gap: "2", Align: "baseline", Justify: "between" } }, muted(ref("d.weight"), "xs"), use("Inline", { props: { Class: "text-sm font-bold" } }, text(priceOf()))))])))))])])],
});

const restaurantMenu = spec(`${O}restaurant-menu`, "RestaurantMenu", "A restaurant menu by sections: a nav of section links, then each section (heading and note) with its dishes as menu lines (name, a dotted leader, the price; the summary and weight below). No cart. Axes: cols (1, 2), tone.", {
  typeImports: dishTypes,
  records: { DishSection: fields(["id", "string"], ["key", "string"], ["title", "string"], ["note", "string"]) },
  props: [id, title, lead, dishes, sections, empty, labels, { name: "cols", type: tsOf("1", "2"), default: "1" }, { name: "tone", type: toneLite, default: "default" }],
  view: [frame(common, [orEmpty("sections", "star", [use("Stack", { props: { Gap: "8", Align: "stretch", Class: cond(eq(ref("cols"), "1"), "mx-auto w-full max-w-3xl", "") } },
    organism("MenuSectionNav", { label: ref("labels.sections"), sections: ref("sections"), prefix: ref("id") }),
    use("Box", { props: { Class: cond(eq(ref("cols"), "2"), "grid grid-cols-1 gap-8 md:grid-cols-2", "flex flex-col gap-8") }, attrs: { "data-testid": "items" } },
      each(ref("sections"), "s", ref("s.id"),
        use("Stack", { props: { Gap: "4" }, attrs: { id: tpl("{0}-{1}", ref("id"), ref("s.key")), "data-testid": "menusection" } },
          use("Stack", { props: { Gap: "0", Class: "border-b border-border pb-2" } }, use("Title", { props: { As: 3, Size: "xl", Weight: "bold" } }, text(ref("s.title"))), muted(ref("s.note"))),
          use("List", { props: { Tag: "ul", Class: "flex flex-col gap-4" } },
            each(ref("dishes"), "d", ref("d.id"), when(eq(ref("d.tag"), ref("s.key")), [
              use("ListItem", { props: { Class: "flex flex-col gap-0" }, attrs: { "data-testid": "item" } },
                use("Box", { props: { Class: "flex items-baseline gap-2" } }, use("Inline", { props: { Class: "font-semibold" } }, text(ref("d.name"))),
                  when(ref("d.badge"), [use("Badge", { props: { Variant: "outline", Size: "sm" } }, text(ref("d.badge")))]),
                  use("Inline", { props: { Class: "flex-1 border-b border-dotted border-border" }, attrs: { "aria-hidden": "true" } }),
                  use("Inline", { props: { Class: "font-semibold" } }, text(priceOf()))),
                muted(tpl("{0} · {1}", ref("d.summary"), ref("d.weight"))))])))))))])])],
});


export const foodMoreOrganisms: OrganismSpec[] = [sushiSets, strip, bento, compactList, weekMenu, restaurantMenu];
