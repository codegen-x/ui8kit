// The parts the food blocks share: a radio group of options drawn as chips (size, crust, portions, meat, weight), the live cart count,
// a quantity field with an add button, and a small add icon button. Static markup: the page wires the controls.
import { cn, cond, each, eachAt, eq, money, ref, str, text, tpl, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { fields, spec, ts } from "../kit";
import { tsOf } from "../props";

const P = "pattern.";
/** a radio inside its label, drawn as a chip; `has-checked` marks the chosen one */
const chip = "flex items-center gap-2 rounded px-4 py-2 text-sm inset-ring inset-ring-border has-checked:bg-muted has-checked:inset-ring-foreground";

export const optionChips = spec(`${P}option-chips`, "OptionChips", "One choice as a radio group drawn as chips: a fieldset with role radiogroup named by its legend, one radio per option (the first checked), the name and an optional price or note. Static markup.", {
  records: { DishOption: fields(["id", "string"], ["name", "string"], ["price", "number"], ["currency", "string"], ["note", "string"]) },
  props: [
    { name: "name", type: "string", required: true, docs: "name of the radio group; the legend id is `<name>-legend`" },
    { name: "legend", type: "string", required: true, docs: "the visible name of the group" },
    { name: "options", type: ts("DishOption[]"), required: true },
    { name: "extra", type: tsOf("none", "price", "note"), default: "none", docs: "what follows the option name" },
    { name: "layout", type: tsOf("wrap", "column"), default: "wrap" },
  ],
  view: [use("Fieldset", { props: { Class: "flex flex-col gap-2" }, attrs: { role: "radiogroup", "aria-labelledby": tpl("{0}-legend", ref("name")), "data-testid": "option-group" } },
    use("Legend", { props: { Size: "sm", Class: "mb-2" }, attrs: { id: tpl("{0}-legend", ref("name")) } }, text(ref("legend"))),
    use("Box", { props: { Class: cond(eq(ref("layout"), "column"), "flex flex-col gap-2", "flex flex-wrap gap-2") } },
      eachAt(ref("options"), "o", "i", ref("o.id"),
        use("Label", { props: { Class: cn(chip, cond(eq(ref("layout"), "column"), "justify-between", "")) }, attrs: { "data-testid": "option" } },
          use("Inline", { props: { Class: "flex items-center gap-2" } },
            use("Radio", { props: { Name: ref("name"), Value: ref("o.id"), Checked: eq(ref("i"), 0) } }), use("Inline", {}, text(ref("o.name")))),
          when(eq(ref("extra"), "price"), [use("Inline", { props: { Class: "text-muted-foreground" } }, text(money(ref("o.price"), ref("o.currency"))))]),
          when(eq(ref("extra"), "note"), [use("Inline", { props: { Class: "text-muted-foreground" } }, text(ref("o.note")))])))))],
});

export const cartCount = spec(`${P}cart-count`, "CartCount", "The cart count as a live status (role status, aria-live polite): a bag icon and the words with the number. The page updates the number; screen readers announce it.", {
  props: [
    { name: "count", type: "number", default: 0 },
    { name: "label", type: "string", required: true, docs: "the words with {0} for the number" },
  ],
  view: [use("Inline", { props: { Class: "inline-flex h-8 items-center gap-2 rounded bg-muted px-4 text-sm font-medium" }, attrs: { role: "status", "aria-live": "polite", "data-testid": "cart-count" } },
    use("LucideIcon", { props: { Name: "shopping-bag", Size: 16 } }), use("Inline", {}, text(tpl(ref("label"), str(ref("count"))))))],
});

export const addQty = spec(`${P}add-qty`, "AddQty", "A quantity field named after the dish (minus and plus buttons with their own names) beside an add button. Static markup.", {
  props: [
    { name: "name", type: "string", required: true, docs: "name of the quantity field" },
    { name: "dish", type: "string", required: true, docs: "the dish name, put into the labels" },
    { name: "labels", type: ts("{ qtyOf: string; decreaseOf: string; increaseOf: string; add: string }"), required: true },
    { name: "value", type: "string", default: "1" },
  ],
  view: [use("Group", { props: { Gap: "2", Align: "center", Justify: "between", Class: "flex-wrap" } },
    organism("NumberField", { value: ref("value"), name: ref("name"), min: "0", label: tpl(ref("labels.qtyOf"), ref("dish")), decrease: tpl(ref("labels.decreaseOf"), ref("dish")), increase: tpl(ref("labels.increaseOf"), ref("dish")) }),
    use("Button", { props: { Variant: "default", Size: "default", Type: "button" }, attrs: { "data-testid": "add" } }, use("LucideIcon", { props: { Name: "plus", Size: 16 } }), text(ref("labels.add"))))],
});

export const addIcon = spec(`${P}add-icon`, "AddIcon", "A small icon button that adds one dish: a plus, named after the dish. Static markup.", {
  props: [
    { name: "label", type: "string", required: true, docs: "accessible name, with the dish in it" },
    { name: "variant", type: tsOf("default", "outline"), default: "outline" },
  ],
  view: [use("Button", { props: { Variant: ref("variant"), Size: "sm", Layout: "icon", Type: "button", AriaLabel: ref("label") }, attrs: { "data-testid": "add" } }, use("LucideIcon", { props: { Name: "plus", Size: 16 } }))],
});

export const foodParts: OrganismSpec[] = [optionChips, cartCount, addQty, addIcon];

export const menuSectionNav = spec(`${P}menu-section-nav`, "MenuSectionNav", "The sections of a menu as chips that jump to them: a nav landmark named by `label`, one link per section to `#<prefix>-<key>`.", {
  props: [
    { name: "label", type: "string", required: true, docs: "accessible name of the nav" },
    { name: "sections", type: ts("Array<{ id: string; key: string; title: string }>"), required: true },
    { name: "prefix", type: "string", required: true, docs: "the block id the section ids start with" },
  ],
  view: [use("Block", { props: { Tag: "nav" }, attrs: { "aria-label": ref("label"), "data-testid": "section-nav" } },
    use("List", { props: { Tag: "ul", Class: "flex flex-wrap gap-2" } },
      each(ref("sections"), "s", ref("s.id"),
        use("ListItem", {}, use("Link", { props: { Href: tpl("#{0}-{1}", ref("prefix"), ref("s.key")), Variant: "nav", Size: "sm", Class: "h-8 rounded px-4 inset-ring inset-ring-border" } }, text(ref("s.title")))))))],
});
foodParts.push(menuSectionNav);

export const menuRow = spec(`${P}menu-row`, "MenuRow", "One dish on a menu board: name, optional badge, a dotted leader to the price, then the summary and the portion/weight. Used by MenuBoard; Codex kind `dish`.", {
  typeImports: [{ from: "DishShowcase", names: ["Dish"] }],
  props: [
    { name: "dish", type: ts("Dish"), required: true },
    { name: "prices", type: tsOf("show", "hide"), default: "show" },
  ],
  view: [use("ListItem", { props: { Class: "flex flex-col gap-0 border-b border-border py-2" }, attrs: { "data-testid": "item" } },
    use("Box", { props: { Class: "flex items-baseline gap-2" } },
      use("Inline", { props: { Class: "font-semibold" } }, text(ref("dish.name"))),
      when(ref("dish.badge"), [use("Badge", { props: { Variant: "outline", Size: "sm" } }, text(ref("dish.badge")))]),
      when(eq(ref("prices"), "show"), [
        use("Inline", { props: { Class: "flex-1 border-b border-dotted border-border" }, attrs: { "aria-hidden": "true" } }),
        use("Inline", { props: { Class: "font-semibold" }, attrs: { "data-testid": "price" } }, text(money(ref("dish.price"), ref("dish.currency"))))])),
    use("Inline", { props: { Class: "text-sm text-muted-foreground" } }, text(tpl("{0} · {1}", ref("dish.summary"), ref("dish.weight")))))],
});
foodParts.push(menuRow);

const sideRow = "flex items-center justify-between gap-4 rounded px-4 py-2 text-sm inset-ring inset-ring-border has-checked:bg-muted";
export const sideChecks = spec(`${P}side-checks`, "SideChecks", "Extras to tick: a fieldset named by its legend, one checkbox per option with its note and price. Static markup.", {
  typeImports: [{ from: "OptionChips", names: ["DishOption"] }],
  props: [
    { name: "name", type: "string", required: true, docs: "prefix of the checkbox names (one per option: <name>-<option id>)" },
    { name: "legend", type: "string", required: true },
    { name: "options", type: ts("DishOption[]"), required: true },
  ],
  view: [use("Fieldset", { props: { Class: "flex flex-col gap-2" }, attrs: { "data-testid": "sides" } },
    use("Legend", { props: { Size: "sm", Class: "mb-2" } }, text(ref("legend"))),
    each(ref("options"), "o", ref("o.id"),
      use("Label", { props: { Class: sideRow } },
        use("Inline", { props: { Class: "flex items-center gap-2" } }, use("Checkbox", { props: { Name: tpl("{0}-{1}", ref("name"), ref("o.id")), Value: "on" } }), use("Inline", {}, text(ref("o.name")))),
        use("Inline", { props: { Class: "text-muted-foreground" } }, text(tpl("{0} · {1}", ref("o.note"), money(ref("o.price"), ref("o.currency"))))))))],
});
foodParts.push(sideChecks);
