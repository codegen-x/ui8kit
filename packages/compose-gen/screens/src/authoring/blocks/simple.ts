// The simple line: one content model per block (specs/models: hero@1, team@1), the same content in every variant, the props of the
// organism are exactly the fields of the model plus the axes and the settings (id, level, padding, align, landmarkLabel). Lean semantic markup: a section named by
// its heading, the team as a list, the action as a link, pictures through MediaFrame (the placeholder is decorative).
// packages/prototypes reads these organisms and derives the wireframe prototypes from them; this file stays page-only.
import { add, and, cn, cond, each, eq, ne, op, or, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec, Value } from "../../ir";
import { fields, spec, ts } from "../kit";
import { wide } from "../components/frames";
import { id, imageAlt, imageProps, imageSrcset, title, tsOf } from "../props";

export const O = "organism.";
export const level = { name: "level", type: ts("1 | 2 | 3"), default: 2, docs: "the level of the heading (1 on the first section of a page)" };
export const description = { name: "description", type: "string" as const, default: "", docs: "one paragraph under the heading; empty: none" };
export const titleId = { name: "titleId", value: op("add", ref("id"), "-title") };
/** the section padding presets (a setting of the instance, not a variant axis): even 8px steps, the lg step doubled */
export const SECTION_PADDING = { compact: "py-8 lg:py-16", standard: "py-16 lg:py-32", spacious: "py-24 lg:py-40" } as const;
export const padding = { name: "padding", type: tsOf("compact", "standard", "spacious"), default: "standard", docs: "the vertical padding of the section: compact (py-8 lg:py-16), standard (py-16 lg:py-32), spacious (py-24 lg:py-40)" };
/** the `align` setting (one per block, logical: start / end follow the writing direction; never text-left / text-right) */
export const TEXT_ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const;
export const align = { name: "align", type: tsOf("start", "center", "end"), default: "start", docs: "the alignment of the copy: start, center or end (logical, follows the writing direction): items-* on the column, text-* on the text" };
export const isAlign = (v: "center" | "end") => eq(ref("align"), v);
/** derived once per organism (packages/prototypes inlines them): the Stack Align of the column and the text class */
export const alignDerived = [
  { name: "column", value: cond(isAlign("center"), "center", cond(isAlign("end"), "end", "start")) },
  { name: "textAlign", value: cond(isAlign("center"), TEXT_ALIGN.center, cond(isAlign("end"), TEXT_ALIGN.end, TEXT_ALIGN.start)) },
];
/** the team adds the items-* class of a plain flex column (ListItem, Card) and the align-self of its narrow head */
export const teamDerived = [
  ...alignDerived,
  { name: "itemsAlign", value: cond(isAlign("center"), "items-center", cond(isAlign("end"), "items-end", "items-start")) },
  { name: "selfAlign", value: cond(isAlign("center"), "self-center", cond(isAlign("end"), "self-end", "")) },
];
export const alignItems = ref("column");
export const textAlign = ref("textAlign");
export const itemsAlign = ref("itemsAlign");
export const selfAlign = ref("selfAlign");
export const paddingClass = cond(eq(ref("padding"), "compact"), SECTION_PADDING.compact, cond(eq(ref("padding"), "spacious"), SECTION_PADDING.spacious, SECTION_PADDING.standard));
// the Container is full width up to max-w-6xl (wide: mx-auto w-full); every direct child of the column Stack stretches to it
// (Align stretch): the default stack alignment is items-start, which shrinks a grid to the width of its content
export const section = (...body: Parameters<typeof use>[2][]) =>
  use("Block", { props: { Tag: "section", Class: paddingClass }, attrs: { "aria-labelledby": ref("titleId") } }, use("Container", { props: { Class: wide } }, ...body));
export const lead = (size: string) => when(ref("description"), [use("Text", { props: { Size: size, Class: cn("text-muted-foreground", textAlign) } }, text(ref("description")))]);

export const picture = (ratio: Value, className?: Value) =>
  organism("MediaFrame", { alt: imageAlt(), src: ref("image"), darkSrc: ref("imageDark"), srcset: ref("imageSrcset"), ratio, ...(className !== undefined ? { className } : {}) });
/** an action: drawn when its label and its address are both set; the first is the primary button, the second the secondary */
export const action = (label: string, href: string, variant: "default" | "secondary") =>
  when(and(ref(label), ref(href)), [use("LinkButton", { props: { Variant: variant, Size: "lg", Href: ref(href) } }, text(ref(label)))]);
/** the row of up to two actions (primary, then secondary); none drawn when both are empty */
export const actions = (justify: Value) =>
  when(or(and(ref("actionLabel"), ref("actionHref")), and(ref("secondaryActionLabel"), ref("secondaryActionHref"))), [
    use("Group", { props: { Gap: "4", Align: "center", Justify: justify, Class: "flex-wrap" } },
      action("actionLabel", "actionHref", "default"),
      action("secondaryActionLabel", "secondaryActionHref", "secondary"))]);
export const actionProps = [
  { name: "actionLabel", type: "string" as const, default: "", docs: "the label of the action; the link is drawn when the label and the address are both set" },
  { name: "actionHref", type: "string" as const, default: "", docs: "the address of the action" },
  { name: "secondaryActionLabel", type: "string" as const, default: "", docs: "the label of the second action (the secondary button after the first); drawn when the label and the address are both set" },
  { name: "secondaryActionHref", type: "string" as const, default: "", docs: "the address of the second action" },
];
export const imageDark = { name: "imageDark", type: "string" as const, docs: "address of the picture in the dark theme; none: image" };

/** the hero picture, one node after the copy: before it (order-first) at the start and on top; wide (21/9) on top or at the bottom,
 * 4/3 beside the copy; portrait beside the copy: narrowed to max-w-sm and at least min-h-128 tall from md up (3 by 4 at the full width) */
const wideMedia = or(eq(ref("media"), "top"), eq(ref("media"), "bottom"));
const media = (v: string) => eq(ref("media"), v);
const tall = eq(ref("ratio"), "portrait");
const TALL = "mx-auto w-full max-w-sm md:aspect-auto md:min-h-128";
const heroPictureDerived = [
  { name: "frame", value: cond(wideMedia, "grid grid-cols-1 gap-8", "grid grid-cols-1 items-center gap-8 md:grid-cols-2") },
  { name: "pictureRatio", value: cond(wideMedia, "21/9", "4/3") },
  { name: "pictureClass", value: cond(and(media("start"), tall), `order-first ${TALL}`, cond(media("start"), "order-first", cond(media("top"), "order-first", cond(and(media("end"), tall), TALL, "")))) },
];
const heroPicture = picture(ref("pictureRatio"), ref("pictureClass"));

const heroSimple = spec(`${O}hero-simple`, "HeroSimple", "The simple hero (model hero@1): an optional badge, the heading, a description, up to two links as the actions (links styled as buttons, the first primary, the second secondary: each drawn only when its label and its address are both set) and one picture. Axes: media (end: the picture after the copy, start: before it, top: above it, wide, bottom: under it, wide), ratio (landscape: 4/3 beside the copy, portrait: narrowed and tall, 3 by 4, beside the copy from md up).", {
  props: [
    id,
    { name: "badge", type: "string", default: "", docs: "a short pill above the heading; empty: no badge" },
    title,
    description,
    ...imageProps,
    imageSrcset,
    imageDark,
    ...actionProps,
    level,
    padding,
    align,
    { name: "media", type: tsOf("end", "start", "top", "bottom"), default: "end" },
    { name: "ratio", type: tsOf("landscape", "portrait"), default: "landscape" },
  ],
  derived: [titleId, ...alignDerived, ...heroPictureDerived],
  view: [section(
    use("Box", { props: { Class: ref("frame") } },
      use("Stack", { props: { Gap: "6", Align: alignItems } },
        when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]),
        use("Title", { props: { As: ref("level"), Size: "4xl", Weight: "bold", Class: cn("tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("lg"),
        actions(alignItems)),
      heroPicture))],
});

// The split (model split@1): two halves of the section, no container. The picture fills its half to the edge of the screen (width
// and height, rounded-none: md:aspect-auto md:h-full, the image object-cover inside MediaFrame); the copy keeps the padding setting
// and its own inline padding. The copy is aligned to the start (a fixed composition, no align setting). Later media kinds of the
// half (video, a sign-in form) are fields of a later split model, never a setting of this one.
const splitSimple = spec(`${O}split-simple`, "SplitSimple", "The simple split (model split@1): two halves of the section, the copy (the heading, a description, up to two links as the actions: the first primary, the second secondary, each drawn only when its label and its address are both set) and one picture that fills its half to the edge of the screen (no rounding). Axes: media (end: the picture after the copy, start: before it).", {
  props: [
    id,
    title,
    description,
    ...imageProps,
    imageSrcset,
    imageDark,
    ...actionProps,
    level,
    padding,
    { name: "media", type: tsOf("end", "start"), default: "end" },
  ],
  derived: [titleId],
  view: [use("Block", { props: { Tag: "section" }, attrs: { "aria-labelledby": ref("titleId") } },
    use("Box", { props: { Class: "grid grid-cols-1 md:grid-cols-2" } },
      when(eq(ref("media"), "start"), [picture("4/3", "rounded-none md:aspect-auto md:h-full")]),
      use("Stack", { props: { Gap: "6", Align: "start", Justify: "center", Class: cn("px-4 md:px-8 lg:px-16", paddingClass) } },
        use("Title", { props: { As: ref("level"), Size: "4xl", Weight: "bold", Class: "tracking-tight" }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        when(ref("description"), [use("Text", { props: { Size: "lg", Class: "text-muted-foreground" } }, text(ref("description")))]),
        actions("start")),
      when(eq(ref("media"), "end"), [picture("4/3", "rounded-none md:aspect-auto md:h-full")])))],
});

const teamLayout = (v: string) => eq(ref("layout"), v);
const inlinePerson = or(teamLayout("byline"), teamLayout("list"));
const teamSimple = spec(`${O}team-simple`, "TeamSimple", "The simple team (model team@1): the heading, a description and the members as a list, each with a portrait, the name and a line. Axes: layout (grid: the portrait over the copy, aside: the head beside large square portraits from md up, byline: a small disc beside the copy, list: a larger disc beside the copy, two columns), cols (2, 3, 4 columns from md up), surface (plain, cards: each member on a card surface).", {
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
    { name: "layout", type: tsOf("grid", "aside", "byline", "list"), default: "grid" },
    { name: "cols", type: tsOf("2", "3", "4"), default: "3" },
    { name: "surface", type: tsOf("plain", "cards"), default: "plain" },
  ],
  derived: [
    titleId, ...alignDerived, teamDerived[3]!,
    { name: "frame", value: cond(teamLayout("aside"), "md:grid md:grid-cols-3 md:items-start", "") },
    { name: "grid", value: cond(teamLayout("aside"), "md:col-span-2 md:grid-cols-3", cond(eq(ref("cols"), "2"), "", cond(eq(ref("cols"), "3"), "md:grid-cols-3", "md:grid-cols-4"))) },
    { name: "person", value: cond(inlinePerson, "flex w-full flex-row items-center gap-4", cond(isAlign("center"), "flex w-full flex-col items-center gap-4", cond(isAlign("end"), "flex w-full flex-col items-end gap-4", "flex w-full flex-col items-start gap-4"))) },
    { name: "portrait", value: cond(teamLayout("aside"), "w-full", cond(teamLayout("byline"), "size-12 rounded-full", "size-16 rounded-full")) },
    { name: "copyAlign", value: cond(inlinePerson, "start", ref("column")) },
    { name: "copyText", value: cond(inlinePerson, "text-start", ref("textAlign")) },
  ],
  view: [section(
    use("Stack", { props: { Gap: "12", Align: "stretch", Class: ref("frame") } },
      use("Stack", { props: { Gap: "4", Align: alignItems, Class: cn("max-w-2xl", selfAlign) } },
        use("Title", { props: { As: ref("level"), Size: "3xl", Weight: "bold", Class: cn("tracking-tight", textAlign) }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("base")),
      use("List", { props: { Tag: "ul", Class: cn("m-0 grid w-full list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2", ref("grid")) } },
        each(ref("members"), "m", ref("m.id"),
          use("ListItem", { props: { Class: cn(ref("person"), cond(eq(ref("surface"), "cards"), "rounded bg-card p-6 text-card-foreground border border-border", "")) }, attrs: { "data-testid": "member" } },
            ...person())))))],
});

/** the portrait, the name (one level under the heading) and the line of a member, aligned by the setting (at the start beside a disc) */
function person() {
  return [
    organism("MediaFrame", { alt: ref("m.title"), src: ref("m.avatar"), ratio: "1/1", className: cn("shrink-0", ref("portrait")) }),
    use("Stack", { props: { Gap: "2", Align: ref("copyAlign") } },
      use("Title", { props: { As: add(ref("level"), 1), Size: "lg", Weight: "semibold", Class: ref("copyText") } }, text(ref("m.title"))),
      when(ref("m.description"), [use("Text", { props: { Size: "sm", Class: cn("text-muted-foreground", ref("copyText")) } }, text(ref("m.description")))])),
  ];
}

export const simpleOrganisms: OrganismSpec[] = [heroSimple, splitSimple, teamSimple];
