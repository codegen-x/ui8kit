// The shapes of a wireframe: one organism per role, a kit Box with a token background and a height on the 8+4 grid (the role table
// of ui8kit/prototypes packages/blocks/src/classes.ts); rectangles only: no state, effect or transition class. Decorative
// (aria-hidden), with data-shape / data-role / data-slot hooks for the per-element tokens (tokens.css) and the place they stand for
// (data-place, data-field: the builder's inspector). Emitted to out/svelte/shapes.
import { cn, cond, eq, ne, ref, use, when } from "../../compose-gen/screens/src/build";
import type { OrganismSpec, Value, ViewNode } from "../../compose-gen/screens/src/ir";

const ALL = { svelte: true, react: true, vue: true, solid: true, jinja2: true, twig: true, latte: true, templ: true } as const;
const at = [
  { name: "place", type: "string" as const, docs: "the place it stands for (data-place)" },
  { name: "field", type: "string" as const, docs: "the JSON pointer of the field (data-field)" },
];
/** the Stack Align classes (logical: flex start / end follow the writing direction); ShapeText `align` uses the same */
export const ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const satisfies Record<string, string>;
const hooks = (shape: string, role: Value, slot?: string): Record<string, Value> => ({
  "aria-hidden": "true", "data-shape": shape, "data-role": role, ...(slot ? { "data-slot": slot } : {}), "data-place": ref("place"), "data-field": ref("field"),
});
const ts = (...v: string[]) => ({ ts: v.map((x) => JSON.stringify(x)).join(" | ") });

/**
 * The role table of the wireframes: one token background and one 8+4 height per meaning, so roles stay apart in light and
 * dark. The one source of these strings: the shapes below compose them, `out/classes.json` ships them to ui8kit/prototypes
 * (its classes.ts `role`, the theme panels), the Card lowering (project.ts) takes `surface`.
 */
export const ROLE = {
  text: "bg-muted rounded h-2",
  heading: "bg-secondary rounded h-4",
  "heading-lg": "bg-secondary rounded h-6",
  badge: "bg-accent rounded-full h-6",
  "cta-primary": "bg-primary rounded h-10",
  "cta-secondary": "bg-secondary rounded h-10",
  media: "bg-muted rounded",
  avatar: "bg-accent rounded-full h-16 w-16",
  surface: "bg-card border border-border rounded",
} as const;
/** the media of a split half: the media token without the corner (rounded-none) */
export const MEDIA_HALF = "bg-muted rounded-none";
const shape = (key: string, name: string, docs: string, props: OrganismSpec["props"], view: ViewNode[]): OrganismSpec => ({
  specVersion: 1, id: `part.${key}`, name, docs, records: {}, props: [...props, ...at], slots: [], events: [], view, portable: ALL,
});
const bar = (w: string): ViewNode => use("Box", { props: { Class: `${ROLE.text} ${w}` } });

export const SHAPE = {
  ShapeHeading: shape("shape-heading", "ShapeHeading", "A heading bar (wireframe): secondary, h-4 (lg: h-6), as wide as `width`.", [
    { name: "size", type: ts("md", "lg"), default: "md" },
    { name: "width", type: ts("1/2", "3/4", "full"), default: "3/4" },
  ], [use("Box", {
    props: { Class: cn(cond(eq(ref("size"), "lg"), ROLE["heading-lg"], ROLE.heading), cond(eq(ref("width"), "1/2"), "w-1/2", cond(eq(ref("width"), "full"), "w-full", "w-3/4"))) },
    attrs: hooks("heading", cond(eq(ref("size"), "lg"), "heading-lg", "heading")),
  })]),
  ShapeText: shape("shape-text", "ShapeText", "The bars of one text (wireframe): muted, h-2, one to three lines, the last one shorter; align places the bars (start, center, end: logical).", [
    { name: "lines", type: ts("1", "2", "3"), default: "2" },
    { name: "align", type: ts("start", "center", "end"), default: "start" },
  ], [use("Box", { props: { Class: cn("flex w-full flex-col gap-2", cond(eq(ref("align"), "center"), ALIGN.center, cond(eq(ref("align"), "end"), ALIGN.end, ALIGN.start))) }, attrs: hooks("text", "text") },
    when(ne(ref("lines"), "1"), [bar("w-full")]),
    when(eq(ref("lines"), "3"), [bar("w-full")]),
    bar("w-2/3"))]),
  ShapeBadge: shape("shape-badge", "ShapeBadge", "The accent pill of a badge (wireframe); its corner follows --radius-badge.", [],
    [use("Box", { props: { Class: `${ROLE.badge} w-16 shrink-0` }, attrs: hooks("badge", "badge", "badge") })]),
  ShapeCta: shape("shape-cta", "ShapeCta", "The bar of an action (wireframe): h-10 w-24, primary (the first action) or secondary (the second); geometry only, not a link.", [
    { name: "tone", type: ts("primary", "secondary"), default: "primary" },
  ], [use("Box", {
    props: { Class: cn(cond(eq(ref("tone"), "secondary"), ROLE["cta-secondary"], ROLE["cta-primary"]), "w-24 shrink-0") },
    attrs: hooks("cta", cond(eq(ref("tone"), "secondary"), "cta-secondary", "cta-primary"), "button"),
  })]),
  ShapeMedia: shape("shape-media", "ShapeMedia", "The frame of a picture (wireframe): muted, full width, at the ratio of the picture (aspect-*); fill half: the picture fills its half of a split to the edge (no rounding, the full height of the row from md up).", [
    { name: "aspect", type: ts("aspect-square", "aspect-4/3", "aspect-3/4", "aspect-21/9", "aspect-video"), default: "aspect-4/3" },
    { name: "fill", type: ts("frame", "half"), default: "frame" },
  ], [use("Box", { props: { Class: cn(cond(eq(ref("fill"), "half"), `${MEDIA_HALF} w-full`, `${ROLE.media} w-full`), ref("aspect"), cond(eq(ref("fill"), "half"), "md:aspect-auto md:h-full", "")) }, attrs: hooks("media", "media", "media-frame") })]),
  ShapeAvatar: shape("shape-avatar", "ShapeAvatar", "The disc of a portrait (wireframe): accent, h-16 w-16, round.", [],
    [use("Box", { props: { Class: `${ROLE.avatar} shrink-0` }, attrs: hooks("avatar", "avatar") })]),
} satisfies Record<string, OrganismSpec>;
export type ShapeName = keyof typeof SHAPE;
export const shapes: OrganismSpec[] = Object.values(SHAPE);
