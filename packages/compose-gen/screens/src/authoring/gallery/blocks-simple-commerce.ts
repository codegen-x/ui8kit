// The simple line, wave 2: offers, products and service facts (organisms in blocks/simple-commerce.ts, one content model each). The
// group of each block is the Stock group of its kind (apps/stock): pricing, contact (contacts, locations), cta (offers), catalog
// (products, collections), product (one product, specs, compare, choices, purchase, reviews), storefront (the store policies) and
// how-it-works (the course outline). Variants only set axes, plus the default of `align` and a second list where a variant needs it.
import { ref } from "../../build";
import { define } from "./blocks-define";
import { t } from "./block-kit";
import * as d from "./blocks-data";

const k = (block: string) => (key: string) => t(`marketing.${block}.${key}`);
const h2 = { sel: "section h2", n: 1 };
const li = (n: string) => ({ sel: "ul > li", n });
const h3 = (n: string) => ({ sel: "ul > li h3", n });
const head = (c: (key: string) => ReturnType<typeof t>) => ({ title: c("title"), description: c("description") });

const pri = k("pricingSimple");
const pricingSimple = define({
  key: "pricingsimple", theme: "marketing", group: "pricing", line: "simple", model: "pricing@1",
  name: "Simple pricing", docs: "The heading, one paragraph and the plans on cards (the name, a badge on the highlighted plan, a line, the price, an action): in three or two columns, or one row each.",
  organism: "PricingSimple", axes: ["layout", "cols"], data: [d.pricingPlans, d.pricingPlans2],
  variants: [
    ["cards3", "Three plans on cards"],
    ["cards2", "Two plans on cards", { cols: "2" }, { plans: ref("pricingPlans2") }],
    ["rows", "One row per plan", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, { sel: '[data-slot="badge"]', n: 1 },
    ...["ul > li", "ul > li h3", 'a[data-slot="button"][href]'].flatMap((sel) => [{ sel, n: 3, when: { cols: "3" } }, { sel, n: 2, when: { cols: "2" } }])],
  sample: { id: "pricingsimple", ...head(pri), plans: ref("pricingPlans") },
});

const con = k("contactsSimple");
const contactsSimple = define({
  key: "contactssimple", theme: "marketing", group: "contact", line: "simple", model: "contacts@1",
  name: "Simple contacts", docs: "The heading, one paragraph and the teams to reach on cards (an icon, the name, a line, an action): in three or two columns, or rows with the icon at the side.",
  organism: "ContactsSimple", axes: ["layout", "cols"], data: [d.contactItems],
  variants: [
    ["cards3", "Three cards"],
    ["cards2", "Two columns", { cols: "2" }],
    ["rows", "Icons at the side", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@contactItems"), h3("@contactItems"), { sel: '[data-slot="media-frame"]', n: "@contactItems" }, { sel: 'a[data-slot="button"][href]', n: "@contactItems" }],
  sample: { id: "contactssimple", ...head(con), items: ref("contactItems") },
});

const loc = k("locationsSimple");
const locationsSimple = define({
  key: "locationssimple", theme: "marketing", group: "contact", line: "simple", model: "locations@1",
  name: "Simple locations", docs: "The heading, one paragraph and the offices (the name, the address) in two columns beside one picture, at the start or the end.",
  organism: "LocationsSimple", axes: ["media"], data: [d.locationItems],
  variants: [
    ["mediaStart", "Picture at the start"],
    ["mediaEnd", "Picture at the end", { media: "end" }],
  ],
  facts: [h2, li("@locationItems"), h3("@locationItems"), { sel: '[data-slot="media-frame"]', n: 1 }],
  sample: { id: "locationssimple", ...head(loc), imageAlt: loc("imageAlt"), items: ref("locationItems") },
});

const off = k("offersSimple");
const offersSimple = define({
  key: "offerssimple", theme: "marketing", group: "cta", line: "simple", model: "offers@1",
  name: "Simple offers", docs: "The heading, one paragraph and two or three offers on cards, each with a title, a line and an action.",
  organism: "OffersSimple", axes: ["cols"], data: [d.offerItems],
  variants: [
    ["duo", "Two offers"],
    ["duoStart", "Two offers, the heading at the start", {}, { align: "start" }],
  ],
  facts: [h2, li("@offerItems"), h3("@offerItems"), { sel: 'a[data-slot="button"][href]', n: "@offerItems" }],
  sample: { id: "offerssimple", ...head(off), items: ref("offerItems") },
});

const pro = k("productsSimple");
const productsSimple = define({
  key: "productssimple", theme: "marketing", group: "catalog", line: "simple", model: "products@1",
  name: "Simple products", docs: "The heading, one paragraph and the products (a picture, the name as a link, the price): in three or four columns, or rows with the picture at the side.",
  organism: "ProductsSimple", axes: ["layout", "cols"], data: [d.productItems],
  variants: [
    ["cards3", "Three columns"],
    ["denseGrid", "Four columns, compact", { cols: "4" }],
    ["rows", "Rows", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@productItems"), h3("@productItems"), { sel: '[data-slot="media-frame"]', n: "@productItems" }],
  sample: { id: "productssimple", ...head(pro), items: ref("productItems") },
});

const one = k("productSimple");
const productSimple = define({
  key: "productsimple", theme: "marketing", group: "product", line: "simple", model: "product@1",
  name: "Simple product", docs: "One product: the main picture and thumbnails beside the name, the price, one paragraph and the action; the pictures at the start, at the end or above.",
  organism: "ProductSimple", axes: ["media"], data: [d.productPhotos],
  variants: [
    ["mediaStart", "Pictures at the start"],
    ["mediaEnd", "Pictures at the end", { media: "end" }],
    ["mediaTop", "Pictures above", { media: "top" }],
  ],
  facts: [h2, li("@productPhotos"), { sel: 'a[data-slot="button"][href]', n: 1 }],
  sample: { id: "productsimple", title: one("title"), description: one("description"), price: "$129", imageAlt: one("imageAlt"), actionLabel: one("actionLabel"), actionHref: "#/cart", photos: ref("productPhotos") },
});

const col = k("collectionsSimple");
const collectionsSimple = define({
  key: "collectionssimple", theme: "marketing", group: "catalog", line: "simple", model: "collections@1",
  name: "Simple collections", docs: "The heading, one paragraph and the collections (a picture and the name as one link) in four or two columns.",
  organism: "CollectionsSimple", axes: ["cols"], data: [d.collectionItems],
  variants: [
    ["cards4", "Four columns"],
    ["cards2", "Two columns", { cols: "2" }],
  ],
  facts: [h2, li("@collectionItems"), { sel: "ul > li a[href]", n: "@collectionItems" }],
  sample: { id: "collectionssimple", ...head(col), items: ref("collectionItems") },
});

const spe = k("specsSimple");
const specsSimple = define({
  key: "specssimple", theme: "marketing", group: "product", line: "simple", model: "specs@1",
  name: "Simple specs", docs: "The heading, one paragraph and the specifications as name and value rows on a muted surface, in one narrow column or two columns.",
  organism: "SpecsSimple", axes: ["layout"], data: [d.specItems],
  variants: [
    ["keyValue", "Rows"],
    ["twoColumns", "Two columns", { layout: "columns" }],
  ],
  facts: [h2, li("@specItems")],
  sample: { id: "specssimple", ...head(spe), items: ref("specItems") },
});

const cmp = k("compareSimple");
const compareSimple = define({
  key: "comparesimple", theme: "marketing", group: "product", line: "simple", model: "compare@1",
  name: "Simple compare", docs: "The heading, one paragraph and two options side by side: their names in a header row, then a row per feature with the value of each.",
  organism: "CompareSimple", axes: ["width"], data: [d.compareRows],
  variants: [
    ["twoProducts", "Two options"],
    ["narrow", "Two options, narrow", { width: "narrow" }],
  ],
  facts: [h2, li("@compareRows")],
  sample: { id: "comparesimple", ...head(cmp), firstLabel: cmp("firstLabel"), secondLabel: cmp("secondLabel"), rows: ref("compareRows") },
});

const cur = k("courseOutline");
const courseOutline = define({
  key: "courseoutline", theme: "marketing", group: "how-it-works", line: "simple", model: "curriculum@1",
  name: "Course outline", docs: "The heading, one paragraph and the modules in order (a label, the title, a line, the length): rows in a narrow column, or two columns of cards.",
  organism: "CourseOutline", axes: ["layout"], data: [d.courseModules],
  variants: [
    ["moduleRows", "Rows"],
    ["cards", "Two columns of cards", { layout: "cards" }],
  ],
  facts: [h2, { sel: "ol > li", n: "@courseModules" }, { sel: "ol > li h3", n: "@courseModules" }, { sel: '[data-slot="badge"]', n: "@courseModules" }],
  sample: { id: "courseoutline", ...head(cur), modules: ref("courseModules") },
});

const cho = k("choiceLinks");
const choiceLinks = define({
  key: "choicelinks", theme: "marketing", group: "product", line: "simple", model: "choices@1",
  name: "Choice links", docs: "The heading, one paragraph and the options (sizes, versions) as outline links: a wrapping row, or a grid of four.",
  organism: "ChoiceLinks", axes: ["layout"], data: [d.choiceItems],
  variants: [
    ["row", "A row"],
    ["grid", "A grid", { layout: "grid" }],
  ],
  facts: [h2, li("@choiceItems"), { sel: 'ul > li a[data-slot="button"][href]', n: "@choiceItems" }],
  sample: { id: "choicelinks", ...head(cho), items: ref("choiceItems") },
});

const pur = k("purchaseSimple");
const purchaseSimple = define({
  key: "purchasesimple", theme: "marketing", group: "product", line: "simple", model: "purchase@1",
  name: "Simple purchase", docs: "On a card surface: the heading and one paragraph beside the price, the action and a note; or all centred.",
  organism: "PurchaseSimple", axes: ["layout"],
  variants: [
    ["panel", "A panel"],
    ["centered", "Centred", { layout: "centered" }],
  ],
  facts: [h2, { sel: 'a[data-slot="button"][href]', n: 1 }],
  sample: { id: "purchasesimple", ...head(pur), price: "$129", note: pur("note"), actionLabel: pur("actionLabel"), actionHref: "#/cart" },
});

const pol = k("storePolicies");
const storePolicies = define({
  key: "storepolicies", theme: "marketing", group: "storefront", line: "simple", model: "store-policy@1",
  name: "Store policies", docs: "The heading, one paragraph and the policies (payment, delivery, returns), each with an icon, a title and a line: on cards in columns, or rows.",
  organism: "StorePolicies", axes: ["layout", "cols"], data: [d.policyItems],
  variants: [
    ["cols3", "Three cards"],
    ["rows", "Icons at the side", { layout: "rows" }, { align: "start" }],
  ],
  facts: [h2, li("@policyItems"), h3("@policyItems"), { sel: '[data-slot="media-frame"]', n: "@policyItems" }],
  sample: { id: "storepolicies", ...head(pol), items: ref("policyItems") },
});

const rev = k("productReviews");
const productReviews = define({
  key: "productreviews", theme: "marketing", group: "product", line: "simple", model: "reviews@1",
  name: "Product reviews", docs: "The heading, one paragraph and the reviews on cards (the rating, the words, the reviewer with the portrait): in three or two columns, or one under the other.",
  organism: "ProductReviews", axes: ["layout", "cols"], data: [d.reviewItems],
  variants: [
    ["cards3", "Three cards"],
    ["rows", "One under the other", { layout: "rows" }],
  ],
  facts: [h2, li("@reviewItems"), h3("@reviewItems"), { sel: '[data-slot="media-frame"]', n: "@reviewItems" }],
  sample: { id: "productreviews", ...head(rev), items: ref("reviewItems") },
});

export const simpleCommerceBlocks = [
  pricingSimple, contactsSimple, locationsSimple, offersSimple, productsSimple, productSimple, collectionsSimple, specsSimple,
  compareSimple, courseOutline, choiceLinks, purchaseSimple, storePolicies, productReviews,
];
