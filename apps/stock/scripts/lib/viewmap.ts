// The view map of a registry block (props/v0.json viewMap, alexy-os/chaosbun#149): where each prop of the block lands in the
// generated DOM, so the chat can tie a preview element to the prop it renders and the other way round. Derived statically from
// the view IR of packages/compose-gen/specs (the slotted specs: data-slot on roots and rows, screens/src/authoring/slots.ts),
// no rendering. For every prop pointer (a JSON Pointer, a list index written "[]") the places it shows: the data-slot it sits
// inside (`in`), its own element's data-slot (`s`), and how it shows (`k`: text, html, an attribute `a`, or a lucide icon).
import { intrinsicSlots } from "../../../../packages/compose-gen/parts";
import { OPS, isGroup, isOp, isRef, type OrganismSpec, type Value, type ViewNode } from "../../../../packages/compose-gen/screens/src/ir";

/** one place a prop shows in the DOM */
export type ViewField = { in?: string; s?: string; k: "text" | "html" | "attr" | "icon"; a?: string; f?: 1 };
/** the view map of one block: the row slot of every list, and the places of every prop */
export type ViewMap = { rows: Record<string, string[]>; fields: Record<string, ViewField[]> };

const INTRINSIC = intrinsicSlots();
const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
/** the primitive props that render as a DOM attribute (value-bearing, not text) */
const VALUE_PROPS: Record<string, string> = { Href: "href", Src: "src", Alt: "alt", Placeholder: "placeholder", Title: "title", Value: "value", Label: "aria-label", Poster: "poster" };
/** raw DOM attributes that carry editable content (not layout or id hooks) */
const ATTRS = new Set(["href", "src", "alt", "aria-label", "title", "placeholder", "value", "poster"]);
/** "Feature[]" -> "Feature" */
const elementOf = (t: string | undefined): string | undefined => t?.match(/^([A-Z]\w*)\[\]$/)?.[1];

type Bind = { ptr: string; type?: string };
type Env = Map<string, Bind>;
type Records = Map<string, Map<string, string>>;
type Fill = { fill: { args: string[]; do: ViewNode[] }; env: Env; lits: Map<string, string>; stack: string[]; fills: Map<string, Fill> };
type Ctx = { rootSeen?: boolean; frame?: string; lits: Map<string, string>; fills: Map<string, Fill>; stack: string[] };

/** the data-slot an element carries: the literal the spec wrote, a computed one resolved against the literal props in scope
 *  (coalesce(testid, "name") -> the testid override, else the default name), else the slot its composition fixes */
const slotOf = (n: Extract<ViewNode, { use: string }>, lits: Map<string, string>): string | undefined => {
  const dsl = n.attrs?.["data-slot"] as Value | undefined;
  if (typeof dsl === "string") return dsl;
  if (isRef(dsl)) return lits.get(dsl.$) ?? INTRINSIC.get(n.use);
  if (isOp(dsl) && dsl.op === "coalesce") {
    for (const a of dsl.args) {
      if (isRef(a)) { const v = lits.get(a.$); if (v !== undefined) return v; }
      else if (typeof a === "string") return a;
    }
  }
  return INTRINSIC.get(n.use);
};

export function viewMaps(specs: OrganismSpec[]): Map<string, ViewMap> {
  const byName = new Map(specs.map((s) => [s.name, s]));
  const records: Records = new Map();
  for (const s of specs) for (const [r, fields] of Object.entries(s.records ?? {})) records.set(r, new Map(fields.map((f) => [f.name, f.type])));

  /** the pointer and type a reference path resolves to in an env, following record fields; undefined if it leaves the props */
  const resolve = (path: string, env: Env): Bind | undefined => {
    const [head, ...rest] = path.split(".");
    let cur = env.get(head!);
    for (const field of rest) {
      if (!cur) return undefined;
      const rec = cur.type && /^[A-Z]\w*$/.test(cur.type) ? records.get(cur.type) : undefined;
      cur = rec?.has(field) ? { ptr: `${cur.ptr}/${field}`, type: rec.get(field) } : undefined;
    }
    return cur;
  };
  /** the references a displayed value can read: itself and, through the ops that carry data to the output, the fields inside
   *  them (a template's holes, a sum's money, the branches of a choice); not a condition or a layout flag */
  const refsOf = (v: Value | undefined, out: string[] = []): string[] => {
    if (isRef(v)) out.push(v.$);
    else if (isOp(v)) {
      const a = v.args;
      switch (v.op) {
        case "cond": refsOf(a[1], out); refsOf(a[2], out); break;
        case "coalesce": case "tpl": case "money": for (const x of a) refsOf(x, out); break;
        case "str": case "nbsp": case "num": case "round": case "uniq": case "words": refsOf(a[0], out); break;
        case "firstOf": case "nth": refsOf(a[0], out); break;
        case "at": refsOf(a[1], out); break;
        case "add": case "sub": case "mul": case "div": refsOf(a[0], out); refsOf(a[1], out); break;
      }
    }
    return out;
  };
  /** the list a loop reads: a ref, or the collection the list op filters (where / match / its first argument) */
  const listRef = (v: Value | undefined): string | undefined => {
    if (isRef(v)) return v.$;
    if (isOp(v)) { if (["where", "match", "words", "range", "pageWindow", "uniq"].includes(v.op)) return listRef(v.args[0]); }
    return undefined;
  };

  const out = new Map<string, ViewMap>();
  for (const spec of specs) {
    const map: ViewMap = { rows: {}, fields: {} };
    const emit = (ptr: string, field: ViewField): void => {
      const list = (map.fields[ptr] ??= []);
      if (!list.some((e) => e.in === field.in && e.s === field.s && e.k === field.k && e.a === field.a)) list.push(field);
    };

    const value = (v: Value | undefined, env: Env, ctx: Ctx, own: string | undefined, k: ViewField["k"], a?: string): void => {
      const inSlot = ctx.frame;
      for (const r of refsOf(v)) {
        const b = resolve(r, env);
        if (!b || !b.ptr) continue;
        emit(b.ptr, { ...(inSlot ? { in: inSlot } : {}), ...(own && own !== inSlot ? { s: own } : {}), k, ...(a ? { a } : {}) });
      }
    };

    const walk = (nodes: ViewNode[], env: Env, ctx: Ctx): void => {
      for (const n of nodes) {
        if ("use" in n) {
          const own = slotOf(n, ctx.lits);
          // the scope root (the block's landmark, a loop row's top) names the block, not a field; it is transparent for in/s
          const isRoot = !ctx.rootSeen && own !== undefined;
          const self = isRoot ? undefined : own;
          if (n.use === "LucideIcon") value(n.props?.["Name"], env, ctx, self ?? "icon", "icon");
          for (const [p, v] of Object.entries(n.props ?? {})) if (p in VALUE_PROPS) value(v, env, ctx, self, "attr", VALUE_PROPS[p]);
          for (const [a, v] of Object.entries(n.attrs ?? {})) if (ATTRS.has(a)) value(v, env, ctx, self, "attr", a);
          for (const c of n.children ?? []) {
            if ("text" in c) value(c.text, env, ctx, self, "text");
            else if ("html" in c) value(c.html, env, ctx, self, "html");
          }
          const inner: Ctx = isRoot
            ? { rootSeen: true, lits: ctx.lits, fills: ctx.fills, stack: ctx.stack }
            : { rootSeen: true, frame: own ?? ctx.frame, lits: ctx.lits, fills: ctx.fills, stack: ctx.stack };
          walk((n.children ?? []).filter((c) => !("text" in c) && !("html" in c)), env, inner);
          continue;
        }
        if ("text" in n) { value(n.text, env, ctx, undefined, "text"); continue; }
        if ("html" in n) { value(n.html, env, ctx, undefined, "html"); continue; }
        if ("when" in n) { walk(n.then, env, ctx); if (n.else) walk(n.else, env, ctx); continue; }
        if ("each" in n) {
          const src = listRef(n.each);
          const b = src !== undefined ? resolve(src, env) : undefined;
          if (b) {
            const rowSlots = new Set<string>();
            const rowSlotOf = (r: ViewNode, seen: string[] = []): string | undefined => {
              if ("use" in r) return slotOf(r, ctx.lits);
              if ("when" in r) { for (const k of [...r.then, ...(r.else ?? [])]) { const s = rowSlotOf(k, seen); if (s) return s; } return undefined; }
              if ("organism" in r) { const c = byName.get(r.organism); if (!c || seen.includes(c.name)) return undefined; for (const k of c.view) { const s = rowSlotOf(k, [...seen, c.name]); if (s) return s; } }
              return undefined;
            };
            for (const r of n.do) { const s = rowSlotOf(r); if (s) rowSlots.add(s); }
            if (rowSlots.size) map.rows[b.ptr] = [...new Set([...(map.rows[b.ptr] ?? []), ...rowSlots])];
            const inner: Env = new Map(env);
            inner.set(n.as, { ptr: `${b.ptr}/[]`, type: elementOf(b.type) });
            if (n.index) inner.set(n.index, { ptr: "", type: "number" });
            walk(n.do, inner, { rootSeen: false, lits: ctx.lits, fills: ctx.fills, stack: ctx.stack });
          }
          continue;
        }
        if ("slot" in n) {
          const f = ctx.fills.get(n.slot);
          if (f) walk(f.fill.do, f.env, { rootSeen: ctx.rootSeen, frame: ctx.frame, lits: f.lits, fills: f.fills, stack: f.stack });
          continue;
        }
        if ("organism" in n) {
          const child = byName.get(n.organism);
          if (!child || ctx.stack.includes(child.name)) continue;
          const childEnv: Env = new Map();
          const childLits = new Map<string, string>();
          for (const p of child.props) {
            const v = n.props?.[p.name];
            if (v === undefined) continue;
            if (typeof v === "string") childLits.set(p.name, v);
            else if (isRef(v)) { const lit = ctx.lits.get(v.$); if (lit !== undefined) childLits.set(p.name, lit); const b = resolve(v.$, env); if (b) childEnv.set(p.name, { ptr: b.ptr, type: typeof p.type === "string" ? p.type : "ts" in p.type ? p.type.ts : "record" in p.type ? p.type.record : undefined }); }
            else if (isGroup(v)) { for (const [k2, gv] of Object.entries(v)) if (isRef(gv)) { const b = resolve(gv.$, env); if (b) childEnv.set(`${p.name}.${k2}`, b); } }
          }
          for (const d of child.derived ?? []) { const [r] = refsOf(d.value); if (r !== undefined && isRef(d.value)) { const b = resolve(r, childEnv); if (b) childEnv.set(d.name, b); } }
          const fills = new Map<string, Fill>(ctx.fills);
          for (const [slot, fill] of Object.entries(n.slots ?? {})) {
            if (fill.forward) { const fwd = ctx.fills.get(fill.forward); if (fwd) fills.set(slot, fwd); }
            else fills.set(slot, { fill, env, lits: ctx.lits, stack: ctx.stack, fills: ctx.fills });
          }
          walk(child.view, childEnv, { rootSeen: ctx.rootSeen, frame: ctx.frame, lits: childLits, fills, stack: [...ctx.stack, child.name] });
          continue;
        }
      }
    };

    // the env for a block's own view: each prop is a pointer from the root; group props expose their fields lazily through resolve
    const env: Env = new Map(spec.props.map((p) => [p.name, { ptr: `/${p.name}`, type: typeof p.type === "string" ? p.type : "ts" in p.type ? p.type.ts : "record" in p.type ? p.type.record : undefined }]));
    for (const d of spec.derived ?? []) { const [r] = refsOf(d.value); if (r !== undefined && isRef(d.value)) { const b = resolve(r, env); if (b) env.set(d.name, b); } }
    walk(spec.view, env, { lits: new Map(), fills: new Map(), stack: [spec.name] });
    out.set(spec.name, map);
  }
  return out;
}
