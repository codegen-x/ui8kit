// RichText: the body of the current page or post, rich text from the content source (the Codex `content`, the_content of a CMS) as
// trusted markup, under its title, its meta line and an optional cover or side note. The markup is styled by the Prose composition.
import { coalesce, cond, eq, html, or, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value, ViewNode } from "../../ir";
import { fields, groupFields, prop, rec, req, spec } from "../kit";
import { frame } from "../components/frames";
import { kids } from "../forms";
import { tsOf, toneLite, denseLite } from "../props";

const O = "organism.";

/** the record of the current route the block reads (kind page, scope current): its body is trusted markup (`content|html`) */
const RichEntry = fields(["id", "string"], ["title", "string"], ["content", "TrustedHtml", true], ["excerpt", "string", true], ["date", "string", true],
  ["author", "string", true], ["category", "string", true], ["image", "string", true], ["aside", "TrustedHtml", true]);

/** the body as Prose: the one child of the primitive is the trusted markup, printed without escaping; no markup, no body (emptyMode omit) */
const body = (width: Value, size: "sm" | "base" = "base", testid = "richtext-content", from = "content"): ViewNode =>
  when(ref(from), [use("Prose", { props: { Size: size, Width: width }, attrs: { "data-testid": testid } }, html(ref(from)))]);

const metaLine = (): ViewNode => when(or(ref("meta.date"), ref("meta.author"), ref("meta.category")), [
  use("Group", { props: { Gap: "4", Align: "center", Class: "flex-wrap" }, attrs: { "data-testid": "richtext-meta" } },
    when(ref("meta.date"), [use("Text", { props: { Size: "sm", Class: "text-muted-foreground" } }, text(ref("meta.date")))]),
    when(ref("meta.author"), [use("Text", { props: { Size: "sm", Weight: "semibold" } }, text(ref("meta.author")))]),
    when(ref("meta.category"), [organism("Pill", { tone: "blue" }, kids(text(ref("meta.category"))))])),
]);

const cover = (ratio: Value): ViewNode => organism("MediaFrame", { alt: coalesce(ref("media.alt"), ref("title")), src: ref("media.src"), ratio });

/** the side note of the sidebar layout: a card after the body (not a landmark of its own), its heading one level under the title */
// the side note shows only when its markup is set (an empty |html read gives nothing): a title alone is no card
const sideNote = (): ViewNode => when(ref("aside.content"), [
  use("Card", { props: { Variant: "compact", Class: "h-fit" }, attrs: { "data-testid": "richtext-aside" } },
    when(ref("aside.title"), [use("Title", { props: { As: cond(eq(ref("level"), 1), 2, 3), Size: "lg", Weight: "semibold" } }, text(ref("aside.title")))]),
    body("none", "sm", "richtext-aside-content", "aside.content")),
]);

export const richText = spec(`${O}rich-text`, "RichText", "Rich text: the body of the current page or post (trusted markup from the content source) styled by Prose, under its title and a meta line (date, author, category). Axes: layout (narrow: one reading column; wide: a wider column; sidebar: the body and a side note; media: a cover above the body; card: the body in a card; hero: the title as the page heading over a wide cover), tone, density.", {
  records: {
    RichEntry,
    RichMedia: groupFields(["src", "string", "address of the picture; none: the placeholder"], ["alt", "string", "accessible name of the picture; none: the title"]),
    RichMeta: groupFields(["date", "string", "the date, formatted"], ["author", "string", "the author's name"], ["category", "string", "the category"]),
    RichAside: groupFields(["title", "string", "heading of the side note"], ["content", "TrustedHtml", "the side note, trusted markup"]),
  },
  props: [
    req("id", "string", "ties the heading to the section: the heading id is `<id>-title`"),
    prop("title", "string", "the title of the page; empty string: no heading", { default: "" }),
    prop("content", "TrustedHtml", "the body: trusted markup (`content|html` of the source), printed without escaping; a plain string is escaped"),
    prop("media", rec("RichMedia"), "the cover of the media and hero layouts"),
    prop("meta", rec("RichMeta"), "the meta line under the title: date, author, category"),
    prop("aside", rec("RichAside"), "the side note of the sidebar layout"),
    prop("level", { ts: "1 | 2" }, "heading level of the title: 1 when the block is the page heading", { default: 2 }),
    prop("layout", tsOf("narrow", "wide", "sidebar", "media", "card", "hero"), "how the body is laid out", { default: "narrow" }),
    prop("tone", toneLite, "background", { default: "default" }),
    prop("density", denseLite, "vertical padding", { default: "default" }),
  ],
  view: (() => {
    const is = (...ls: string[]): Value => ls.length === 1 ? eq(ref("layout"), ls[0]) : or(...ls.map((l) => eq(ref("layout"), l)));
    const head = { id: ref("id"), title: ref("title"), level: ref("level"), tone: ref("tone"), density: ref("density"),
      measure: cond(is("narrow", "media"), "2xl", cond(is("card"), "3xl", "default")), boxed: is("card") };
    const sidebar = use("Grid", { props: { Cols: "1", Class: "gap-8 lg:grid-cols-3" } },
      use("Box", { props: { Class: "min-w-0 lg:col-span-2" } }, body("none")), sideNote());
    return [frame(head, [metaLine(), when(is("hero", "media"), [cover(cond(is("hero"), "21/9", "16/9"))]),
      when(is("sidebar"), [sidebar], [body(cond(is("wide"), "wide", cond(is("hero"), "narrow", "none")))])])];
  })(),
});

export const richTextOrganisms: OrganismSpec[] = [richText];
