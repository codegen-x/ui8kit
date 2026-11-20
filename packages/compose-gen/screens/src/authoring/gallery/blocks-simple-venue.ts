// The simple line, wave 3: food, stays and local services (organisms in blocks/simple-venue.ts, one content model each). The group
// of each block is the Stock group of its kind (apps/stock): food (the menu). Variants only set axes, plus the default of `align`.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };
const li = (n: string) => ({ sel: "ul > li", n });
const h3 = (n: string) => ({ sel: "ul > li h3", n });
const head = (c: (key: string) => ReturnType<typeof t>) => ({ title: c("title"), description: c("description") });

const men = k("menuSimple");
const menuSimple = define({
  key: "menusimple", theme: "marketing", group: "food", line: "simple", model: "menu@1",
  name: "Simple menu", docs: "The heading, one paragraph and the dishes (a picture, a badge when set, the name, the weight, a line, the price): on cards in three, two or four columns, or menu rows with the price at the end.",
  organism: "MenuSimple", axes: ["layout", "cols"], data: [d.menuDishes],
  variants: [
    ["cards3", "Three dish cards"],
    ["cards2", "Two columns", { cols: "2" }],
    ["cards4", "Four columns", { cols: "4" }],
    ["rows", "Menu rows, the price at the end", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@menuDishes"), h3("@menuDishes"), { sel: '[data-slot="media-frame"]', n: "@menuDishes" }, { sel: '[data-slot="badge"]', n: 2 }],
  sample: { id: "menusimple", ...head(men), items: ref("menuDishes") },
});

export const simpleVenueBlocks = [menuSimple];
