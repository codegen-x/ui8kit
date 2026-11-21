// The simple line, wave 2 (offers, products and service facts; one content model each, specs/models): PricingSimple (pricing@1),
// ContactsSimple (contacts@1), LocationsSimple (locations@1), OffersSimple (offers@1), ProductsSimple (products@1), ProductSimple
// (product@1), CollectionsSimple (collections@1), SpecsSimple (specs@1), CompareSimple (compare@1), CourseOutline (curriculum@1),
// ChoiceLinks (choices@1), PurchaseSimple (purchase@1), StorePolicies (store-policy@1), ProductReviews (reviews@1). The rules of
// simple.ts: the props are the fields of the model plus the axes and the settings; only the compositions packages/prototypes lowers.
import { and, cn, each, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value, ViewNode } from "../../ir";
import { fields, spec } from "../kit";
import { id, title, tsOf } from "../props";
import { O, level, description, titleId, padding, alignDerived, teamDerived, alignItems, textAlign, itemsAlign, section, lead, action } from "./simple";
import { centered, list, heading, head, itemTitle, itemText, ulist, is, isAlignV, chain, avatar } from "./simple-more";

const str = (name: string, docs: string, required = false) => (required ? { name, type: "string" as const, required: true, docs } : { name, type: "string" as const, default: "", docs });
const actionPair = [str("actionLabel", "the label of the action; the link is drawn when the label and the address are both set"), str("actionHref", "the address of the action")];
const axis = (name: string, ...values: string[]) => ({ name, type: tsOf(...values), default: values[0] });
const CARD = "rounded bg-card p-6 text-card-foreground border border-border";
const cols23 = (name = "grid") => chain(name, [[is("cols", "2"), "md:grid-cols-2"]], "md:grid-cols-3");
/** an action of a list item (the label and the address of the record), drawn when both are set */
const itemAction = (v: string, variant = "default", size = "sm") =>
  when(and(ref(`${v}.actionLabel`), ref(`${v}.actionHref`)), [use("LinkButton", { props: { Variant: variant, Size: size, Href: ref(`${v}.actionHref`) } }, text(ref(`${v}.actionLabel`)))]);
const linkTo = (href: string, body: ViewNode) => when(ref(href), [use("LinkPlain", { props: { Href: ref(href), Class: "hover:text-primary" } }, body)], [body]);
const strong = (field: string, size = "2xl", cls: Value = "") => use("Text", { props: { Size: size, Weight: "bold", Class: cn("tracking-tight", cls) } }, text(ref(field)));
const listSection = (body: ViewNode, narrow: Value = "") => section(use("Stack", { props: { Gap: "12", Align: "stretch", Class: narrow } }, head(), body));

// ---- PricingSimple (pricing@1): plans on cards in two or three columns, or rows; a badge marks the highlighted plan
const pricingSimple = spec(`${O}pricing-simple`, "PricingSimple", "The simple pricing (model pricing@1): the heading, a description and the plans as a list on a card surface, each with the name, an optional badge (the highlighted plan), a line, the price and an action. Axes: layout (cards: columns, rows: one under the other, a row each from md up), cols (2, 3 columns of the cards).", {
  records: { PricingPlan: fields(["id", "string"], ["title", "string"], ["price", "string"], ["description", "string", true], ["badge", "string", true], ["actionLabel", "string", true], ["actionHref", "string", true]) },
  props: [id, title, description, list("plans", "PricingPlan", "the plans, in the order they are shown (1 to 4)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), ""], [is("cols", "2"), "mx-auto max-w-4xl md:grid-cols-2"]], "md:grid-cols-3"),
    chain("item", [[is("layout", "rows"), "flex flex-col gap-4 md:flex-row md:items-center md:gap-8"]], "flex flex-col justify-between gap-6"),
    chain("copy", [[is("layout", "rows"), "md:grow"]], ""),
  ],
  view: [listSection(
    ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
      each(ref("plans"), "p", ref("p.id"),
        use("ListItem", { props: { Class: cn(CARD, ref("item")) }, attrs: { "data-testid": "plan" } },
          use("Stack", { props: { Gap: "2", Align: "start", Class: ref("copy") } },
            when(ref("p.badge"), [use("Badge", { props: { Variant: "default" } }, text(ref("p.badge")))]),
            itemTitle("p.title", "lg", "text-start"),
            itemText("p.description", "text-start")),
          strong("p.price", "3xl"),
          itemAction("p", "default", "lg")))))],
});

// ---- ContactsSimple (contacts@1): teams or channels on cards (an icon disc, the name, a line, an action), or rows
const contactsSimple = spec(`${O}contacts-simple`, "ContactsSimple", "The simple contacts (model contacts@1): the heading, a description and the contacts as a list on a card surface, each with an icon picture (a disc), the name, a line and an action. Axes: layout (cards: columns, the copy centred by the align setting, rows: the icon beside the copy), cols (2, 3 columns).", {
  records: { ContactItem: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["description", "string", true], ["actionLabel", "string", true], ["actionHref", "string", true]) },
  props: [id, title, description, list("items", "ContactItem", "the contacts, in the order they are shown (1 to 6)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived, cols23(),
    chain("item", [[is("layout", "rows"), "flex flex-row items-start gap-4"], [isAlignV("center"), "flex flex-col items-center gap-4"], [isAlignV("end"), "flex flex-col items-end gap-4"]], "flex flex-col items-start gap-4"),
    chain("copyAlign", [[is("layout", "rows"), "start"], [isAlignV("center"), "center"], [isAlignV("end"), "end"]], "start"),
    chain("copyText", [[is("layout", "rows"), "text-start"], [isAlignV("center"), "text-center"], [isAlignV("end"), "text-end"]], "text-start"),
  ],
  view: [listSection(
    ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
      each(ref("items"), "c", ref("c.id"),
        use("ListItem", { props: { Class: cn(CARD, ref("item")) }, attrs: { "data-testid": "contact" } },
          avatar("c.title", "c.image"),
          use("Stack", { props: { Gap: "4", Align: ref("copyAlign") } },
            use("Stack", { props: { Gap: "2", Align: ref("copyAlign") } }, itemTitle("c.title", "lg", ref("copyText")), itemText("c.description", ref("copyText"))),
            itemAction("c"))))))],
});

// ---- LocationsSimple (locations@1): the head and the offices (a name, the address) beside one picture, at the start or the end
const locationsSimple = spec(`${O}locations-simple`, "LocationsSimple", "The simple locations (model locations@1): the heading, a description, the offices as a list (the name, the address) and one picture (a map or a place). Axes: media (start: the picture before the copy from md up, end: after it).", {
  records: { LocationItem: fields(["id", "string"], ["title", "string"], ["description", "string", true]) },
  props: [id, title, description, str("image", "address of the picture; none: the placeholder"), str("imageAlt", "alt text of the picture", true), str("imageSrcset", "sizes of the picture as a srcset (`hero-960.webp 960w, hero-1280.webp 1280w`); none: `image` only"), list("items", "LocationItem", "the offices, in the order they are shown (1 to 6)"), level, padding, { ...centered, default: "start" }, axis("media", "start", "end")],
  derived: [titleId, ...teamDerived, chain("pictureClass", [[is("media", "start"), "md:order-first"]], "")],
  view: [section(
    use("Box", { props: { Class: "grid grid-cols-1 items-center gap-12 md:grid-cols-2" } },
      use("Stack", { props: { Gap: "8", Align: "stretch" } },
        head(),
        ulist("grid grid-cols-1 gap-6 sm:grid-cols-2",
          each(ref("items"), "l", ref("l.id"),
            use("ListItem", { props: { Class: cn("flex flex-col gap-2", itemsAlign) }, attrs: { "data-testid": "location" } }, itemTitle("l.title", "base"), itemText("l.description"))))),
      organism("MediaFrame", { alt: ref("imageAlt"), src: ref("image"), srcset: ref("imageSrcset"), ratio: "1/1", className: ref("pictureClass") })))],
});

// ---- OffersSimple (offers@1): two or three offers on cards, each with a title, a line and an action
const offersSimple = spec(`${O}offers-simple`, "OffersSimple", "The simple offers (model offers@1): the heading, a description and the offers as a list on a card surface, each with a title, a line and an action. Axes: cols (2, 3 columns from md up).", {
  records: { OfferItem: fields(["id", "string"], ["title", "string"], ["description", "string", true], ["actionLabel", "string", true], ["actionHref", "string", true]) },
  props: [id, title, description, list("items", "OfferItem", "the offers, in the order they are shown (1 to 3)"), level, padding, centered, axis("cols", "2", "3")],
  derived: [titleId, ...teamDerived, cols23()],
  view: [listSection(
    ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
      each(ref("items"), "o", ref("o.id"),
        use("ListItem", { props: { Class: cn(CARD, "flex flex-col items-start justify-between gap-6") }, attrs: { "data-testid": "offer" } },
          use("Stack", { props: { Gap: "2", Align: "start" } }, itemTitle("o.title", "xl", "text-start"), itemText("o.description", "text-start", "base")),
          itemAction("o")))))],
});

// ---- ProductsSimple (products@1): products (a picture, the name as a link, the price) in three or four columns, or rows
const productsSimple = spec(`${O}products-simple`, "ProductsSimple", "The simple products (model products@1): the heading, a description and the products as a list, each with a picture, the name (a link when the product has an address) and the price. Axes: layout (grid: columns, rows: the picture at the start of each row, a quarter of it), cols (3, 4 columns of the grid).", {
  records: { ProductItem: fields(["id", "string"], ["image", "string", true], ["imageSrcset", "string", true], ["title", "string"], ["price", "string"], ["href", "string", true]) },
  props: [id, title, description, list("items", "ProductItem", "the products, in the order they are shown (1 to 8)"), level, padding, centered, axis("layout", "grid", "rows"), axis("cols", "3", "4")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "mx-auto max-w-3xl grid-cols-1 gap-6"], [is("cols", "4"), "grid-cols-2 gap-6 md:grid-cols-4"]], "grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"),
    chain("item", [[is("layout", "rows"), "flex flex-row items-center gap-6"]], "flex flex-col gap-4"),
    chain("pictureClass", [[is("layout", "rows"), "w-1/4 shrink-0"]], ""),
  ],
  view: [listSection(
    ulist(cn("grid", ref("grid")),
      each(ref("items"), "p", ref("p.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "product" } },
          organism("MediaFrame", { alt: ref("p.title"), src: ref("p.image"), srcset: ref("p.imageSrcset"), ratio: "4/3", className: ref("pictureClass") }),
          use("Stack", { props: { Gap: "2", Align: "start" } },
            linkTo("p.href", itemTitle("p.title", "base", "text-start")),
            use("Text", { props: { Size: "base", Weight: "semibold", Class: "text-start" } }, text(ref("p.price"))))))))],
});

// ---- ProductSimple (product@1): the pictures (the main one and thumbnails) beside the name, the price, a line and the action
const productSimple = spec(`${O}product-simple`, "ProductSimple", "The simple product (model product@1): the main picture and up to four thumbnails as a list (named by the product), beside the name as the heading, the price, a description and one action. Axes: media (start: the pictures before the copy from md up, end: after it, top: above it, wide).", {
  records: { ProductPhoto: fields(["id", "string"], ["image", "string", true]) },
  props: [id, title, description, str("price", "the price as it is shown", true), str("image", "address of the main picture; none: the placeholder"), str("imageAlt", "alt text of the main picture", true), str("imageSrcset", "sizes of the picture as a srcset (`hero-960.webp 960w, hero-1280.webp 1280w`); none: `image` only"), ...actionPair, list("photos", "ProductPhoto", "more pictures, thumbnails under the main one (0 to 4)"), level, padding, { ...centered, default: "start" }, axis("media", "start", "end", "top")],
  derived: [
    titleId, ...alignDerived,
    chain("frame", [[is("media", "top"), "grid grid-cols-1 gap-8"]], "grid grid-cols-1 items-start gap-12 md:grid-cols-2"),
    chain("gallery", [[is("media", "end"), ""]], "order-first"),
    chain("ratio", [[is("media", "top"), "21/9"]], "4/3"),
    chain("thumbs", [[is("media", "top"), "grid-cols-4 md:grid-cols-6"]], "grid-cols-4"),
  ],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "6", Align: alignItems } },
        heading("4xl"),
        strong("price", "2xl", cn("text-primary", textAlign)),
        lead("base"),
        action("actionLabel", "actionHref", "default")),
      use("Stack", { props: { Gap: "4", Align: "stretch", Class: ref("gallery") } },
        organism("MediaFrame", { alt: ref("imageAlt"), src: ref("image"), srcset: ref("imageSrcset"), ratio: ref("ratio") }),
        ulist(cn("grid gap-4", ref("thumbs")),
          each(ref("photos"), "t", ref("t.id"),
            use("ListItem", { attrs: { "data-testid": "thumb" } }, organism("MediaFrame", { alt: ref("title"), src: ref("t.image"), ratio: "1/1" })))))))],
});

// ---- CollectionsSimple (collections@1): categories as one link each (a picture and the name) in two, three or four columns
const collectionsSimple = spec(`${O}collections-simple`, "CollectionsSimple", "The simple collections (model collections@1): the heading, a description and the collections as a list, each a picture and the name inside one link. Axes: cols (2, 3, 4 columns from md up).", {
  records: { CollectionItem: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["href", "string"]) },
  props: [id, title, description, list("items", "CollectionItem", "the collections, in the order they are shown (1 to 8)"), level, padding, centered, axis("cols", "4", "3", "2")],
  derived: [titleId, ...teamDerived, chain("grid", [[is("cols", "2"), "md:grid-cols-2"], [is("cols", "3"), "md:grid-cols-3"]], "md:grid-cols-4")],
  view: [listSection(
    ulist(cn("grid grid-cols-2 gap-6", ref("grid")),
      each(ref("items"), "c", ref("c.id"),
        use("ListItem", { attrs: { "data-testid": "collection" } },
          use("LinkPlain", { props: { Href: ref("c.href"), Class: "flex flex-col gap-4 hover:text-primary" } },
            organism("MediaFrame", { alt: ref("c.title"), src: ref("c.image"), ratio: "1/1" }),
            use("Text", { props: { Size: "base", Weight: "semibold", Class: "text-start" } }, text(ref("c.title"))))))))],
});

// ---- SpecsSimple (specs@1): name / value rows on a muted surface, in one narrow column or two columns
const specsSimple = spec(`${O}specs-simple`, "SpecsSimple", "The simple specs (model specs@1): the heading, a description and the specifications as a list of rows on a muted surface, each the name and its value. Axes: layout (rows: one narrow column, columns: two columns from md up).", {
  records: { SpecItem: fields(["id", "string"], ["title", "string"], ["description", "string"]) },
  props: [id, title, description, list("items", "SpecItem", "the specifications, in the order they are shown (1 to 16)"), level, padding, centered, axis("layout", "rows", "columns")],
  derived: [titleId, ...teamDerived, chain("narrow", [[is("layout", "rows"), "mx-auto max-w-3xl"]], ""), chain("grid", [[is("layout", "columns"), "md:grid-cols-2"]], "")],
  view: [listSection(
    ulist(cn("grid grid-cols-1 gap-2", ref("grid")),
      each(ref("items"), "s", ref("s.id"),
        use("ListItem", { props: { Class: "grid grid-cols-2 gap-4 rounded bg-muted px-4 py-2" }, attrs: { "data-testid": "spec" } },
          use("Text", { props: { Size: "sm", Weight: "medium", Class: "text-start" } }, text(ref("s.title"))),
          use("Text", { props: { Size: "sm", Class: "text-muted-foreground text-start" } }, text(ref("s.description")))))),
    ref("narrow"))],
});


// ---- CompareSimple (compare@1): two options side by side: a header row with their names, then a row per feature (three columns)
// (rows of a grid, not a table: the wireframe shapes of packages/prototypes are boxes, which a table row cannot hold)
const cell = (field: string, cls: string) => use("Text", { props: { Size: "sm", Class: cn("text-start", cls) } }, text(ref(field)));
const ROW = "grid grid-cols-3 gap-4 px-4 py-4";
const compareSimple = spec(`${O}compare-simple`, "CompareSimple", "The simple compare (model compare@1): the heading, a description, a header row with the names of the two options, then the rows as a list, each a feature with the value of each option, in three columns on a bordered surface. Axes: width (wide: the full container, narrow: max-w-3xl).", {
  records: { CompareLine: fields(["id", "string"], ["title", "string"], ["first", "string"], ["second", "string"]) },
  props: [id, title, description, str("firstLabel", "the name of the first option", true), str("secondLabel", "the name of the second option", true), list("rows", "CompareLine", "the rows, in the order they are shown (1 to 12)"), level, padding, centered, axis("width", "wide", "narrow")],
  derived: [titleId, ...teamDerived, chain("narrow", [[is("width", "narrow"), "mx-auto max-w-3xl"]], "")],
  view: [listSection(
    use("Box", { props: { Class: "flex w-full flex-col rounded border border-border" } },
      use("Box", { props: { Class: cn(ROW, "rounded bg-muted") } },
        use("Box", { props: { Class: "w-full" } }),
        cell("firstLabel", "font-semibold"),
        cell("secondLabel", "font-semibold")),
      ulist("flex flex-col",
        each(ref("rows"), "r", ref("r.id"),
          use("ListItem", { props: { Class: ROW }, attrs: { "data-testid": "compare-row" } },
            cell("r.title", "font-medium"),
            cell("r.first", "text-muted-foreground"),
            cell("r.second", "text-muted-foreground"))))),
    ref("narrow"))],
});

// ---- CourseOutline (curriculum@1): the modules in order (a label, a title, a line, the length): rows, or two columns of cards
const courseOutline = spec(`${O}course-outline`, "CourseOutline", "The course outline (model curriculum@1): the heading, a description and the modules as an ordered list, each with a short label (a badge), the title, a line and a meta line (the length). Axes: layout (rows: one under the other in a narrow column, cards: two columns on a card surface from md up).", {
  records: { CourseModule: fields(["id", "string"], ["label", "string"], ["title", "string"], ["description", "string", true], ["meta", "string", true]) },
  props: [id, title, description, list("modules", "CourseModule", "the modules, in the order they are taken (1 to 12)"), level, padding, { ...centered, default: "start" }, axis("layout", "rows", "cards")],
  derived: [
    titleId, ...teamDerived,
    chain("narrow", [[is("layout", "rows"), "mx-auto max-w-3xl"]], ""),
    chain("grid", [[is("layout", "cards"), "gap-6 md:grid-cols-2"]], "gap-8"),
    chain("item", [[is("layout", "cards"), `${CARD} flex flex-col items-start gap-4`]], "flex flex-col items-start gap-4 sm:flex-row"),
  ],
  view: [listSection(
    use("List", { props: { Tag: "ol", Class: cn("m-0 grid w-full list-none grid-cols-1 p-0", ref("grid")) } },
      each(ref("modules"), "m", ref("m.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "module" } },
          use("Badge", { props: { Variant: "secondary" } }, text(ref("m.label"))),
          use("Stack", { props: { Gap: "2", Align: "start", Class: "grow" } }, itemTitle("m.title", "lg", "text-start"), itemText("m.description", "text-start")),
          itemText("m.meta", "text-start whitespace-nowrap")))),
    ref("narrow"))],
});

// ---- ChoiceLinks (choices@1): the options (sizes, versions) as outline links: a wrapping row, or a grid of four
const choiceLinks = spec(`${O}choice-links`, "ChoiceLinks", "The choice links (model choices@1): the heading, a description and the options as a list of outline links (sizes, versions, plans). Axes: layout (row: a wrapping row placed by the align setting, grid: two columns, four from md up, each link the full width of its cell).", {
  records: { ChoiceItem: fields(["id", "string"], ["label", "string"], ["href", "string"]) },
  props: [id, title, description, list("items", "ChoiceItem", "the options, in the order they are shown (1 to 8)"), level, padding, centered, axis("layout", "row", "grid")],
  derived: [
    titleId, ...teamDerived,
    chain("row", [[is("layout", "grid"), "grid grid-cols-2 gap-4 md:grid-cols-4"], [isAlignV("center"), "flex flex-wrap justify-center gap-4"], [isAlignV("end"), "flex flex-wrap justify-end gap-4"]], "flex flex-wrap justify-start gap-4"),
    chain("link", [[is("layout", "grid"), "w-full"]], ""),
  ],
  view: [section(
    use("Stack", { props: { Gap: "8", Align: "stretch" } },
      head(),
      ulist(ref("row"),
        each(ref("items"), "c", ref("c.id"),
          use("ListItem", { props: { Class: "flex" }, attrs: { "data-testid": "choice" } },
            use("LinkButton", { props: { Variant: "outline", Size: "lg", Href: ref("c.href"), Class: ref("link") } }, text(ref("c.label"))))))))],
});

// ---- PurchaseSimple (purchase@1): the copy beside the price, the action and a note on a card surface, or all centred
const purchaseSimple = spec(`${O}purchase-simple`, "PurchaseSimple", "The simple purchase (model purchase@1): on a card surface, the heading and a description beside the price, one action and a note. Axes: layout (panel: the copy at the start, the price and the action at the end from md up, centered: one centred column).", {
  props: [id, title, description, str("price", "the price as it is shown", true), str("note", "a short note under the action; empty: none"), ...actionPair, level, padding, axis("layout", "panel", "centered")],
  derived: [
    titleId,
    chain("box", [[is("layout", "panel"), "md:flex-row md:items-center md:justify-between md:gap-12"]], "items-center"),
    chain("copyAlign", [[is("layout", "panel"), "start"]], "center"),
    chain("copyText", [[is("layout", "panel"), "text-start"]], "text-center"),
    chain("buy", [[is("layout", "panel"), "md:items-end"]], ""),
  ],
  view: [section(
    use("Box", { props: { Class: cn(CARD, "flex flex-col gap-8", ref("box")) } },
      use("Stack", { props: { Gap: "4", Align: ref("copyAlign"), Class: "max-w-2xl" } },
        use("Title", { props: { As: ref("level"), Size: "2xl", Weight: "bold", Class: cn("tracking-tight", ref("copyText")) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        when(ref("description"), [use("Text", { props: { Size: "base", Class: cn("text-muted-foreground", ref("copyText")) } }, text(ref("description")))])),
      use("Stack", { props: { Gap: "4", Align: ref("copyAlign"), Class: cn("shrink-0", ref("buy")) } },
        strong("price", "3xl", ref("copyText")),
        action("actionLabel", "actionHref", "default"),
        itemText("note", ref("copyText"), "xs"))))],
});

// ---- StorePolicies (store-policy@1): payment, delivery and returns on cards (an icon, a title, a line), or rows
const storePolicies = spec(`${O}store-policies`, "StorePolicies", "The store policies (model store-policy@1): the heading, a description and the policies as a list, each with an icon picture (a small rounded square), a title and a line. Axes: layout (cards: columns on a card surface, rows: the icon beside the copy, two columns), cols (2, 3 columns of the cards).", {
  records: { PolicyItem: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [id, title, description, list("items", "PolicyItem", "the policies, in the order they are shown (1 to 6)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("layout", "rows"), "gap-8 md:grid-cols-2"], [is("cols", "2"), "gap-6 md:grid-cols-2"]], "gap-6 md:grid-cols-3"),
    chain("item", [[is("layout", "rows"), "flex flex-row items-start gap-4"]], `${CARD} flex flex-col items-start gap-4`),
  ],
  view: [listSection(
    ulist(cn("grid grid-cols-1", ref("grid")),
      each(ref("items"), "p", ref("p.id"),
        use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "policy" } },
          organism("MediaFrame", { alt: ref("p.title"), src: ref("p.image"), ratio: "1/1", className: "size-10 shrink-0 rounded" }),
          use("Stack", { props: { Gap: "2", Align: "start" } }, itemTitle("p.title", "base", "text-start"), itemText("p.description", "text-start"))))))],
});

// ---- ProductReviews (reviews@1): reviews (the rating, the words, the reviewer) on cards in columns, or rows
const productReviews = spec(`${O}product-reviews`, "ProductReviews", "The product reviews (model reviews@1): the heading, a description and the reviews as a list on a card surface, each with the rating as it is shown (the primary token), the words, then the reviewer: the portrait, the name and a line. Axes: layout (cards: columns, rows: one under the other in a narrow column), cols (2, 3 columns of the cards).", {
  records: { ReviewItem: fields(["id", "string"], ["rating", "string"], ["quote", "string"], ["avatar", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [id, title, description, list("items", "ReviewItem", "the reviews, in the order they are shown (1 to 6)"), level, padding, centered, axis("layout", "cards", "rows"), axis("cols", "3", "2")],
  derived: [titleId, ...teamDerived, chain("grid", [[is("layout", "rows"), "mx-auto max-w-3xl"], [is("cols", "2"), "md:grid-cols-2"]], "md:grid-cols-3")],
  view: [listSection(
    ulist(cn("grid grid-cols-1 gap-6", ref("grid")),
      each(ref("items"), "r", ref("r.id"),
        use("ListItem", { props: { Class: cn(CARD, "flex flex-col gap-4") }, attrs: { "data-testid": "review" } },
          use("Text", { props: { Size: "sm", Weight: "semibold", Class: "text-primary text-start" } }, text(ref("r.rating"))),
          use("Text", { props: { Size: "base", Class: "text-start" } }, text(ref("r.quote"))),
          use("Group", { props: { Gap: "4", Align: "center" } },
            avatar("r.title", "r.avatar", "size-10"),
            use("Stack", { props: { Gap: "0", Align: "start" } }, itemTitle("r.title", "sm", "text-start"), itemText("r.description", "text-start", "xs")))))))],
});

export const simpleCommerceOrganisms: OrganismSpec[] = [
  pricingSimple, contactsSimple, locationsSimple, offersSimple, productsSimple, productSimple, collectionsSimple, specsSimple,
  compareSimple, courseOutline, choiceLinks, purchaseSimple, storePolicies, productReviews,
];
