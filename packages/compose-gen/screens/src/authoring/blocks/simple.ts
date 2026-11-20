// The simple line: one content model per block (specs/models: hero@1, team@1), the same content in every variant, the props of the
// organism are exactly the fields of the model plus the axes and the settings (id, level, padding, align, landmarkLabel). Lean semantic markup: a section named by
// its heading, the team as a list, the action as a link, pictures through MediaFrame (the placeholder is decorative).
// packages/prototypes reads these organisms and derives the wireframe prototypes from them; this file stays page-only.
import { add, and, cn, cond, each, eq, ne, op, or, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec, ts } from "../kit";
import { wide } from "../components/frames";
import { id, imageAlt, imageProps, title, tsOf } from "../props";

const O = "organism.";
const level = { name: "level", type: ts("1 | 2 | 3"), default: 2, docs: "the level of the heading (1 on the first section of a page)" };
const description = { name: "description", type: "string" as const, default: "", docs: "one paragraph under the heading; empty: none" };
const titleId = { name: "titleId", value: op("add", ref("id"), "-title") };
/** the section padding presets (a setting of the instance, not a variant axis): even 8px steps, the lg step doubled */
export const SECTION_PADDING = { compact: "py-8 lg:py-16", standard: "py-16 lg:py-32", spacious: "py-24 lg:py-40" } as const;
const padding = { name: "padding", type: tsOf("compact", "standard", "spacious"), default: "standard", docs: "the vertical padding of the section: compact (py-8 lg:py-16), standard (py-16 lg:py-32), spacious (py-24 lg:py-40)" };
/** the `align` setting (one per block, logical: start / end follow the writing direction; never text-left / text-right) */
export const TEXT_ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;
const align = { name: "align", type: tsOf("start", "center", "end"), default: "start", docs: "the alignment of the copy: start, center or end (logical, follows the writing direction): items-* on the column, text-* on the text" };
const isAlign = (v: "center" | "end") => eq(ref("align"), v);
/** derived once per organism (packages/prototypes inlines them): the Stack Align of the column and the text class */
const alignDerived = [
  { name: "column", value: cond(isAlign("center"), "center", cond(isAlign("end"), "end", "start")) },
  { name: "textAlign", value: cond(isAlign("center"), TEXT_ALIGN.center, cond(isAlign("end"), TEXT_ALIGN.end, TEXT_ALIGN.start)) },
];
/** the team adds the items-* class of a plain flex column (ListItem, Card) and the align-self of its narrow head */
const teamDerived = [
  ...alignDerived,
  { name: "itemsAlign", value: cond(isAlign("center"), "items-center", cond(isAlign("end"), "items-end", "items-start")) },
  { name: "selfAlign", value: cond(isAlign("center"), "self-center", cond(isAlign("end"), "self-end", "")) },
];
const alignItems = ref("column");
const textAlign = ref("textAlign");
const itemsAlign = ref("itemsAlign");
const selfAlign = ref("selfAlign");
const paddingClass = cond(eq(ref("padding"), "compact"), SECTION_PADDING.compact, cond(eq(ref("padding"), "spacious"), SECTION_PADDING.spacious, SECTION_PADDING.standard));
// the Container is full width up to max-w-6xl (wide: mx-auto w-full); every direct child of the column Stack stretches to it
// (Align stretch): the default stack alignment is items-start, which shrinks a grid to the width of its content
const section = (...body: Parameters<typeof use>[2][]) =>
  use("Block", { props: { Tag: "section", Class: paddingClass }, attrs: { "aria-labelledby": ref("titleId") } }, use("Container", { props: { Class: wide } }, ...body));
const lead = (size: string) => when(ref("description"), [use("Text", { props: { Size: size, Class: cn("text-muted-foreground", textAlign) } }, text(ref("description")))]);

// the hero frame: box (the copy and the picture inside the container, a gap between them) or split (two halves of the section, the
// picture to the edge of the screen at the full height of the copy; the padding moves onto the copy). The top picture ignores split.
const edge = and(eq(ref("frame"), "split"), ne(ref("media"), "top"));
const heroPicture = (ratio: Value) =>
  organism("MediaFrame", { alt: imageAlt(), src: ref("image"), darkSrc: ref("imageDark"), ratio, className: cond(ref("edge"), "md:aspect-auto md:h-full", "") });
/** an action of the hero: drawn when its label and its address are both set; the first is the primary button, the second the secondary */
const heroAction = (label: string, href: string, variant: "default" | "secondary") =>
  when(and(ref(label), ref(href)), [use("LinkButton", { props: { Variant: variant, Size: "lg", Href: ref(href) } }, text(ref(label)))]);

const heroSimple = spec(`${O}hero-simple`, "HeroSimple", "The simple hero (model hero@1): an optional badge, the heading, a description, up to two links as the actions (links styled as buttons, the first primary, the second secondary: each drawn only when its label and its address are both set) and one picture. Axes: media (end: the picture after the copy, start: before it, top: above it, wide), frame (box: inside the container; split: two halves, the picture to the edge of the screen).", {
  props: [
    id,
    { name: "badge", type: "string", default: "", docs: "a short pill above the heading; empty: no badge" },
    title,
    description,
    ...imageProps,
    { name: "imageDark", type: "string", docs: "address of the picture in the dark theme; none: image" },
    { name: "actionLabel", type: "string", default: "", docs: "the label of the action; the link is drawn when the label and the address are both set" },
    { name: "actionHref", type: "string", default: "", docs: "the address of the action" },
    { name: "secondaryActionLabel", type: "string", default: "", docs: "the label of the second action (the secondary button after the first); drawn when the label and the address are both set" },
    { name: "secondaryActionHref", type: "string", default: "", docs: "the address of the second action" },
    level,
    padding,
    align,
    { name: "media", type: tsOf("end", "start", "top"), default: "end" },
    { name: "frame", type: tsOf("box", "split"), default: "box" },
  ],
  derived: [titleId, ...alignDerived, { name: "edge", value: edge }, { name: "pad", value: paddingClass },
    { name: "copyPad", value: cond(ref("edge"), cn("justify-center px-4 md:px-8 lg:px-16", ref("pad")), "") }],
  view: [use("Block", { props: { Tag: "section", Class: cond(ref("edge"), "", ref("pad")) }, attrs: { "aria-labelledby": ref("titleId") } },
    use("Container", { props: { Class: cond(ref("edge"), "w-full", wide) } },
      use("Box", { props: { Class: cn("grid grid-cols-1", cond(ref("edge"), "", "gap-8"), cond(eq(ref("media"), "top"), "", cond(ref("edge"), "md:grid-cols-2", "items-center md:grid-cols-2"))) } },
        when(ne(ref("media"), "end"), [heroPicture(cond(eq(ref("media"), "top"), "21/9", "4/3"))]),
        use("Stack", { props: { Gap: "6", Align: alignItems, Class: ref("copyPad") } },
          when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]),
          use("Title", { props: { As: ref("level"), Size: "4xl", Weight: "bold", Class: cn("tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
          lead("lg"),
          when(or(and(ref("actionLabel"), ref("actionHref")), and(ref("secondaryActionLabel"), ref("secondaryActionHref"))), [
            use("Group", { props: { Gap: "4", Align: "center", Justify: alignItems, Class: "flex-wrap" } },
              heroAction("actionLabel", "actionHref", "default"),
              heroAction("secondaryActionLabel", "secondaryActionHref", "secondary"))])),
        when(eq(ref("media"), "end"), [heroPicture("4/3")]))))],
});

const teamSimple = spec(`${O}team-simple`, "TeamSimple", "The simple team (model team@1): the heading, a description and the members as a list, each with a portrait, the name and a line. Axes: cols (2, 3, 4 columns from md up), surface (plain, cards).", {
  records: { SimpleMember: fields(["id", "string"], ["avatar", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [
    id,
    title,
    description,
    { name: "members", type: ts("SimpleMember[]"), required: true, docs: "the people, in the order they are shown (1 to 12)" },
    level,
    padding,
    // the team defaults to center: its member grid reads as one composition (cols4 is not left-heavy); start / end stay options
    { ...align, default: "center" },
    { name: "cols", type: tsOf("2", "3", "4"), default: "3" },
    { name: "surface", type: tsOf("plain", "cards"), default: "plain" },
  ],
  derived: [titleId, ...teamDerived],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch" } },
      use("Stack", { props: { Gap: "4", Align: alignItems, Class: cn("max-w-2xl", selfAlign) } },
        use("Title", { props: { As: ref("level"), Size: "3xl", Weight: "bold", Class: cn("tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("base")),
      use("List", { props: { Tag: "ul", Class: cn("m-0 grid w-full list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2", cond(eq(ref("cols"), "2"), "", cond(eq(ref("cols"), "3"), "md:grid-cols-3", "md:grid-cols-4"))) } },
        each(ref("members"), "m", ref("m.id"),
          use("ListItem", { props: { Class: cond(eq(ref("surface"), "cards"), "flex", cn("flex flex-col gap-4", itemsAlign)) }, attrs: { "data-testid": "member" } },
            when(eq(ref("surface"), "cards"),
              [use("Card", { props: { Class: cn("flex w-full flex-col gap-4 p-6", itemsAlign) } }, ...person())],
              person()))))))],
});

/** the portrait, the name (one level under the heading) and the line of a member, aligned by the setting */
function person() {
  return [
    organism("MediaFrame", { alt: ref("m.title"), src: ref("m.avatar"), ratio: "1/1", className: "size-16 rounded-full" }),
    use("Stack", { props: { Gap: "2", Align: alignItems } },
      use("Title", { props: { As: add(ref("level"), 1), Size: "lg", Weight: "semibold", Class: textAlign } }, text(ref("m.title"))),
      when(ref("m.description"), [use("Text", { props: { Size: "sm", Class: cn("text-muted-foreground", textAlign) } }, text(ref("m.description")))])),
  ];
}

export const simpleOrganisms: OrganismSpec[] = [heroSimple, teamSimple];
