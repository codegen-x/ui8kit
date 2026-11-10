// Restaurant dining blocks: a dish card, a menu board, a table reservation form and a photo gallery with a lightbox.
// Theme `commerce` (the block schema has no restaurant theme), group `restaurant`. Codex: kind `dish` / `dishsection` / `photo` / `contact`.
import { pick, ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const r = (k: string) => t(`restaurant.${k}`);
const base = { theme: "commerce" as const, group: "restaurant" };
const items = (n: number | string) => [{ sel: ':is([data-slot="item"], [data-slot="menusection"] [data-slot="card"])', n }];

const dish = define({
  ...base, key: "dish", name: "Dish card", docs: "A dish as a card: picture, category, portion/weight, price and an order button. No rating.",
  organism: "DishCard", axes: ["layout", "media", "density", "action"], fit: "card", data: [d.meals],
  variants: [
    ["vertical", "Vertical card with a picture"],
    ["horizontal", "Horizontal, picture on the side", { layout: "horizontal" }],
    ["textOnly", "Without a picture", { media: "none" }],
    ["compact", "Compact, no description", { density: "compact" }],
    ["browse", "No order button", { action: "none" }],
  ],
  facts: [
    { sel: '[data-slot="card"]', n: 1 },
    { sel: '[data-slot="portion"]', n: 1 },
    { sel: '[data-slot="card"] [data-slot="button"][type="button"]', n: 1, when: { action: "button" } },
    { sel: '[data-slot="card"] [data-slot="button"][type="button"]', n: 0, when: { action: "none" } },
  ],
  sample: { dish: pick(ref("meals"), "dish-meals-bowl"), labels: r("dish") },
});

const menuboard = define({
  ...base, key: "menuboard", name: "Menu board", docs: "Category sections with DishCards in a grid, or denser menu rows; prices can be hidden.",
  organism: "MenuBoard", axes: ["layout", "prices", "density"], data: [d.menudishes, d.menusections],
  variants: [
    ["sections", "Sections with a nav and menu rows"],
    ["grid", "Sections of dish cards", { layout: "grid" }],
    ["list", "List of rows, no section nav", { layout: "list" }],
    ["noPrices", "Rows without prices", { prices: "hide" }],
    ["compact", "Compact grid of cards", { layout: "grid", density: "compact" }],
  ],
  facts: [
    { sel: '[data-slot="menusection"]', n: "@menusections" },
    ...items("@menudishes"),
    { sel: '[data-slot="price"]', n: "@menudishes", when: { prices: "show" } },
    { sel: '[data-slot="price"]', n: 0, when: { prices: "hide" } },
    { sel: '[data-slot="section-nav"]', n: 1, when: { layout: "sections" } },
    { sel: '[data-slot="section-nav"]', n: 0, when: { layout: ["grid", "list"] } },
  ],
  sample: { id: "menuboard", title: r("board.title"), lead: r("board.lead"), dishes: ref("menudishes"), sections: ref("menusections"), empty: t("empty.dishes"), labels: t("food.labels") },
});

const reservation = define({
  ...base, key: "reservation", name: "Reservation form", docs: "Book a table: name, phone, date, time, guests, optional notes and consent.",
  organism: "ReservationForm", axes: ["layout", "fields", "terms", "density"], data: [d.contacts],
  variants: [
    ["single", "Single column, all fields"],
    ["split", "Beside the house details", { layout: "split" }],
    ["compact", "Name, phone, date, time and guests", { fields: "compact" }],
    ["consent", "With a consent line", { terms: "show" }],
    ["dense", "Compact density, short fields", { fields: "compact", density: "compact" }],
  ],
  facts: [
    { sel: '[data-slot="reservation-form"]', n: 1 },
    { sel: '[type="submit"]', n: 1 },
    { sel: '[data-slot="details"]', n: 1, when: { layout: "split" } },
    { sel: '[data-slot="details"]', n: 0, when: { layout: "single" } },
  ],
  sample: { id: "reservation", title: r("reservation.title"), text: r("reservation.text"), labels: r("reservation.labels"), details: ref("contacts") },
});

const lightboxgallery = define({
  ...base, key: "lightboxgallery", name: "Lightbox gallery", docs: "A photo gallery with a dialog for the selected picture. Additive to Photo gallery.",
  organism: "LightboxGallery", axes: ["layout", "captions", "lightbox"], data: [d.photos],
  variants: [
    ["grid", "Grid with captions"],
    ["masonry", "Masonry, captions hidden", { layout: "masonry", captions: "hide" }],
    ["featured", "Featured picture over thumbnails", { layout: "featured" }],
    ["open", "Grid with the lightbox open", { lightbox: "open" }],
  ],
  facts: [
    { sel: '[data-slot="item"]', n: "@photos", when: { layout: ["grid", "masonry"] } },
    { sel: '[data-slot="thumbs"] [data-slot="media-frame"]', n: "@photos", when: { layout: "featured" } },
    { sel: '[data-slot="caption"]', n: "@photos", when: { layout: ["grid", "masonry"], captions: "show" } },
    { sel: '[data-slot="caption"]', n: 0, when: { captions: "hide" } },
    { sel: '[data-slot="lightbox"][open]', n: 1, when: { lightbox: "open" } },
    { sel: '[data-slot="lightbox"][open]', n: 0, when: { lightbox: "closed" } },
  ],
  sample: { id: "lightboxgallery", title: r("gallery.title"), lead: r("gallery.lead"), photos: ref("photos"), empty: t("empty.photos"), labels: r("gallery") },
});

export const restaurantBlocks = [dish, menuboard, reservation, lightboxgallery];
