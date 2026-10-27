// The composition-pattern facet (`pattern`): one computed value and a draft table. The vocabulary is content/terms/pattern.v0.json
// (brain-term/v1: ids, labels in five languages, status, provenance); the hand-written labels are content/pattern-map.v0.json.
//
// The computed rule (status "computed", proved by the spec, nothing else is): a block variant is `modular-grid` when the first
// top-level Grid it renders is a grid of equal modules:
//   1. walk the view of the organism the variant draws, with the variant's props (organism defaults < block sample < axes < variant
//      props), into nested organisms (their props evaluated in the parent) and their slots; `when` branches are taken only when the
//      condition evaluates (a sample data list counts as non-empty: every Codex collection the samples read has records); the first
//      Grid reached outside any `each` is the candidate; nothing is read inside an `each` (a grid per item is not the page grid); it is
//      the root only when, at every level up to the organism, everything beside it is the head of a section (Title, Text, Group,
//      Link, Button, Badge, Separator, Inline, text): no picture, no second grid, no other organism next to it;
//   2. its children are exactly one `each` (one repeated module, no hand-placed cells);
//   3. the module carries no span (no `col-span`/`row-span` class and no SPAN-like constant anywhere in its body): equal cells;
//   4. its Cols evaluate for this variant to a value of the kit Grid whose widest step has N >= 3 equal columns ("1-4" -> 4, "3" -> 3).
// A condition, a Cols or a prop that does not evaluate (a data length, fitCols, an unknown operation) is no evidence: no label.
import type { SpecValue } from "../../src/lib/model";

export type TermStatus = "computed" | "draft";
export type Term = { id: string; label: Record<string, string>; definition: Record<string, string>; status: TermStatus; provenance: { kind: string; ref?: string }; rule?: string };
export type TermFile = { format: "brain-term/v1"; scheme: string; label: Record<string, string>; terms: Term[] };
export type PatternMap = { version: string; note: string; labels: Record<string, string[]> };

const U = Symbol("unknown");
const NONEMPTY = Symbol("non-empty list");
type V = unknown;
type Props = Record<string, V>;
type Node = Record<string, unknown>;

const getPath = (o: V, path: string): V => path.split(".").reduce<V>((a, k) => (a === U ? U : a && typeof a === "object" ? ((a as Record<string, V>)[k] ?? undefined) : a === NONEMPTY ? U : undefined), o);

/** evaluate a view expression with the props; U when it does not evaluate */
export function evaluate(e: unknown, props: Props): V {
  if (e === null || typeof e !== "object") return e;
  if (Array.isArray(e)) return e.map((x) => evaluate(x, props));
  const o = e as Node;
  if (typeof o["$"] === "string") return getPath(props, o["$"]);
  if (typeof o["op"] === "string") {
    const a = (Array.isArray(o["args"]) ? o["args"] : []).map((x) => evaluate(x, props));
    const known = a.every((x) => x !== U);
    switch (o["op"]) {
      case "eq": if (a[0] === NONEMPTY && a[1] === 0) return false; return known ? a[0] === a[1] : U;
      case "ne": if (a[0] === NONEMPTY && a[1] === 0) return true; return known ? a[0] !== a[1] : U;
      case "gt": if (a[0] === NONEMPTY && a[1] === 0) return true; return known && typeof a[0] === "number" && typeof a[1] === "number" ? a[0] > a[1] : U;
      case "not": return a[0] === U ? U : !a[0];
      case "and": return a.some((x) => x !== U && !x) ? false : known ? a.every(Boolean) : U;
      case "or": return a.some((x) => x !== U && !!x) ? true : known ? false : U;
      case "cond": { const c = a[0]; return c === U ? U : c ? a[1] : a[2]; }
      case "len": return a[0] === NONEMPTY ? NONEMPTY : Array.isArray(a[0]) ? a[0].length : U;
      default: return U;
    }
  }
  const out: Props = {};
  for (const [k, v] of Object.entries(o)) out[k] = evaluate(v, props);
  return out;
}

/** the widest column count of a kit Grid Cols value ("1-4" -> 4, "3" -> 3), 0 when it is not one */
export const widest = (cols: V): number => (typeof cols === "string" && /^\d+(-\d+)?$/.test(cols) ? Number(cols.split("-").pop()) : 0);

export type GridFound = { cols: V; children: unknown[]; certain: boolean; root?: false };

/** the elements that may stand beside the root grid: headings, text, actions (the head of a section), not media or more content */
const CHROME = new Set(["Title", "Text", "Group", "Link", "Button", "Badge", "Separator", "Inline"]);
function chrome(n: unknown, p: Props): boolean {
  if (Array.isArray(n)) return n.every((x) => chrome(x, p));
  if (!n || typeof n !== "object") return true;
  const o = n as Node;
  if ("text" in o) return true;
  if ("when" in o) { const c = evaluate(o["when"], p); return c === U ? chrome(o["then"], p) && chrome(o["else"], p) : chrome(c ? o["then"] : o["else"], p); }
  return typeof o["use"] === "string" && CHROME.has(o["use"]);
}

/** the first top-level Grid the view renders, or null; `certain` is false when an undecided branch came first */
export function rootGrid(view: unknown, props: Props, orgs: Map<string, { view?: unknown; props: { name: string; default?: unknown }[] }>, depth = 0): GridFound | null {
  let undecided = false;
  const visit = (n: unknown, p: Props): GridFound | null => {
    if (Array.isArray(n)) {
      for (let i = 0; i < n.length; i++) {
        const r = visit(n[i], p);
        if (r) return n.every((x, j) => j === i || chrome(x, p)) ? r : { ...r, root: false };
      }
      return null;
    }
    if (!n || typeof n !== "object") return null;
    const o = n as Node;
    if ("when" in o) {
      const c = evaluate(o["when"], p);
      if (c === U) { undecided = true; return null; }
      return visit(c ? o["then"] : o["else"], p);
    }
    if ("each" in o) return null;
    if (o["use"] === "Grid") return { cols: evaluate((o["props"] as Node | undefined)?.["Cols"], p), children: (o["children"] as unknown[]) ?? [], certain: !undecided };
    if (typeof o["organism"] === "string" && depth < 8) {
      const spec = orgs.get(o["organism"]);
      if (spec) {
        const own: Props = Object.fromEntries(spec.props.filter((x) => x.default !== undefined).map((x) => [x.name, x.default]));
        for (const [k, v] of Object.entries((o["props"] as Node | undefined) ?? {})) { const x = evaluate(v, p); if (x !== undefined) own[k] = x; }
        const r = rootGrid(spec.view, own, orgs, depth + 1);
        if (r) return { ...r, certain: r.certain && !undecided };
      }
      for (const s of Object.values((o["slots"] as Record<string, { do?: unknown }> | undefined) ?? {})) { const r = visit(s.do, p); if (r) return r; }
      return null;
    }
    return visit(o["children"], p);
  };
  return visit(view, props);
}

/** rule 2-4 on a found grid */
export function isModular(g: GridFound | null): boolean {
  if (!g || !g.certain || g.root === false || g.children.length !== 1) return false;
  const only = g.children[0] as Node;
  if (!only || typeof only !== "object" || !("each" in only)) return false;
  if (/span/i.test(JSON.stringify(only["do"] ?? null))) return false;
  return widest(g.cols) >= 3;
}

/** the props a block variant hands its organism, as far as the spec proves them (references to data: non-empty lists; the rest U) */
export function variantProps(defaults: { name: string; default?: unknown }[], sample: Record<string, SpecValue>, dataAs: string[], axes: Record<string, string>, extra?: Record<string, SpecValue>): Props {
  const p: Props = Object.fromEntries(defaults.filter((x) => x.default !== undefined).map((x) => [x.name, x.default]));
  const lit = (v: SpecValue): V => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const r = (v as Record<string, SpecValue>)["$"];
      if (typeof r === "string") return dataAs.includes(r) ? NONEMPTY : U;
      if ("op" in v) return U;
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, lit(x)]));
    }
    return Array.isArray(v) ? v.map(lit) : v;
  };
  for (const [k, v] of Object.entries(sample)) p[k] = lit(v);
  for (const [k, v] of Object.entries(axes)) {
    const [g, f] = k.split(".");
    if (f === undefined) p[k] = v; else p[g!] = { ...((p[g!] as Props | undefined) ?? {}), [f]: v };
  }
  for (const [k, v] of Object.entries(extra ?? {})) p[k] = lit(v);
  return p;
}
