// The projection of a clean organism (page-only, packages/compose-gen) onto its prototype: the same view with a prop `mode`
// ("wireframe" | "page", default wireframe). Every place (a node that draws a field of the content model) becomes
// `when(wire, [shape], [the node + data-place/data-field])`; a branch that waits for content is drawn in the wireframe anyway; a
// loop over a list field draws WIRE_ITEMS placeholders in the wireframe. In page mode, without data-place/data-field, the DOM
// equals the clean block (test/prototypes.test.ts). IR to IR: the emitters of compose-gen print the result for any runtime.
import { cond, eq, list, or, organism, ref, tpl, undef, when } from "../../compose-gen/screens/src/build";
import { isGroup, isOp, isRef, type OrganismSpec, type Value, type ViewNode } from "../../compose-gen/screens/src/ir";
import type { ModelField, ModelSpec } from "../../compose-gen/model/src/index";
import { SHAPE, type ShapeName } from "./shapes";

/** how many members a wireframe draws for a list field */
export const WIRE_ITEMS = 3;
export const MODES = ["wireframe", "page"] as const;
export type PlaceKind = "heading" | "text" | "badge" | "action" | "media";

/** a place: one region of the block that draws fields of the model; `fields` are JSON pointers (`*` is an index of a list) */
export interface Place { place: string; kind: PlaceKind; fields: string[]; list?: string }

/** the organisms a place of a nested organism is drawn with: a copy of the organism that carries the place on its root */
export const placeName = (name: string): string => `${name}Place`;

const WIRE = ref("wire");
const KIND: Record<string, PlaceKind> = { Title: "heading", Text: "text", Badge: "badge", Button: "action", LinkButton: "action", MediaFrame: "media" };

/** the refs of a value, deep */
export function refsOf(v: Value | undefined, out: string[] = []): string[] {
  if (v === undefined || v === null || typeof v !== "object") return out;
  if (isRef(v)) out.push(v.$);
  else if (isOp(v)) v.args.forEach((a) => refsOf(a, out));
  else if (isGroup(v)) Object.values(v).forEach((x) => refsOf(x, out));
  return out;
}

type Loop = { as: string; index: string; list: string; item: Record<string, ModelField> };
type Field = { field: string; pointer: string; value: Value; list?: string };

class Projector {
  places = new Map<string, Place>();
  /** the nested organisms a place was drawn with (MediaFrame -> MediaFramePlace) */
  nested = new Set<string>();
  constructor(readonly model: ModelSpec) {}

  /** a ref as a model field: a top field (`title`) or a field of the item of a loop over a list field (`m.title`) */
  field(path: string, loops: Loop[]): Field | undefined {
    const [head, rest] = path.includes(".") ? [path.slice(0, path.indexOf(".")), path.slice(path.indexOf(".") + 1)] : [path, ""];
    const loop = loops.find((l) => l.as === head);
    if (loop && rest && rest in loop.item) return { field: rest, list: loop.list, pointer: `/${loop.list}/*/${rest}`, value: tpl(`/${loop.list}/{0}/${rest}`, ref(loop.index)) };
    const f = this.model.fields[path];
    if (!rest && f && f.type !== "list") return { field: path, pointer: `/${path}`, value: `/${path}` };
    return undefined;
  }
  fieldsOf(v: Value | undefined, loops: Loop[]): Field[] {
    return refsOf(v).map((r) => this.field(r, loops)).filter((f): f is Field => !!f);
  }
  readsContent(v: Value | undefined, loops: Loop[]): boolean {
    return refsOf(v).some((r) => this.field(r, loops) || this.model.fields[r]?.type === "list");
  }
  add(p: Place): void {
    const had = this.places.get(p.place);
    this.places.set(p.place, had ? { ...had, fields: [...new Set([...had.fields, ...p.fields])] } : p);
  }

  /** the place of a node, if it draws a field: the primary field (the text, the address of a picture) names it */
  placeOf(n: ViewNode, loops: Loop[]): { place: Place; primary: Field; shape: ViewNode; page: ViewNode } | undefined {
    if ("use" in n && KIND[n.use]) {
      const textRefs = (n.children ?? []).flatMap((c) => ("text" in c ? this.fieldsOf(c.text, loops) : []));
      const primary = textRefs[0];
      if (!primary) return undefined;
      const kind = KIND[n.use]!;
      const fields = [primary, ...(kind === "action" ? this.fieldsOf(n.props?.["Href"], loops) : [])];
      const place: Place = { place: kind === "action" ? "action" : prefixed(primary), kind, fields: fields.map((f) => f.pointer), ...(primary.list ? { list: primary.list } : {}) };
      const attrs = { ...(n.attrs ?? {}), "data-place": place.place, "data-field": primary.value };
      return { place, primary, shape: this.shape(kind, n, primary, place.place), page: { ...n, attrs } };
    }
    if ("organism" in n && n.organism === "MediaFrame") {
      const props = n.props ?? {};
      const src = this.fieldsOf(props["src"], loops)[0];
      if (!src) return undefined;
      const owned = new Set(["title"]); // the alt text falls back to the title: the title is the heading's place
      const more = [...this.fieldsOf(n.props?.["alt"], loops), ...this.fieldsOf(n.props?.["darkSrc"], loops)].filter((f) => !owned.has(f.field) && f.pointer !== src.pointer);
      const place: Place = { place: src.list ? prefixed(src) : "media", kind: "media", fields: [src, ...more].map((f) => f.pointer), ...(src.list ? { list: src.list } : {}) };
      this.nested.add("MediaFrame");
      const shape = organism(placeName("MediaFrame"), { alt: props["alt"]!, ratio: props["ratio"] ?? "16/9", ...(props["className"] !== undefined ? { className: props["className"] } : {}),
        place: place.place, field: src.value, shape: src.list ? "avatar" : "media" });
      return { place, primary: src, shape, page: { ...n, organism: placeName("MediaFrame"), props: { ...props, place: place.place, field: src.value } } };
    }
    return undefined;
  }

  shape(kind: PlaceKind, n: Extract<ViewNode, { use: string }>, f: Field, place: string): ViewNode {
    const at = { place, field: f.value };
    const size = n.props?.["Size"];
    const big = typeof size === "string" && ["2xl", "3xl", "4xl", "5xl"].includes(size);
    const pick: Record<PlaceKind, [ShapeName, Record<string, Value>]> = {
      heading: ["ShapeHeading", { size: big ? "lg" : "md", width: f.list ? "1/2" : "3/4" }],
      text: ["ShapeText", { lines: f.list ? "1" : "2" }],
      badge: ["ShapeBadge", {}],
      action: ["ShapeCta", {}],
      media: ["ShapeText", {}],
    };
    const [name, props] = pick[kind];
    return organism(SHAPE[name].name, { ...props, ...at });
  }

  nodes(ns: ViewNode[], loops: Loop[]): ViewNode[] {
    return ns.map((n) => this.node(n, loops));
  }

  node(n: ViewNode, loops: Loop[]): ViewNode {
    const p = this.placeOf(n, loops);
    if (p) {
      this.add(p.place);
      return when(WIRE, [p.shape], [p.page]);
    }
    if ("when" in n) {
      const test = this.readsContent(n.when, loops) ? or(WIRE, n.when) : n.when;
      return { ...n, when: test, then: this.nodes(n.then, loops), ...(n.else ? { else: this.nodes(n.else, loops) } : {}) };
    }
    if ("each" in n) {
      const listField = refsOf(n.each).find((r) => this.model.fields[r]?.type === "list");
      if (!listField) return { ...n, do: this.nodes(n.do, loops) };
      const f = this.model.fields[listField]!;
      const index = n.index ?? `${n.as}Index`;
      const placeholder = (i: number): Value => Object.fromEntries(Object.entries(f.item!.fields).map(([k, x]) => [k, x.type === "id" ? `wire-${i}` : ""]));
      const items = cond(WIRE, list(...Array.from({ length: WIRE_ITEMS }, (_, i) => placeholder(i + 1))), n.each);
      return { ...n, each: items, index, do: this.nodes(n.do, [...loops, { as: n.as, index, list: listField, item: f.item!.fields }]) };
    }
    if ("use" in n) return { ...n, ...(n.children ? { children: this.nodes(n.children, loops) } : {}) };
    if ("organism" in n && n.slots) return { ...n, slots: Object.fromEntries(Object.entries(n.slots).map(([k, s]) => [k, { ...s, do: this.nodes(s.do, loops) }])) };
    return n;
  }
}

const prefixed = (f: Field): string => (f.list ? `${f.list}.${f.field}` : f.field);

/** the root attributes that name the heading: dropped in the wireframe (the heading is a shape there) */
function rootAttrs(view: ViewNode[]): ViewNode[] {
  return view.map((n) => {
    if (!("use" in n) || !n.attrs?.["aria-labelledby"]) return n;
    return { ...n, attrs: { ...n.attrs, "aria-labelledby": cond(WIRE, undef(), n.attrs["aria-labelledby"]!) } };
  });
}

/** the prototype of a clean organism for its model, and its places */
export function project(clean: OrganismSpec, model: ModelSpec): { organism: OrganismSpec; places: Place[]; nested: string[] } {
  const pr = new Projector(model);
  const view = rootAttrs(pr.nodes(clean.view, []));
  const organismSpec: OrganismSpec = {
    ...clean,
    docs: `${clean.docs} Prototype (packages/prototypes): mode wireframe draws the places as shapes, mode page draws the content with data-place and data-field on each place.`,
    props: [...clean.props, { name: "mode", type: { ts: MODES.map((m) => JSON.stringify(m)).join(" | ") }, default: "wireframe", docs: "wireframe: the shapes of the places; page: the content" }],
    derived: [...(clean.derived ?? []), { name: "wire", value: eq(ref("mode"), "wireframe") }],
    view,
  };
  return { organism: organismSpec, places: [...pr.places.values()], nested: [...pr.nested] };
}

/** a nested organism that carries a place on its root: props place, field, shape become data-place, data-field, data-shape */
export function placeCopy(o: OrganismSpec): OrganismSpec {
  const extra = [
    { name: "place", type: "string" as const, docs: "the place of the prototype (data-place)" },
    { name: "field", type: "string" as const, docs: "the JSON pointer of the field it draws (data-field)" },
    { name: "shape", type: "string" as const, docs: "the shape it stands for in the wireframe (data-shape)" },
  ];
  const tag = (ns: ViewNode[]): ViewNode[] => ns.map((n) => ("use" in n
    ? { ...n, attrs: { ...(n.attrs ?? {}), "data-place": ref("place"), "data-field": ref("field"), "data-shape": ref("shape"), "data-role": cond(ref("shape"), "media", undef()) } }
    : "when" in n ? { ...n, then: tag(n.then), ...(n.else ? { else: tag(n.else) } : {}) } : n));
  return { ...o, id: `${o.id.split(".")[0]}.${o.id.split(".")[1]}-place`, name: placeName(o.name), docs: `${o.docs} The copy of packages/prototypes that carries a place on its root.`, props: [...o.props, ...extra], view: tag(o.view) };
}
