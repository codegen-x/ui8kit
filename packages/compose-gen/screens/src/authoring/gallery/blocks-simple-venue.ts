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

const hrs = k("hoursSimple");
const hoursSimple = define({
  key: "hourssimple", theme: "marketing", group: "contact", line: "simple", model: "hours@1",
  name: "Simple opening hours", docs: "The heading, one paragraph, the address (a link to the map), the phone and the opening hours by day: side by side or in one narrow column, plain or on cards.",
  organism: "HoursSimple", axes: ["layout", "surface"], data: [d.openingHours],
  variants: [
    ["columns", "Address and hours side by side", {}, { align: "start" }],
    ["columnsCard", "Side by side on cards", { surface: "card" }, { align: "start" }],
    ["stack", "One centred column", { layout: "stack" }],
    ["stackCard", "One column on cards", { layout: "stack", surface: "card" }],
  ],
  facts: [h2, li("@openingHours"), { sel: "section a", n: 2 }],
  sample: {
    id: "hourssimple", ...head(hrs), address: hrs("address"), phone: hrs("phone"), phoneHref: "tel:+74951234567",
    mapHref: "https://maps.example.com/?q=grill", items: ref("openingHours"),
  },
});

const rms = k("roomsSimple");
const roomsSimple = define({
  key: "roomssimple", theme: "marketing", group: "catalog", line: "simple", model: "rooms@1",
  name: "Simple rooms", docs: "The heading, one paragraph and the rooms (a picture, the name as a link, the guests, a line, the price a night): on cards in three or two columns, or rows with the picture at the start.",
  organism: "RoomsSimple", axes: ["layout", "cols"], data: [d.roomItems],
  variants: [
    ["cards3", "Three room cards"],
    ["cards2", "Two columns", { cols: "2" }],
    ["rows", "Rows, the picture at the start", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@roomItems"), h3("@roomItems"), { sel: '[data-slot="media-frame"]', n: "@roomItems" }],
  sample: { id: "roomssimple", ...head(rms), items: ref("roomItems") },
});

const amn = k("amenitiesSimple");
const amenitiesSimple = define({
  key: "amenitiessimple", theme: "marketing", group: "features", line: "simple", model: "amenities@1",
  name: "Simple amenities", docs: "The heading, one paragraph and the amenities of a stay or a venue as short names: muted rows in three or two columns, or outlined pills in a wrapping row.",
  organism: "AmenitiesSimple", axes: ["layout", "cols"], data: [d.amenityItems],
  variants: [
    ["grid3", "Three columns"],
    ["grid2", "Two columns", { cols: "2" }],
    ["pills", "Pills in a row", { layout: "pills" }],
  ],
  facts: [h2, li("@amenityItems")],
  sample: { id: "amenitiessimple", ...head(amn), items: ref("amenityItems") },
});

export const simpleVenueBlocks = [menuSimple, hoursSimple, roomsSimple, amenitiesSimple];
