// The simple line, more blocks (one content model each, specs/models): IntroSimple (intro@1), GalleryHero (gallery@1), FeaturesSimple
// (features@1), StatsSimple (stats@1), StoriesSimple (stories@1), PhotosSimple (photos@1), TestimonialsSimple (testimonials@1),
// LogosSimple (logos@1), FaqSimple (faq@1), StepsSimple (steps@1). The same rules as simple.ts: the props are the fields of the model
// plus the axes and the settings; a section named by its heading, lists as lists, links as links, pictures through MediaFrame.
// Only the layout compositions packages/prototypes lowers (Block, Container, Box, Stack, Group, List, ListItem, Card, Link) and the
// places (Title, Text, Badge, LinkButton, MediaFrame) are used, so every block has its wireframe.
import { add, and, cn, cond, each, eq, ne, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value, ViewNode } from "../../ir";
import { fields, spec, ts } from "../kit";
import { id, title, tsOf } from "../props";
import {
  O, level, description, titleId, padding, align, alignDerived, teamDerived, alignItems, textAlign, itemsAlign, selfAlign,
  section, lead, actions, actionProps,
} from "./simple";

export const badge = { name: "badge", type: "string" as const, default: "", docs: "a short pill above the heading; empty: no badge" };
export const centered = { ...align, default: "center" };
export const list = (name: string, record: string, docs: string) => ({ name, type: ts(`${record}[]`), required: true, docs });
export const heading = (size: string) =>
  use("Title", { props: { As: ref("level"), Size: size, Weight: "bold", Class: cn("tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title")));
/** the head of a list section: the heading and the description, narrow (max-w-2xl), placed by the align setting */
export const head = (extra: Value = selfAlign) =>
  use("Stack", { props: { Gap: "4", Align: alignItems, Class: cn("max-w-2xl", extra) } }, heading("3xl"), lead("base"));
/** the title of an item (one level under the heading) and its line */
export const itemTitle = (field: string, size = "lg", cls: Value = textAlign) =>
  use("Title", { props: { As: add(ref("level"), 1), Size: size, Weight: "semibold", Class: cls } }, text(ref(field)));
export const itemText = (field: string, cls: Value = textAlign, size = "sm") =>
  when(ref(field), [use("Text", { props: { Size: size, Class: cn("text-muted-foreground", cls) } }, text(ref(field)))]);
/** a list that fills its column (w-full), the bullets and the browser spacing off */
export const ulist = (cls: Value, ...body: ViewNode[]) => use("List", { props: { Tag: "ul", Class: cn("m-0 w-full list-none p-0", cls) } }, ...body);
export const is = (axis: string, v: string) => eq(ref(axis), v);
export const isAlignV = (v: string) => eq(ref("align"), v);
/** a derived class (or ratio): the first value whose test holds, else the fallback (a flat chain: one branch per line in the output) */
export const chain = (name: string, rows: Array<[Value, string]>, fallback: string) =>
  ({ name, value: rows.reduceRight<Value>((acc, [t, v]) => cond(t, v, acc), fallback) });
export const colsChain = (name: string, prefix: string, axis = "cols") =>
  chain(name, [[is(axis, "2"), `${prefix}md:grid-cols-2`], [is(axis, "3"), `${prefix}md:grid-cols-3`]], `${prefix}md:grid-cols-4`);
export const avatar = (alt: string, src: string, size = "size-12") => organism("MediaFrame", { alt: ref(alt), src: ref(src), ratio: "1/1", className: `${size} shrink-0 rounded-full` });

// ---- IntroSimple (intro@1): text only, the copy centred or at the start, in the middle of the section or low in a tall one
const introSimple = spec(`${O}intro-simple`, "IntroSimple", "The simple intro (model intro@1): an optional badge, a large heading, a description and up to two links as the actions (the first primary, the second secondary, each drawn only when its label and its address are both set). Text only. Axes: place (middle: the copy in the middle of the section, bottom: low in a tall section, min-h-96).", {
  props: [id, badge, title, description, ...actionProps, level, padding, centered, { name: "place", type: tsOf("middle", "bottom"), default: "middle" }],
  derived: [titleId, ...teamDerived],
  view: [section(
    use("Stack", { props: { Gap: "0", Align: alignItems, Justify: cond(is("place", "bottom"), "end", "center"), Class: cond(is("place", "bottom"), "min-h-96", "") } },
      use("Stack", { props: { Gap: "6", Align: alignItems } },
        when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]),
        use("Title", { props: { As: ref("level"), Size: "5xl", Weight: "bold", Class: cn("max-w-4xl tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        when(ref("description"), [use("Text", { props: { Size: "lg", Class: cn("max-w-2xl text-muted-foreground", textAlign) } }, text(ref("description")))]),
        actions(alignItems))))],
});

// ---- GalleryHero (gallery@1): the hero copy beside (or over) three or four photos.
// One list after the copy in the DOM; at the start it is moved before the copy from md up (md:order-first).
const galleryHero = spec(`${O}gallery-hero`, "GalleryHero", "The gallery hero (model gallery@1): the heading, a description, up to two links as the actions and three or four photos as a list. Axes: media (end: the photos after the copy, start: before it from md up, bottom: in a row under it), count (3: three square photos in a row, 4: a 2 x 2 grid, a row of four under the copy).", {
  records: { GalleryPhoto: fields(["id", "string"], ["image", "string", true], ["imageAlt", "string"]) },
  props: [
    id, title, description, ...actionProps, list("photos", "GalleryPhoto", "the photos, in the order they are shown (3 or 4)"), level, padding, align,
    { name: "media", type: tsOf("end", "start", "bottom"), default: "end" },
    { name: "count", type: tsOf("3", "4"), default: "3" },
  ],
  derived: [
    titleId, ...alignDerived,
    chain("frame", [[is("media", "bottom"), "grid grid-cols-1 gap-12"]], "grid grid-cols-1 items-center gap-12 md:grid-cols-2"),
    chain("photoCols", [[and(is("media", "bottom"), is("count", "4")), "grid-cols-2 md:grid-cols-4"], [is("count", "4"), "grid-cols-2"]], "grid-cols-3"),
    chain("photoOrder", [[is("media", "start"), "md:order-first"]], ""),
    chain("photoRatio", [[is("media", "bottom"), "4/3"], [is("count", "4"), "4/3"]], "1/1"),
  ],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "6", Align: alignItems } },
        heading("4xl"),
        lead("lg"),
        actions(alignItems)),
      ulist(cn("grid items-start gap-4", ref("photoCols"), ref("photoOrder")),
        each(ref("photos"), "p", ref("p.id"),
          use("ListItem", { attrs: { "data-testid": "photo" } },
            organism("MediaFrame", { alt: ref("p.imageAlt"), src: ref("p.image"), ratio: ref("photoRatio") }))))))],
});

// ---- FeaturesSimple (features@1): the head over the features or beside them; the icon picture on top or at the side of each
const inline = is("marker", "inline");
const featuresSimple = spec(`${O}features-simple`, "FeaturesSimple", "The simple features (model features@1): the heading, a description and the features as a list, each with an icon picture (a disc), a title and a line. Axes: layout (stack: the head over the list, aside: the head beside it from md up), cols (2, 3, 4 columns), marker (top: the icon over the copy, inline: beside it).", {
  records: { SimpleFeature: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [
    id, title, description, list("items", "SimpleFeature", "the features, in the order they are shown (1 to 8)"), level, padding, centered,
    { name: "layout", type: tsOf("stack", "aside"), default: "stack" },
    { name: "cols", type: tsOf("2", "3", "4"), default: "3" },
    { name: "marker", type: tsOf("top", "inline"), default: "top" },
  ],
  derived: [
    titleId, ...teamDerived,
    chain("frame", [[is("layout", "aside"), "md:grid md:grid-cols-3 md:items-start"]], ""),
    chain("grid", [[and(is("layout", "aside"), is("cols", "2")), "md:col-span-2"], [is("layout", "aside"), "md:col-span-2 md:grid-cols-3"], [is("cols", "2"), "md:grid-cols-2"], [is("cols", "3"), "md:grid-cols-3"]], "md:grid-cols-4"),
    chain("item", [[inline, "flex flex-row items-start gap-4"], [isAlignV("center"), "flex flex-col items-center gap-4"], [isAlignV("end"), "flex flex-col items-end gap-4"]], "flex flex-col items-start gap-4"),
    chain("copyAlign", [[inline, "start"], [isAlignV("center"), "center"], [isAlignV("end"), "end"]], "start"),
    chain("copyText", [[inline, "text-start"], [isAlignV("center"), "text-center"], [isAlignV("end"), "text-end"]], "text-start"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch", Class: ref("frame") } },
      head(),
      ulist(cn("grid grid-cols-1 gap-8 sm:grid-cols-2", ref("grid")),
        each(ref("items"), "f", ref("f.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "feature" } },
            avatar("f.title", "f.image"),
            use("Stack", { props: { Gap: "2", Align: ref("copyAlign") } }, itemTitle("f.title", "lg", ref("copyText")), itemText("f.description", ref("copyText"))))))))],
});

// ---- StatsSimple (stats@1): the head and a row of figures, plain or on cards
const statBody = (): ViewNode[] => [
  use("Text", { props: { Size: "4xl", Weight: "bold", Class: cn("tracking-tight text-primary", textAlign) } }, text(ref("s.value"))),
  use("Stack", { props: { Gap: "2", Align: alignItems } }, itemTitle("s.title", "base"), itemText("s.description")),
];
const statsSimple = spec(`${O}stats-simple`, "StatsSimple", "The simple stats (model stats@1): the heading, a description and the figures as a list, each with the value (large, the primary token), a label and a note. Axes: cols (2, 3, 4 columns from md up), surface (plain, cards).", {
  records: { SimpleStat: fields(["id", "string"], ["value", "string"], ["title", "string"], ["description", "string", true]) },
  props: [
    id, title, description, list("items", "SimpleStat", "the figures, in the order they are shown (1 to 4)"), level, padding, centered,
    { name: "cols", type: tsOf("2", "3", "4"), default: "4" },
    { name: "surface", type: tsOf("plain", "cards"), default: "plain" },
  ],
  derived: [titleId, ...teamDerived, colsChain("grid", "")],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-1 gap-8 sm:grid-cols-2", ref("grid")),
        each(ref("items"), "s", ref("s.id"),
          use("ListItem", { props: { Class: cond(is("surface", "cards"), "flex", cn("flex flex-col gap-2", itemsAlign)) }, attrs: { "data-testid": "stat" } },
            when(is("surface", "cards"), [use("Card", { props: { Class: cn("flex w-full flex-col gap-2 p-6", itemsAlign) } }, ...statBody())], statBody()))))))],
});

// ---- StoriesSimple (stories@1): posts as cards in columns, or compact rows on a card surface
const lay = (v: string) => is("layout", v);
const storiesSimple = spec(`${O}stories-simple`, "StoriesSimple", "The simple stories (model stories@1): the heading, a description and the stories (posts) as a list, each with a cover picture, the title (a link when the story has an address) and a line. Axes: layout (grid: cards in columns, compact: small covers beside the copy on a card surface), cols (2, 3 columns).", {
  records: { SimpleStory: fields(["id", "string"], ["image", "string", true], ["title", "string"], ["description", "string", true], ["href", "string", true]) },
  props: [
    id, title, description, list("stories", "SimpleStory", "the stories, in the order they are shown (1 to 6)"), level, padding, centered,
    { name: "layout", type: tsOf("grid", "compact"), default: "grid" },
    { name: "cols", type: tsOf("2", "3"), default: "3" },
  ],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[is("cols", "2"), "md:grid-cols-2"]], "md:grid-cols-3"),
    chain("item", [[lay("compact"), "flex flex-row items-center gap-4 rounded bg-card p-4 text-card-foreground border border-border"]], "flex flex-col gap-4"),
    chain("coverRatio", [[lay("compact"), "1/1"], [is("cols", "2"), "16/9"]], "4/3"),
    chain("cover", [[lay("compact"), "size-16 shrink-0"]], ""),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-1 gap-8", ref("grid")),
        each(ref("stories"), "s", ref("s.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "story" } },
            organism("MediaFrame", { alt: ref("s.title"), src: ref("s.image"), ratio: ref("coverRatio"), className: ref("cover") }),
            use("Stack", { props: { Gap: "2", Align: "start" } },
              when(ref("s.href"),
                [use("Link", { props: { Href: ref("s.href"), Variant: "block" } }, itemTitle("s.title", "lg", "text-start"))],
                [itemTitle("s.title", "lg", "text-start")]),
              itemText("s.description", "text-start")))))))],
});

// ---- PhotosSimple (photos@1): the photos in two, three or four columns
const photosSimple = spec(`${O}photos-simple`, "PhotosSimple", "The simple photos (model photos@1): the heading, a description and the photos as a list. Axes: cols (2, 3, 4 columns from md up; a pair at 4/3, more as squares).", {
  records: { SimplePhoto: fields(["id", "string"], ["image", "string", true], ["imageAlt", "string"]) },
  props: [
    id, title, description, list("photos", "SimplePhoto", "the photos, in the order they are shown (1 to 12)"), level, padding, centered,
    { name: "cols", type: tsOf("2", "3", "4"), default: "4" },
  ],
  derived: [
    titleId, ...teamDerived,
    colsChain("grid", ""),
    chain("ratio", [[is("cols", "2"), "4/3"]], "1/1"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-2 gap-4", ref("grid")),
        each(ref("photos"), "p", ref("p.id"),
          use("ListItem", { attrs: { "data-testid": "photo" } },
            organism("MediaFrame", { alt: ref("p.imageAlt"), src: ref("p.image"), ratio: ref("ratio") }))))))],
});

// ---- TestimonialsSimple (testimonials@1): one structure (the quote, then the author with the portrait), placed by the layout:
// on cards in columns, in rows with the author beside the quote (md:flex-row), or centred one under the other
const testimonialsSimple = spec(`${O}testimonials-simple`, "TestimonialsSimple", "The simple testimonials (model testimonials@1): the heading, a description and the quotes as a list, each with the words, then the author: the portrait, the name and a role line. Axes: layout (cards: the quotes on a card surface in columns, rows: the author beside the quote from md up, centered: the quotes centred, one under the other), cols (2, 3 columns of the cards).", {
  records: { SimpleQuote: fields(["id", "string"], ["quote", "string"], ["avatar", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [
    id, title, description, list("quotes", "SimpleQuote", "the quotes, in the order they are shown (1 to 6)"), level, padding, centered,
    { name: "layout", type: tsOf("cards", "rows", "centered"), default: "cards" },
    { name: "cols", type: tsOf("2", "3"), default: "3" },
  ],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[lay("rows"), "gap-12"], [lay("centered"), "mx-auto max-w-3xl gap-16"], [is("cols", "2"), "gap-8 md:grid-cols-2"]], "gap-8 md:grid-cols-3"),
    chain("item", [
      [lay("cards"), "flex flex-col gap-6 rounded bg-card p-6 text-card-foreground border border-border"],
      [lay("rows"), "flex flex-col gap-6 md:flex-row md:items-start"],
    ], "flex flex-col items-center gap-6"),
    chain("quoteSize", [[lay("cards"), "base"]], "xl"),
    chain("quoteText", [[lay("centered"), "text-center"]], "text-start"),
    chain("author", [[lay("rows"), "start"], [lay("centered"), "center"]], "center"),
    chain("authorBox", [[lay("rows"), "flex-col md:w-48 md:shrink-0"], [lay("centered"), "flex-col"]], ""),
    chain("authorAlign", [[lay("centered"), "center"]], "start"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      head(),
      ulist(cn("grid grid-cols-1", ref("grid")),
        each(ref("quotes"), "q", ref("q.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "quote" } },
            use("Text", { props: { Size: ref("quoteSize"), Class: cn("md:grow", ref("quoteText")) } }, text(ref("q.quote"))),
            use("Group", { props: { Gap: "4", Align: ref("author"), Class: ref("authorBox") } },
              avatar("q.title", "q.avatar"),
              use("Stack", { props: { Gap: "2", Align: ref("authorAlign") } }, itemTitle("q.title", "base", ref("quoteText")), itemText("q.description", ref("quoteText")))))))))],
});

// ---- LogosSimple (logos@1): a short heading over a row of logos, plain or on cards
const logosSimple = spec(`${O}logos-simple`, "LogosSimple", "The simple logos (model logos@1): a short heading and the logos as a list, each a picture named by the company. Axes: surface (plain: a wrapping row, cards: a grid on a card surface).", {
  records: { SimpleLogo: fields(["id", "string"], ["image", "string", true], ["title", "string"]) },
  props: [
    id, title, list("logos", "SimpleLogo", "the logos, in the order they are shown (1 to 8)"), level, padding, centered,
    { name: "surface", type: tsOf("plain", "cards"), default: "plain" },
  ],
  derived: [
    titleId, ...teamDerived,
    chain("row", [[is("surface", "cards"), "grid grid-cols-2 gap-4 md:grid-cols-4"], [isAlignV("center"), "flex flex-wrap justify-center gap-8"], [isAlignV("end"), "flex flex-wrap justify-end gap-8"]], "flex flex-wrap justify-start gap-8"),
    chain("item", [[is("surface", "cards"), "flex rounded bg-card p-6 border border-border"]], "w-32"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "8", Align: alignItems } },
      use("Title", { props: { As: ref("level"), Size: "lg", Weight: "semibold", Class: cn("text-muted-foreground", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
      ulist(ref("row"),
        each(ref("logos"), "l", ref("l.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "logo" } },
            organism("MediaFrame", { alt: ref("l.title"), src: ref("l.image"), ratio: "16/9" }))))))],
});

// ---- FaqSimple (faq@1): the head and the questions with their answers, in one or two columns
const faqSimple = spec(`${O}faq-simple`, "FaqSimple", "The simple FAQ (model faq@1): the heading, a description and the questions as a list, each with its answer. Axes: columns (one, two from md up).", {
  records: { SimpleQuestion: fields(["id", "string"], ["title", "string"], ["description", "string"]) },
  props: [
    id, title, description, list("items", "SimpleQuestion", "the questions, in the order they are shown (1 to 12)"), level, padding, align,
    { name: "columns", type: tsOf("one", "two"), default: "two" },
  ],
  derived: [titleId, ...teamDerived, chain("grid", [[is("columns", "two"), "md:grid-cols-2"]], ""), chain("narrow", [[is("columns", "one"), "mx-auto max-w-3xl"]], "")],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch", Class: ref("narrow") } },
      head(),
      ulist(cn("grid grid-cols-1 gap-8", ref("grid")),
        each(ref("items"), "f", ref("f.id"),
          use("ListItem", { props: { Class: "flex flex-col gap-2" }, attrs: { "data-testid": "question" } },
            itemTitle("f.title", "lg", "text-start"),
            use("Text", { props: { Size: "base", Class: "text-muted-foreground text-start" } }, text(ref("f.description"))))))))],
});

// ---- StepsSimple (steps@1): numbered steps in a row or a column
const column = is("layout", "column");
const stepsSimple = spec(`${O}steps-simple`, "StepsSimple", "The simple steps (model steps@1): the heading, a description and the steps as an ordered list, each with its short label (a badge), a title and a line. Axes: layout (row: the steps in columns, column: one under the other with the label at the side), cols (3, 4 columns of the row).", {
  records: { SimpleStep: fields(["id", "string"], ["label", "string"], ["title", "string"], ["description", "string", true]) },
  props: [
    id, title, description, list("steps", "SimpleStep", "the steps, in the order they are taken (1 to 6)"), level, padding, centered,
    { name: "layout", type: tsOf("row", "column"), default: "row" },
    { name: "cols", type: tsOf("3", "4"), default: "4" },
  ],
  derived: [
    titleId, ...teamDerived,
    chain("grid", [[column, ""], [is("cols", "3"), "sm:grid-cols-2 md:grid-cols-3"]], "sm:grid-cols-2 md:grid-cols-4"),
    chain("narrow", [[column, "mx-auto max-w-2xl"]], ""),
    chain("item", [[column, "flex flex-row items-start gap-6"], [isAlignV("center"), "flex flex-col items-center gap-4"], [isAlignV("end"), "flex flex-col items-end gap-4"]], "flex flex-col items-start gap-4"),
    chain("copyAlign", [[column, "start"], [isAlignV("center"), "center"], [isAlignV("end"), "end"]], "start"),
    chain("copyText", [[column, "text-start"], [isAlignV("center"), "text-center"], [isAlignV("end"), "text-end"]], "text-start"),
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch", Class: ref("narrow") } },
      head(),
      use("List", { props: { Tag: "ol", Class: cn("m-0 grid w-full list-none grid-cols-1 gap-8 p-0", ref("grid")) } },
        each(ref("steps"), "s", ref("s.id"),
          use("ListItem", { props: { Class: ref("item") }, attrs: { "data-testid": "step" } },
            use("Badge", { props: { Variant: "secondary" } }, text(ref("s.label"))),
            use("Stack", { props: { Gap: "2", Align: ref("copyAlign") } }, itemTitle("s.title", "lg", ref("copyText")), itemText("s.description", ref("copyText"))))))))],
});

export const simpleMoreOrganisms: OrganismSpec[] = [
  introSimple, galleryHero, featuresSimple, statsSimple, storiesSimple, photosSimple, testimonialsSimple, logosSimple, faqSimple, stepsSimple,
];
