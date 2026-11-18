// The simple line: one content model per block (specs/models: hero@1, team@1), the same content in every variant, the props of the
// organism are exactly the fields of the model plus the axes and the settings (id, level). Lean semantic markup: a section named by
// its heading, the team as a list, the action as a link, pictures through MediaFrame (the placeholder is decorative).
// packages/prototypes reads these organisms and derives the wireframe prototypes from them; this file stays page-only.
import { add, and, cn, cond, each, eq, ne, op, ref, text, use, when, organism } from "../../build";
import type { OrganismSpec } from "../../ir";
import { fields, spec, ts } from "../kit";
import { wide } from "../components/frames";
import { id, imageAlt, imageProps, title, tsOf } from "../props";

const O = "organism.";
const level = { name: "level", type: ts("1 | 2 | 3"), default: 2, docs: "the level of the heading (1 on the first section of a page)" };
const description = { name: "description", type: "string" as const, default: "", docs: "one paragraph under the heading; empty: none" };
const titleId = { name: "titleId", value: op("add", ref("id"), "-title") };
const section = (...body: Parameters<typeof use>[2][]) =>
  use("Block", { props: { Tag: "section", Class: "py-16" }, attrs: { "aria-labelledby": ref("titleId") } }, use("Container", { props: { Class: wide } }, ...body));
const lead = (size: string) => when(ref("description"), [use("Text", { props: { Size: size, Class: "text-muted-foreground" } }, text(ref("description")))]);

const heroSimple = spec(`${O}hero-simple`, "HeroSimple", "The simple hero (model hero@1): an optional badge, the heading, a description, one link as the action and one picture. Axes: media (end: the picture after the copy, start: before it, top: above it, wide).", {
  props: [
    id,
    { name: "badge", type: "string", default: "", docs: "a short pill above the heading; empty: no badge" },
    title,
    description,
    ...imageProps,
    { name: "imageDark", type: "string", docs: "address of the picture in the dark theme; none: image" },
    { name: "actionLabel", type: "string", default: "", docs: "the label of the action; the link is drawn when the label and the address are both set" },
    { name: "actionHref", type: "string", default: "", docs: "the address of the action" },
    level,
    { name: "media", type: tsOf("end", "start", "top"), default: "end" },
  ],
  derived: [titleId],
  view: [section(
    use("Box", { props: { Class: cn("grid grid-cols-1 gap-8", cond(eq(ref("media"), "top"), "", "items-center md:grid-cols-2")) } },
      when(ne(ref("media"), "end"), [organism("MediaFrame", { alt: imageAlt(), src: ref("image"), darkSrc: ref("imageDark"), ratio: cond(eq(ref("media"), "top"), "21/9", "4/3") })]),
      use("Stack", { props: { Gap: "6", Align: "start" } },
        when(ref("badge"), [use("Badge", { props: { Variant: "secondary" } }, text(ref("badge")))]),
        use("Title", { props: { As: ref("level"), Size: "4xl", Weight: "bold", Class: "tracking-tight" }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("lg"),
        when(and(ref("actionLabel"), ref("actionHref")), [use("Button", { props: { Variant: "default", Size: "lg", Href: ref("actionHref") } }, text(ref("actionLabel")))])),
      when(eq(ref("media"), "end"), [organism("MediaFrame", { alt: imageAlt(), src: ref("image"), darkSrc: ref("imageDark"), ratio: "4/3" })])))],
});

const teamSimple = spec(`${O}team-simple`, "TeamSimple", "The simple team (model team@1): the heading, a description and the members as a list, each with a portrait, the name and a line. Axes: cols (2, 3, 4 columns from md up), surface (plain, cards).", {
  records: { SimpleMember: fields(["id", "string"], ["avatar", "string", true], ["title", "string"], ["description", "string", true]) },
  props: [
    id,
    title,
    description,
    { name: "members", type: ts("SimpleMember[]"), required: true, docs: "the people, in the order they are shown (1 to 12)" },
    level,
    { name: "cols", type: tsOf("2", "3", "4"), default: "3" },
    { name: "surface", type: tsOf("plain", "cards"), default: "plain" },
  ],
  derived: [titleId],
  view: [section(
    use("Stack", { props: { Gap: "12" } },
      use("Stack", { props: { Gap: "4", Class: "max-w-2xl" } },
        use("Title", { props: { As: ref("level"), Size: "3xl", Weight: "bold", Class: "tracking-tight" }, attrs: { id: ref("titleId") } }, text(ref("title"))),
        lead("base")),
      use("List", { props: { Tag: "ul", Class: cn("m-0 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2", cond(eq(ref("cols"), "2"), "", cond(eq(ref("cols"), "3"), "md:grid-cols-3", "md:grid-cols-4"))) } },
        each(ref("members"), "m", ref("m.id"),
          use("ListItem", { props: { Class: cond(eq(ref("surface"), "cards"), "flex", "flex flex-col gap-4") }, attrs: { "data-testid": "member" } },
            when(eq(ref("surface"), "cards"),
              [use("Card", { props: { Class: "flex w-full flex-col gap-4 p-6" } }, ...person())],
              person()))))))],
});

/** the portrait, the name (one level under the heading) and the line of a member */
function person() {
  return [
    organism("MediaFrame", { alt: ref("m.title"), src: ref("m.avatar"), ratio: "1/1", className: "size-16 rounded-full" }),
    use("Stack", { props: { Gap: "2" } },
      use("Title", { props: { As: add(ref("level"), 1), Size: "lg", Weight: "semibold" } }, text(ref("m.title"))),
      when(ref("m.description"), [use("Text", { props: { Size: "sm", Class: "text-muted-foreground" } }, text(ref("m.description")))])),
  ];
}

export const simpleOrganisms: OrganismSpec[] = [heroSimple, teamSimple];
