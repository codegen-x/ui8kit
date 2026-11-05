// A restaurant dish as a card: picture, category, name, portion/weight, price, optional badge, short description and a CTA.
// Distinct from ProductCard: no rating or reviews; portion/weight and category are first-class. Codex kind `dish` (DishShowcase.Dish):
// category from metadata.tag, portion/weight from metadata.weight; pictures are MediaFrame placeholders.
import { call, cn, cond, eq, money, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { cardBase, fields, spec, ts } from "../kit";
import { tsOf } from "../props";

const media = () => when(eq(ref("media"), "image"), [
  use("Box", { props: { Class: cn("relative shrink-0", cond(eq(ref("layout"), "horizontal"), "sm:w-48", "")) } },
    organism("MediaFrame", { alt: ref("dish.name"), ratio: "4/3", className: "h-full" }),
    when(ref("dish.badge"), [use("Badge", { props: { Variant: "default", Size: "default", Class: "absolute left-4 top-4" }, attrs: { "data-testid": "badge" } }, text(ref("dish.badge")))])),
]);

const body = () => use("CardContent", { props: { Class: "flex flex-1 flex-col gap-2" } },
  use("Group", { props: { Gap: "2", Align: "center", Class: "flex-wrap" } },
    use("Text", { props: { Size: "xs", Class: "uppercase tracking-wide text-muted-foreground" }, attrs: { "data-testid": "category" } }, text(ref("dish.tag"))),
    when(eq(ref("media"), "none"), [when(ref("dish.badge"), [use("Badge", { props: { Variant: "secondary", Size: "sm" }, attrs: { "data-testid": "badge" } }, text(ref("dish.badge")))])])),
  use("Title", { props: { As: 3, Size: "base", Weight: "bold" } }, when(ref("dish.href"), [use("Link", { props: { Href: ref("dish.href"), Variant: "default" }, attrs: { "data-testid": "open" } }, text(ref("dish.name")))], [text(ref("dish.name"))])),
  when(ref("dish.weight"), [use("Text", { props: { Size: "xs", Class: "text-muted-foreground" }, attrs: { "data-testid": "portion" } }, text(ref("dish.weight")))]),
  when(eq(ref("density"), "default"), [use("Text", { props: { Size: "sm", Class: "text-muted-foreground" } }, text(ref("dish.summary")))]),
  use("Group", { props: { Gap: "4", Justify: "between", Class: "mt-auto pt-2" } },
    when(eq(ref("prices"), "show"), [use("Text", { props: { Size: "xl", Weight: "bold" }, attrs: { "data-testid": "price" } }, text(money(ref("dish.price"), ref("dish.currency"))))]),
    when(eq(ref("action"), "button"), [use("Button", { props: { Variant: "default", Size: "sm", Type: "button" }, on: { click: call("emit.add", ref("dish.id")) }, attrs: { "data-testid": "add" } }, text(ref("labels.add")))])));

const dishCard = spec("organism.dish-card", "DishCard", "A dish as a card: picture, optional badge, category, name, portion/weight, summary, price and an order button. No rating. Axes: layout (vertical, horizontal), media (image, none), density, action (button, none). Records map from Codex kind `dish`.", {
  typeImports: [{ from: "DishShowcase", names: ["Dish"] }],
  records: { DishLabels: fields(["add", "string"]) },
  props: [
    { name: "dish", type: ts("Dish"), required: true },
    { name: "labels", type: { record: "DishLabels" }, required: true },
    { name: "layout", type: tsOf("vertical", "horizontal"), default: "vertical" },
    { name: "media", type: tsOf("image", "none"), default: "image" },
    { name: "prices", type: tsOf("show", "hide"), default: "show" },
    { name: "action", type: tsOf("button", "none"), default: "button" },
    { name: "density", type: tsOf("default", "compact"), default: "default" },
  ],
  events: [{ name: "add", args: [{ name: "id", type: "string" }], docs: "the order button was pressed" }],
  view: [
    use("Block", { props: { Tag: "article", Class: cn(cardBase(), "h-full gap-4 overflow-hidden", cond(eq(ref("layout"), "horizontal"), "flex flex-col sm:flex-row", "flex flex-col")) }, attrs: { "data-slot": "card", "data-testid": "item", "data-layout": ref("layout") } },
      media(),
      body()),
  ],
});

export const dishCardOrganisms: OrganismSpec[] = [dishCard];
