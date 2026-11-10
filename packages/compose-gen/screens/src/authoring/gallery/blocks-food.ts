// Food blocks of the catalog (group food): showcases, cart grids, quick order, pickers and builders, menus and compare tables for
// sites that sell meals, pizza, sushi, recipe kits, produce and grill dishes. Pictures are the MediaFrame placeholders.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const f = (k: string) => t(`food.${k}`);
const L = { labels: f("labels") };
const head = (k: string) => ({ id: k, title: f(`${k}.title`), lead: f(`${k}.lead`), empty: t("empty.dishes"), ...L });
const items = (n: number | string) => [{ sel: '[data-slot="item"]', n }];
const base = { theme: "commerce" as const, group: "food" };

const dishshowcase = define({ ...base, key: "dishshowcase", name: "Dish showcase", docs: "Dish cards that each open the dish page; no cart.",
  organism: "DishShowcase", axes: ["cols", "ratio", "tone"], data: [d.meals],
  variants: [["grid3", "Three columns of link cards"], ["grid4", "Four square cards", { cols: "4", ratio: "1/1" }], ["muted", "Three columns, muted", { tone: "muted" }]],
  facts: items("@meals"), sample: { ...head("showcase"), dishes: ref("meals") } });

const dishcart = define({ ...base, key: "dishcart", name: "Dish cart grid", docs: "Cards with a quantity field and an add button, under a live cart count.",
  organism: "DishCartGrid", axes: ["media", "tone"], data: [d.meals],
  variants: [["cards", "Cards with pictures"], ["textOnly", "Without pictures, muted", { media: "none", tone: "muted" }]],
  facts: [...items("@meals"), { sel: '[data-slot="cart-count"]', n: 1 }], sample: { ...head("cart"), dishes: ref("meals"), count: 2 } });

const quickorder = define({ ...base, key: "quickorder", name: "Quick order", docs: "Compact rows with a one-click order button and a phone field.",
  organism: "QuickOrder", axes: ["phone", "tone"], data: [d.meals],
  variants: [["phone", "Rows under a phone field"], ["rows", "Rows only, muted", { phone: "hide", tone: "muted" }]],
  facts: items("@meals"), sample: { ...head("quick"), dishes: ref("meals") } });

const sushisets = define({ ...base, key: "sushisets", name: "Sushi sets", docs: "A dense grid of sets with the piece count and the rolls of each.",
  organism: "SushiSets", axes: ["cols", "tone"], data: [d.sushisets],
  variants: [["grid4", "Four columns"], ["grid3", "Three columns, muted", { cols: "3", tone: "muted" }]],
  facts: items("@sushisets"), sample: { ...head("sushi"), dishes: ref("sushisets") } });

const dishstrip = define({ ...base, key: "dishstrip", name: "Dish strip", docs: "A horizontal strip of small cards that scrolls sideways.",
  organism: "DishStrip", axes: ["size", "tone"], data: [d.rolls],
  variants: [["small", "Small square cards"], ["large", "Large cards, muted", { size: "lg", tone: "muted" }]],
  facts: items("@rolls"), sample: { ...head("strip"), dishes: ref("rolls") } });

const dishbento = define({ ...base, key: "dishbento", name: "Dish bento", docs: "One featured dish in a large tile among smaller ones.",
  organism: "DishBento", axes: ["feature", "tone"], data: [d.specials],
  variants: [["start", "Featured tile first"], ["end", "Featured tile at the end, muted", { feature: "end", tone: "muted" }]],
  facts: [{ sel: '[data-slot="feature"]', n: 1 }], sample: { ...head("bento"), dishes: ref("specials") } });

const grocerylist = define({ ...base, key: "grocerylist", name: "Grocery list", docs: "A compact list of groceries with a small picture and an add button.",
  organism: "GroceryList", axes: ["thumbs", "cols", "tone"], data: [d.groceries],
  variants: [["twoCols", "Two columns with pictures"], ["plain", "One column, no pictures", { thumbs: "hide", cols: "1" }]],
  facts: items("@groceries"), sample: { ...head("grocery"), dishes: ref("groceries") } });

const weekmenu = define({ ...base, key: "weekmenu", name: "Week of meals", docs: "Meal delivery as a week: one column per day with its meal.",
  organism: "WeekMenu", axes: ["media", "tone"], data: [d.weekmeals, d.weekdays],
  variants: [["week", "Days with pictures"], ["compact", "Days without pictures, muted", { media: "none", tone: "muted" }]],
  facts: [{ sel: '[data-slot="day"]', n: "@weekdays" }, ...items("@weekmeals")], sample: { ...head("week"), dishes: ref("weekmeals"), sections: ref("weekdays") } });

const restaurantmenu = define({ ...base, key: "restaurantmenu", name: "Restaurant menu", docs: "Menu sections with dotted leaders to the price; no cart.",
  organism: "RestaurantMenu", axes: ["cols", "tone"], data: [d.menudishes, d.menusections],
  variants: [["column", "One column"], ["twoCols", "Two columns, muted", { cols: "2", tone: "muted" }]],
  facts: [{ sel: '[data-slot="menusection"]', n: "@menusections" }, ...items("@menudishes")], sample: { ...head("menu"), dishes: ref("menudishes"), sections: ref("menusections") } });

const pizzapicker = define({ ...base, key: "pizzapicker", name: "Pizza picker", docs: "Pizza cards with a size and a crust radio group and an add button.",
  organism: "PizzaPicker", axes: ["layout", "tone"], data: [d.pizzas, d.pizzasizes, d.crusts],
  variants: [["cards", "Cards"], ["rows", "Rows, muted", { layout: "rows", tone: "muted" }]],
  facts: [...items("@pizzas"), { sel: '[role="radiogroup"]', n: 6 }], sample: { ...head("pizza"), dishes: ref("pizzas"), sizes: ref("pizzasizes"), crusts: ref("crusts") } });

const combobuilder = define({ ...base, key: "combobuilder", name: "Combo builder", docs: "Pick a main, a side and a drink beside the total.",
  organism: "ComboBuilder", axes: ["layout", "tone"], data: [d.combomains, d.combosides, d.combodrinks],
  variants: [["split", "Steps beside the summary"], ["stacked", "Summary below, muted", { layout: "stacked", tone: "muted" }]],
  facts: [{ sel: '[role="radiogroup"]', n: 3 }, { sel: '[data-slot="summary"]', n: 1 }],
  sample: { id: "combobuilder", title: f("combo.title"), lead: f("combo.lead"), ...L, mains: ref("combomains"), sides: ref("combosides"), drinks: ref("combodrinks"), total: 1390, currency: "USD" } });

const grillbuilder = define({ ...base, key: "grillbuilder", name: "Grill dish builder", docs: "Choose the meat, the weight and the sides of a grill (mangal) dish.",
  organism: "GrillBuilder", axes: ["layout", "tone"], data: [d.grillmeats, d.grillweights, d.grillsides],
  variants: [["split", "Builder beside the summary"], ["stacked", "Summary below, muted", { layout: "stacked", tone: "muted" }]],
  facts: [{ sel: '[role="radiogroup"]', n: 2 }, { sel: 'input[type="checkbox"]', n: "@grillsides" }],
  sample: { id: "grillbuilder", title: f("grill.title"), lead: f("grill.lead"), ...L, meats: ref("grillmeats"), weights: ref("grillweights"), sides: ref("grillsides"), total: 1890, currency: "USD" } });

const recipekits = define({ ...base, key: "recipekits", name: "Recipe kits", docs: "Kits with the ingredients list, the cooking time and the portions.",
  organism: "RecipeKits", axes: ["layout", "tone"], data: [d.kits, d.portions],
  variants: [["rows", "Picture beside the kit"], ["cards", "Three cards, muted", { layout: "cards", tone: "muted" }]],
  facts: [...items("@kits"), { sel: '[data-slot="ingredients"]', n: "@kits" }], sample: { ...head("kits"), dishes: ref("kits"), portions: ref("portions") } });

const veggiebox = define({ ...base, key: "veggiebox", name: "Vegetable box", docs: "Fill a box by weight: produce tiles beside the box with a meter.",
  organism: "VeggieBox", axes: ["layout", "tone"], data: [d.veggies],
  variants: [["split", "Tiles beside the box"], ["stacked", "Box below, muted", { layout: "stacked", tone: "muted" }]],
  facts: items("@veggies"), sample: { ...head("veggie"), dishes: ref("veggies"), fill: 60, total: 2150, currency: "USD" } });

const dishcompare = define({ ...base, key: "dishcompare", name: "Cut compare", docs: "Grill cuts side by side: a table or compare cards.",
  organism: "DishCompare", axes: ["layout", "tone"], data: [d.cuts],
  variants: [["table", "Accessible table"], ["cards", "Compare cards, muted", { layout: "cards", tone: "muted" }]],
  facts: [...items("@cuts"), { sel: '[data-slot="compare-table"]', n: 1, when: { layout: "table" } }, { sel: '[data-slot="compare-table"]', n: 0, when: { layout: "cards" } }],
  sample: { ...head("compare"), dishes: ref("cuts") } });

export const foodBlocks = [dishshowcase, dishcart, quickorder, sushisets, dishstrip, dishbento, grocerylist, weekmenu, restaurantmenu, pizzapicker, combobuilder, grillbuilder, recipekits, veggiebox, dishcompare];
