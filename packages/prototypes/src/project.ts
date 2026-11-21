// The projection of a clean organism (page-only, packages/compose-gen) onto its prototype: a wireframe of rectangles only. Every
// place (a node that draws a field of the content model) becomes its shape (shapes.ts) with data-place / data-field for the
// builder's inspector; a branch that waits for content is drawn anyway; a loop over a list field is unrolled into one
// placeholder per column of the variant (countAxis; else WIRE_ITEMS) (data-field /members/0/title …). The layout compositions (Block, Container, Stack, List, …) are lowered onto the kit
// Box with plain layout classes (LAYOUT below): no composition, no recipe, no state or effect class ships with a prototype.
// The props are the layout axes of the block and the padding setting: a wireframe takes no content. IR to IR.
import { cn, cond, eq, or, organism, ref, when } from "../../compose-gen/screens/src/build";
import { isGroup, isOp, isRef, type OrganismSpec, type Value, type ViewNode } from "../../compose-gen/screens/src/ir";
import type { BlockSpec } from "../../compose-gen/screens/src/ir";
import type { ModelField, ModelSpec } from "../../compose-gen/model/src/index";
import { ALIGN, ROLE, SHAPE, type ShapeName } from "./shapes";

/** how many members a wireframe draws for a list field when the block has no column count */
export const WIRE_ITEMS = 3;
/**
 * The column count of a block: its one axis whose every value is a whole number (team-simple `cols`: 2, 3, 4). A wireframe draws
 * as many members as the variant has columns, so the grid is full (cols4: 4); a block without one draws WIRE_ITEMS. Read from the
 * axes only: no block is named.
 */
export function countAxis(axes: Record<string, string[]>): string | undefined {
  const counts = Object.entries(axes).filter(([, vs]) => vs.length > 0 && vs.every((v) => /^[1-9][0-9]?$/.test(v)));
  return counts.length === 1 ? counts[0]![0] : undefined;
}
/** the members a wireframe draws in one variant (its axis values): the column count, else WIRE_ITEMS */
export function wireItems(axes: Record<string, string[]>, values: Record<string, string>): number {
  const axis = countAxis(axes);
  return axis && values[axis] ? Number(values[axis]) : WIRE_ITEMS;
}
export const MODES = ["wireframe"] as const;
export type PlaceKind = "heading" | "text" | "badge" | "action" | "media";

/** a place: one region of the block that draws fields of the model; `fields` are JSON pointers (`*` is an index of a list) */
export interface Place { place: string; kind: PlaceKind; fields: string[]; list?: string }

const KIND: Record<string, PlaceKind> = { Title: "heading", Text: "text", Badge: "badge", Button: "action", LinkButton: "action", MediaFrame: "media" };
/** the props of the prototype: the layout axes of the block and these settings */
export const PROTOTYPE_SETTINGS = ["padding", "align"] as const;

/** the layout compositions a wireframe may use, lowered onto the kit Box: the tag and the classes of each (no recipe) */
type Lowering = { tag?: string; tagProp?: string; base: string; attrs?: Record<string, string>; keys?: Record<string, (v: string) => string>; drop?: string[] };
/** the Stack Align (shapes.ts) / Justify classes (logical: flex start / end follow the writing direction); shipped in out/classes.json */
export { ALIGN };
export const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const satisfies Record<string, string>;
/**
 * The section padding presets (the `padding` setting) and the container of the simple line, as the clean organisms write them
 * (specs/organisms/*-simple.json; test/prototypes.test.ts holds both to these values). Every step a multiple of 8px.
 */
export const PADDING = { compact: "py-8 lg:py-16", standard: "py-16 lg:py-32", spacious: "py-24 lg:py-40" } as const;
export const CONTAINER = "mx-auto w-full max-w-6xl px-4";
const LAYOUT: Record<string, Lowering> = {
  Box: { tagProp: "Tag", base: "" },
  Block: { tagProp: "Tag", base: "" },
  Container: { tagProp: "Tag", base: "" },
  // w-full: a wireframe has no intrinsic width (its shapes are fractions: w-1/2, w-3/4), so a Stack the clean block lets shrink to
  // its content (items-start / self-center in a flex column: the member copy of team-simple, a centered header) spans its parent
  // instead of collapsing to 0; max-w-* of the spec still caps it. A Stack in a grid cell or a stretched column is unchanged.
  Stack: { tagProp: "Tag", base: "flex w-full flex-col", keys: { Gap: (v) => `gap-${v}`, Align: (v) => (ALIGN as Record<string, string>)[v] ?? fail(`Stack Align ${v}`), Justify: (v) => (JUSTIFY as Record<string, string>)[v] ?? fail(`Stack Justify ${v}`) } },
  // a row of actions (the hero's primary and secondary links): the Group recipe base, its gap / align / justify as plain classes
  Group: { tagProp: "Tag", base: "flex min-w-0", keys: { Gap: (v) => `gap-${v}`, Align: (v) => (ALIGN as Record<string, string>)[v] ?? fail(`Group Align ${v}`), Justify: (v) => (JUSTIFY as Record<string, string>)[v] ?? fail(`Group Justify ${v}`) } },
  List: { tagProp: "Tag", tag: "ul", base: "" },
  ListItem: { tag: "li", base: "" },
  // a link around a place (the title of a story): a plain box, the address is content (a wireframe has no link)
  Link: { tag: "div", base: "", drop: ["Href", "Variant", "Size"] },
  LinkPlain: { tag: "div", base: "", drop: ["Href"] },
  // a card as a plain bordered surface (a border token, no inset ring, no shadow)
  Card: { tag: "div", base: ROLE.surface, attrs: { "data-slot": "card", "data-role": "surface" } },
};
/** classes the wireframe drops: list-none is the preflight of Tailwind v4 already (ul, ol: list-style none), and the li are flex;
 *  an interaction state (hover:, focus:) of a plain link: a wireframe has no link */
const PREFLIGHT = new Set(["list-none"]);
const STATE = /^(?:hover|focus):/;
const dropPreflight = (v: Value): Value =>
  typeof v === "string" ? v.split(/\s+/).filter((t) => t && !PREFLIGHT.has(t) && !STATE.test(t)).join(" ")
  : isOp(v) && (v.op === "cn" || v.op === "cond") ? { ...v, args: v.args.map((a, i) => (v.op === "cond" && i === 0 ? a : dropPreflight(a))) }
  : v;
function fail(msg: string): never { throw new Error(`prototypes: ${msg}`); }
/** a key value that is a literal or a cond of literals (`Align: cond(eq(align, "center"), "center", "start")`) as its classes */
function literals(v: Value, key: (v: string) => string, what: string): Value {
  if (typeof v === "string") return key(v);
  if (isOp(v) && v.op === "cond") return cond(v.args[0]!, literals(v.args[1]!, key, what), literals(v.args[2]!, key, what));
  return fail(`${what} is not a literal or a cond of literals`);
}

/** the refs of a value, deep */
export function refsOf(v: Value | undefined, out: string[] = []): string[] {
  if (v === undefined || v === null || typeof v !== "object") return out;
  if (isRef(v)) out.push(v.$);
  else if (isOp(v)) v.args.forEach((a) => refsOf(a, out));
  else if (isGroup(v)) Object.values(v).forEach((x) => refsOf(x, out));
  return out;
}

/** a MediaFrame that fills its half of a split (rounded-none and the full height from md up: md:h-full) */
const fillsHalf = (v: Value | undefined): boolean => typeof v === "string" && /(^|\s)rounded-none(\s|$)/.test(v) && /(^|\s)md:h-full(\s|$)/.test(v);
/** the string literals of a class value (a literal, or the literals of a cn / cond) */
const classText = (v: Value | undefined): string =>
  typeof v === "string" ? v : isOp(v) ? v.args.map((a, i) => (v.op === "cond" && i === 0 ? "" : classText(a))).join(" ") : "";
/**
 * Layout classes of a MediaFrame the wireframe must keep.
 * On ShapeMedia (the same node as aspect, usually the grid item): order-*, max-w- / min-w-, min-h- / max-h- / h-,
 * md:aspect-auto, mx-auto. w-full is already on ShapeMedia (do not lift it: a second copy makes join-cn and
 * tailwind-merge disagree). fill:half already owns md:aspect-auto and md:h-full.
 * A same-breakpoint width override (w-1/4, not sm:w-*): a Box wrapper, so it does not fight ShapeMedia's w-full.
 */
const MEDIA_CLASS = /^(?:(?:[a-z]+:)+w-(?!full).+|(?:[a-z]+:)*(?:order-.+|max-w-.+|min-w-.+|min-h-.+|max-h-.+|h-.+|aspect-auto|mx-auto|ms-auto|me-auto))$/;
const WIDTH_WRAP = /^w-(?!full(?:$|-))/; // w-1/4, not w-full, not sm:w-1/3 (a prefix stays on ShapeMedia: no conflict)
const HALF_OWNED = /^(?:[a-z]+:)*(?:aspect-auto|h-full)$/;
const emptyClass = (v: Value): boolean =>
  v === undefined || v === "" || (typeof v === "string" ? v.trim() === ""
    : isOp(v) && v.op === "cn" ? v.args.every(emptyClass)
    : isOp(v) && v.op === "cond" ? emptyClass(v.args[1]!) && emptyClass(v.args[2]!)
    : false);
function filterClass(v: Value, keep: (t: string) => boolean): Value {
  if (typeof v === "string") return v.split(/\s+/).filter(keep).join(" ");
  if (isOp(v) && v.op === "cond") return cond(v.args[0]!, filterClass(v.args[1]!, keep), filterClass(v.args[2]!, keep));
  if (isOp(v) && v.op === "cn") {
    const args = v.args.map((a) => filterClass(a, keep)).filter((a) => !emptyClass(a));
    return args.length === 0 ? "" : args.length === 1 ? args[0]! : cn(...args);
  }
  return fail(`MediaFrame className ${JSON.stringify(v)} is not a literal or a cond of literals`);
}
const asClass = (v: Value): Value | undefined => (emptyClass(v) ? undefined : v);
function mediaParts(v: Value | undefined, half: boolean): { wrap?: Value; className?: Value } {
  if (v === undefined) return {};
  const keep = (t: string, re: RegExp) => !!t && re.test(t) && !(half && HALF_OWNED.test(t));
  return { wrap: asClass(filterClass(v, (t) => keep(t, WIDTH_WRAP))), className: asClass(filterClass(v, (t) => keep(t, MEDIA_CLASS))) };
}
/** a picture of a list item drawn as the avatar disc: a portrait or an icon (rounded-full) or a small fixed thumbnail (size-*) */
const isDisc = (v: Value | undefined): boolean => /(^|\s)(rounded-full|size-\d+)(\s|$)/.test(classText(v));
/** a ratio of MediaFrame (a literal or a cond of literals) as its aspect class */
const RATIO: Record<string, string> = { "1/1": "aspect-square", "4/3": "aspect-4/3", "3/4": "aspect-3/4", "21/9": "aspect-21/9", "16/9": "aspect-video" };
function ratioClass(v: Value | undefined): Value {
  if (v === undefined) return RATIO["16/9"]!;
  if (typeof v === "string") return RATIO[v] ?? fail(`MediaFrame ratio ${v}`);
  if (isOp(v) && v.op === "cond") return cond(v.args[0]!, ratioClass(v.args[1]), ratioClass(v.args[2]));
  return fail(`MediaFrame ratio ${JSON.stringify(v)} is not a literal`);
}

type Loop = { as: string; index: number; list: string; item: Record<string, ModelField> };
type Field = { field: string; pointer: string; value: string; list?: string };

class Projector {
  places = new Map<string, Place>();
  /** the addresses of the enclosing Link compositions: a place inside a link carries the address too */
  links: Field[][] = [];
  /** the alt text of a picture read from a title field joins the picture place only when no other place draws that field
   * (logos-simple: the name is the alt only); found by a first pass (project) */
  altTitles = new Set<string>();
  /** the clean organism declares the align setting with the values of ShapeText align */
  alignable: boolean;
  /** the derived values of the clean organism, inlined: a prototype has no derived values (`derived: []`) */
  derived: Map<string, Value>;
  constructor(readonly model: ModelSpec, readonly props: Set<string>, clean?: OrganismSpec, readonly axes: Record<string, string[]> = {}) {
    this.alignable = !!clean?.props.some((p) => p.name === "align");
    this.derived = new Map((clean?.derived ?? []).map((d) => [d.name, d.value]));
  }
  /** a value with every ref to a derived value replaced by that value (deep) */
  inline(v: Value): Value {
    if (v === undefined || v === null || typeof v !== "object") return v;
    if (isRef(v)) return this.derived.has(v.$) ? this.inline(this.derived.get(v.$)!) : v;
    if (isOp(v)) return { ...v, args: v.args.map((a) => this.inline(a)) };
    if (isGroup(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, this.inline(x as Value)])) as Value;
    return v;
  }

  /** a ref as a model field: a top field (`title`) or a field of the item of an unrolled loop (`m.title`, index i) */
  field(path: string, loops: Loop[]): Field | undefined {
    const [head, rest] = path.includes(".") ? [path.slice(0, path.indexOf(".")), path.slice(path.indexOf(".") + 1)] : [path, ""];
    const loop = loops.find((l) => l.as === head);
    if (loop && rest && rest in loop.item) return { field: rest, list: loop.list, pointer: `/${loop.list}/*/${rest}`, value: `/${loop.list}/${loop.index}/${rest}` };
    const f = this.model.fields[path];
    if (!rest && f && f.type !== "list") return { field: path, pointer: `/${path}`, value: `/${path}` };
    return undefined;
  }
  fieldsOf(v: Value | undefined, loops: Loop[]): Field[] {
    return refsOf(v).map((r) => this.field(r, loops)).filter((f): f is Field => !!f);
  }
  readsContent(v: Value | undefined, loops: Loop[]): boolean {
    return refsOf(v).some((r) => this.field(r, loops) || this.model.fields[r]?.type === "list" || loops.some((l) => r === l.as || r.startsWith(`${l.as}.`)));
  }
  add(p: Place): void {
    const had = this.places.get(p.place);
    this.places.set(p.place, had ? { ...had, fields: [...new Set([...had.fields, ...p.fields])] } : p);
  }

  /** the shape of a node that draws a field, and its place */
  placeOf(n: ViewNode, loops: Loop[]): ViewNode | undefined {
    if ("use" in n && KIND[n.use]) {
      const primary = (n.children ?? []).flatMap((c) => ("text" in c ? this.fieldsOf(c.text, loops) : []))[0];
      if (!primary) return undefined;
      const kind = KIND[n.use]!;
      const fields = [primary, ...(kind === "action" ? this.fieldsOf(n.props?.["Href"], loops) : []), ...this.links.flat()];
      // an action is named by its label without "Label": actionLabel -> action, secondaryActionLabel -> secondaryAction
      const place: Place = { place: kind === "action" ? prefixed(primary).replace(/Label$/, "") : prefixed(primary), kind, fields: fields.map((f) => f.pointer), ...(primary.list ? { list: primary.list } : {}) };
      this.add(place);
      const size = n.props?.["Size"];
      const big = typeof size === "string" && ["2xl", "3xl", "4xl", "5xl"].includes(size);
      const pick: Record<Exclude<PlaceKind, "media">, [ShapeName, Record<string, Value>]> = {
        heading: ["ShapeHeading", { size: big ? "lg" : "md", width: primary.list ? "1/2" : "3/4" }],
        // the text bars follow the `align` setting of the block (items-* inside the shape)
        text: ["ShapeText", { lines: primary.list ? "1" : "2", ...(this.props.has("align") && this.alignable ? { align: ref("align") } : {}) }],
        badge: ["ShapeBadge", {}],
        // the tone follows the button variant of the clean block: secondary -> the secondary bar, anything else the primary one
        action: ["ShapeCta", n.props?.["Variant"] === "secondary" ? { tone: "secondary" } : {}],
      };
      const [name, props] = pick[kind as Exclude<PlaceKind, "media">];
      return organism(SHAPE[name].name, { ...props, place: place.place, field: fields.map((f) => f.value).join(" ") });
    }
    if ("organism" in n && n.organism === "MediaFrame") {
      // ratio and className may be derived values of the clean organism: inlined (a prototype has no derived values)
      const props = Object.fromEntries(Object.entries(n.props ?? {}).map(([k, v]) => [k, k === "ratio" || k === "className" ? this.inline(v) : v]));
      const src = this.fieldsOf(props["src"], loops)[0];
      if (!src) return undefined;
      const more = [...this.fieldsOf(props["alt"], loops), ...this.fieldsOf(props["darkSrc"], loops)].filter((f) => (f.field !== "title" || this.altTitles.has(f.pointer)) && f.pointer !== src.pointer);
      const all = [src, ...more].filter((f, i, a) => a.findIndex((x) => x.pointer === f.pointer) === i);
      // a picture outside a list: "media" for the main image, its own field name for another one (the portrait of an author)
      const place: Place = { place: src.list ? prefixed(src) : src.field === "image" ? "media" : src.field, kind: "media", fields: all.map((f) => f.pointer), ...(src.list ? { list: src.list } : {}) };
      this.add(place);
      const field = all.map((f) => f.value).join(" ");
      if (src.list && isDisc(props["className"])) return organism(SHAPE.ShapeAvatar.name, { place: place.place, field });
      // layout classes: order-first / portrait max-w-sm / md:aspect-auto / md:min-h-128 on ShapeMedia (same node as aspect,
      // the grid item). A same-breakpoint width override (w-1/4) is a Box around it, so it does not fight w-full.
      // fill:half is unchanged.
      const half = fillsHalf(props["className"]);
      const { wrap, className: layout } = mediaParts(props["className"], half);
      if (wrap) this.check(wrap);
      if (layout) this.check(layout);
      const media = organism(SHAPE.ShapeMedia.name, { aspect: ratioClass(props["ratio"]), ...(half ? { fill: "half" } : {}), ...(layout ? { className: layout } : {}), place: place.place, field });
      return wrap ? { use: "Box", props: { Class: wrap }, children: [media] } : media;
    }
    return undefined;
  }

  nodes(ns: ViewNode[], loops: Loop[]): ViewNode[] {
    return ns.flatMap((n) => this.node(n, loops));
  }

  node(n: ViewNode, loops: Loop[]): ViewNode[] {
    const shape = this.placeOf(n, loops);
    if (shape) return [shape];
    if ("when" in n) {
      // a branch that waits for content is drawn in the wireframe anyway; a layout branch (an axis) stays
      if (this.readsContent(n.when, loops)) return this.nodes(n.then, loops);
      this.check(n.when);
      return [{ ...n, then: this.nodes(n.then, loops), ...(n.else ? { else: this.nodes(n.else, loops) } : {}) }];
    }
    if ("each" in n) {
      const listField = refsOf(n.each).find((r) => this.model.fields[r]?.type === "list") ?? fail(`a loop over ${JSON.stringify(n.each)} is not a list field`);
      const f = this.model.fields[listField]!;
      const draw = (i: number) => this.nodes(n.do, [...loops, { as: n.as, index: i, list: listField, item: f.item!.fields }]);
      const axis = countAxis(this.axes);
      if (!axis) return Array.from({ length: WIRE_ITEMS }, (_, i) => draw(i)).flat();
      // one member per column of the variant: the members past the smallest count are drawn when the column count reaches them
      const counts = this.axes[axis]!.map(Number);
      const least = Math.min(...counts);
      return Array.from({ length: Math.max(...counts) }, (_, i) => {
        if (i < least) return draw(i);
        const more = this.axes[axis]!.filter((v) => Number(v) > i).map((v) => eq(ref(axis), v));
        return [when(more.length === 1 ? more[0]! : or(...more), draw(i))];
      }).flat();
    }
    if ("use" in n) return [this.lower(n, loops)];
    if ("text" in n || "html" in n) fail("a text outside a place");
    return fail(`cannot draw ${JSON.stringify(n).slice(0, 80)} in a wireframe`);
  }

  /** a layout composition onto the kit Box: its tag, the classes of its keys, the classes of the spec; nothing else */
  lower(n: Extract<ViewNode, { use: string }>, loops: Loop[]): ViewNode {
    const l = LAYOUT[n.use] ?? fail(`${n.use} is not a layout composition (only ${Object.keys(LAYOUT).join(", ")})`);
    const props = Object.fromEntries(Object.entries(n.props ?? {}).map(([k, v]) => [k, this.inline(v)]));
    const classes: Value[] = l.base ? [l.base] : [];
    for (const [k, v] of Object.entries(props)) {
      if (k === "Class") { this.check(v); classes.push(dropPreflight(v)); continue; }
      if (k === l.tagProp || l.drop?.includes(k)) continue;
      const key = l.keys?.[k] ?? fail(`${n.use} prop ${k} has no wireframe lowering`);
      this.check(v);
      classes.push(literals(v, key, `${n.use} ${k}`));
    }
    const tag = l.tagProp && props[l.tagProp] !== undefined ? props[l.tagProp]! : l.tag;
    const attrs = { ...(n.attrs ?? {}), ...(l.attrs ?? {}) };
    delete attrs["aria-labelledby"]; delete attrs["aria-label"]; // the heading is a shape: a wireframe names no landmark
    for (const v of Object.values(attrs)) this.check(v);
    const cls: Value | undefined = classes.length === 0 ? undefined : classes.length === 1 ? classes[0] : cn(...classes);
    if (n.use === "Link" || n.use === "LinkPlain") this.links.push(this.fieldsOf(n.props?.["Href"], loops));
    const children = n.children ? this.nodes(n.children, loops) : undefined;
    if (n.use === "Link" || n.use === "LinkPlain") this.links.pop();
    return {
      use: "Box",
      props: { ...(tag !== undefined ? { Tag: tag } : {}), ...(cls !== undefined ? { Class: cls } : {}) },
      ...(Object.keys(attrs).length ? { attrs } : {}),
      ...(children ? { children } : {}),
    };
  }

  /** a layout value may read only the props of the prototype (axes, padding) */
  check(v: Value | undefined): void {
    for (const r of refsOf(v)) if (!this.props.has(r)) fail(`a layout value reads ${r}, not an axis or a setting of the prototype`);
  }
}

const prefixed = (f: Field): string => (f.list ? `${f.list}.${f.field}` : f.field);

/** the prototype of a clean organism for its block and model, and its places */
export function project(clean: OrganismSpec, block: BlockSpec, model: ModelSpec): { organism: OrganismSpec; places: Place[] } {
  const keep = new Set<string>([...Object.keys(block.axes), ...PROTOTYPE_SETTINGS.filter((s) => clean.props.some((p) => p.name === s))]);
  // a first pass finds the title fields no place draws; the second draws them as the alt text of their picture
  const first = new Projector(model, keep, clean, block.axes);
  first.nodes(clean.view, []);
  const placed = new Set([...first.places.values()].flatMap((p) => p.fields));
  const pr = new Projector(model, keep, clean, block.axes);
  const listTitles = Object.entries(model.fields).flatMap(([k, f]) => (f.type === "list" && f.item?.fields["title"] ? [`/${k}/*/title`] : []));
  pr.altTitles = new Set(listTitles.filter((x) => !placed.has(x)));
  const view = pr.nodes(clean.view, []);
  const organismSpec: OrganismSpec = {
    ...clean,
    docs: `${clean.docs} Prototype (packages/prototypes): the wireframe, rectangles only; each shape carries data-place and data-field.`,
    records: {},
    props: clean.props.filter((p) => keep.has(p.name)),
    derived: [],
    view,
  };
  return { organism: organismSpec, places: [...pr.places.values()] };
}
