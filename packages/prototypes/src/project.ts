// The projection of a clean organism (page-only, packages/compose-gen) onto its prototype: a wireframe of rectangles only. Every
// place (a node that draws a field of the content model) becomes its shape (shapes.ts) with data-place / data-field for the
// builder's inspector; a branch that waits for content is drawn anyway; a loop over a list field is unrolled into WIRE_ITEMS
// placeholders (data-field /members/0/title …). The layout compositions (Block, Container, Stack, List, …) are lowered onto the kit
// Box with plain layout classes (LAYOUT below): no composition, no recipe, no state or effect class ships with a prototype.
// The props are the layout axes of the block and the padding setting: a wireframe takes no content. IR to IR.
import { cn, cond, eq, organism, ref } from "../../compose-gen/screens/src/build";
import { isGroup, isOp, isRef, type OrganismSpec, type Value, type ViewNode } from "../../compose-gen/screens/src/ir";
import type { BlockSpec } from "../../compose-gen/screens/src/ir";
import type { ModelField, ModelSpec } from "../../compose-gen/model/src/index";
import { SHAPE, type ShapeName } from "./shapes";

/** how many members a wireframe draws for a list field */
export const WIRE_ITEMS = 3;
export const MODES = ["wireframe"] as const;
export type PlaceKind = "heading" | "text" | "badge" | "action" | "media";

/** a place: one region of the block that draws fields of the model; `fields` are JSON pointers (`*` is an index of a list) */
export interface Place { place: string; kind: PlaceKind; fields: string[]; list?: string }

const KIND: Record<string, PlaceKind> = { Title: "heading", Text: "text", Badge: "badge", Button: "action", LinkButton: "action", MediaFrame: "media" };
/** the props of the prototype: the layout axes of the block and these settings */
export const PROTOTYPE_SETTINGS = ["padding"] as const;

/** the layout compositions a wireframe may use, lowered onto the kit Box: the tag and the classes of each (no recipe) */
type Lowering = { tag?: string; tagProp?: string; base: string; attrs?: Record<string, string>; keys?: Record<string, (v: string) => string> };
const ALIGN: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const JUSTIFY: Record<string, string> = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" };
const LAYOUT: Record<string, Lowering> = {
  Box: { tagProp: "Tag", base: "" },
  Block: { tagProp: "Tag", base: "" },
  Container: { tagProp: "Tag", base: "" },
  Stack: { tagProp: "Tag", base: "flex flex-col", keys: { Gap: (v) => `gap-${v}`, Align: (v) => ALIGN[v] ?? fail(`Stack Align ${v}`), Justify: (v) => JUSTIFY[v] ?? fail(`Stack Justify ${v}`) } },
  List: { tagProp: "Tag", tag: "ul", base: "" },
  ListItem: { tag: "li", base: "" },
  // a card as a plain bordered surface (a border token, no inset ring, no shadow)
  Card: { tag: "div", base: "bg-card border border-border rounded", attrs: { "data-slot": "card", "data-role": "surface" } },
};
/** classes the wireframe drops: list-none is the preflight of Tailwind v4 already (ul, ol: list-style none), and the li are flex */
const PREFLIGHT = new Set(["list-none"]);
const dropPreflight = (v: Value): Value =>
  typeof v === "string" ? v.split(/\s+/).filter((t) => t && !PREFLIGHT.has(t)).join(" ")
  : isOp(v) && (v.op === "cn" || v.op === "cond") ? { ...v, args: v.args.map((a, i) => (v.op === "cond" && i === 0 ? a : dropPreflight(a))) }
  : v;
function fail(msg: string): never { throw new Error(`prototypes: ${msg}`); }

/** the refs of a value, deep */
export function refsOf(v: Value | undefined, out: string[] = []): string[] {
  if (v === undefined || v === null || typeof v !== "object") return out;
  if (isRef(v)) out.push(v.$);
  else if (isOp(v)) v.args.forEach((a) => refsOf(a, out));
  else if (isGroup(v)) Object.values(v).forEach((x) => refsOf(x, out));
  return out;
}

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
  constructor(readonly model: ModelSpec, readonly props: Set<string>) {}

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
      const fields = [primary, ...(kind === "action" ? this.fieldsOf(n.props?.["Href"], loops) : [])];
      const place: Place = { place: kind === "action" ? "action" : prefixed(primary), kind, fields: fields.map((f) => f.pointer), ...(primary.list ? { list: primary.list } : {}) };
      this.add(place);
      const size = n.props?.["Size"];
      const big = typeof size === "string" && ["2xl", "3xl", "4xl", "5xl"].includes(size);
      const pick: Record<Exclude<PlaceKind, "media">, [ShapeName, Record<string, Value>]> = {
        heading: ["ShapeHeading", { size: big ? "lg" : "md", width: primary.list ? "1/2" : "3/4" }],
        text: ["ShapeText", { lines: primary.list ? "1" : "2" }],
        badge: ["ShapeBadge", {}],
        action: ["ShapeCta", {}],
      };
      const [name, props] = pick[kind as Exclude<PlaceKind, "media">];
      return organism(SHAPE[name].name, { ...props, place: place.place, field: fields.map((f) => f.value).join(" ") });
    }
    if ("organism" in n && n.organism === "MediaFrame") {
      const props = n.props ?? {};
      const src = this.fieldsOf(props["src"], loops)[0];
      if (!src) return undefined;
      const more = [...this.fieldsOf(props["alt"], loops), ...this.fieldsOf(props["darkSrc"], loops)].filter((f) => f.field !== "title" && f.pointer !== src.pointer);
      const all = [src, ...more].filter((f, i, a) => a.findIndex((x) => x.pointer === f.pointer) === i);
      const place: Place = { place: src.list ? prefixed(src) : "media", kind: "media", fields: all.map((f) => f.pointer), ...(src.list ? { list: src.list } : {}) };
      this.add(place);
      const field = all.map((f) => f.value).join(" ");
      return src.list
        ? organism(SHAPE.ShapeAvatar.name, { place: place.place, field })
        : organism(SHAPE.ShapeMedia.name, { aspect: ratioClass(props["ratio"]), place: place.place, field });
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
      return Array.from({ length: WIRE_ITEMS }, (_, i) => this.nodes(n.do, [...loops, { as: n.as, index: i, list: listField, item: f.item!.fields }])).flat();
    }
    if ("use" in n) return [this.lower(n, loops)];
    if ("text" in n || "html" in n) fail("a text outside a place");
    return fail(`cannot draw ${JSON.stringify(n).slice(0, 80)} in a wireframe`);
  }

  /** a layout composition onto the kit Box: its tag, the classes of its keys, the classes of the spec; nothing else */
  lower(n: Extract<ViewNode, { use: string }>, loops: Loop[]): ViewNode {
    const l = LAYOUT[n.use] ?? fail(`${n.use} is not a layout composition (only ${Object.keys(LAYOUT).join(", ")})`);
    const props = n.props ?? {};
    const classes: Value[] = l.base ? [l.base] : [];
    for (const [k, v] of Object.entries(props)) {
      if (k === "Class") { this.check(v); classes.push(dropPreflight(v)); continue; }
      if (k === l.tagProp) continue;
      const key = l.keys?.[k] ?? fail(`${n.use} prop ${k} has no wireframe lowering`);
      if (typeof v !== "string") fail(`${n.use} ${k} is not a literal`);
      classes.push(key(v));
    }
    const tag = l.tagProp && props[l.tagProp] !== undefined ? props[l.tagProp]! : l.tag;
    const attrs = { ...(n.attrs ?? {}), ...(l.attrs ?? {}) };
    delete attrs["aria-labelledby"]; delete attrs["aria-label"]; // the heading is a shape: a wireframe names no landmark
    for (const v of Object.values(attrs)) this.check(v);
    const cls: Value | undefined = classes.length === 0 ? undefined : classes.length === 1 ? classes[0] : cn(...classes);
    return {
      use: "Box",
      props: { ...(tag !== undefined ? { Tag: tag } : {}), ...(cls !== undefined ? { Class: cls } : {}) },
      ...(Object.keys(attrs).length ? { attrs } : {}),
      ...(n.children ? { children: this.nodes(n.children, loops) } : {}),
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
  const keep = new Set<string>([...Object.keys(block.axes), ...PROTOTYPE_SETTINGS]);
  const pr = new Projector(model, keep);
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
