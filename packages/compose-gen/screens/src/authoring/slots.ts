// data-slot on the root and on the list rows of every generated component (alexy-os/chaosbun#149).
// One pass over the specs, like landmarks.ts, so the JSON specs and every runtime carry the same attribute:
// - the root of a block (an organism of the registry): every top node of the view (or of a top branch) that renders an
//   element gets data-slot = the name it had as data-testid (the authored name tells branches apart: "page-figure",
//   "page-note"), else the block name in kebab case (`organism.signup-wizard` -> "signup-wizard"); a root that is a
//   nested component keeps that component's root slot; a part or a pattern gets its name the same way unless that name
//   is authored somewhere (a part named "Field" must not take the "field" of the inputs: it keeps no root slot);
// - a list row: every top node of a loop body gets data-slot = the name it had as data-testid, else the record of the
//   list in kebab case (`Feature[]` -> "feature"), else the list in kebab case + "-row" (`d.items` -> "items-row"); a
//   generated name never takes one that is authored anywhere (it would add rows to a query for the authored one);
// - any other data-testid becomes data-slot of the same name; a computed one (a `testid` prop) names the slot, with the
//   component name as the fallback on a root.
// An element whose composition already sets its own data-slot (Card, Button, Badge, Alert, the icon primitive) keeps it:
// that slot is the hook of the per-element tokens of kit.css. data-testid is not emitted any more; it never was a style
// or data hook, and the generated DOM is the one `npx ui8kit add` installs.
import { intrinsicSlots } from "../../../parts";
import { coalesce } from "../build";
import { isRef } from "../ir";
import type { OrganismSpec, Value, ViewNode } from "../ir";

const TESTID = "data-testid";
const SLOT = "data-slot";

/** compositions that render their own data-slot (fixed attribute, or the icon primitive) */
const INTRINSIC = intrinsicSlots();

export const kebab = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
const idName = (id: string): string => id.slice(id.indexOf(".") + 1);

const kids = (n: ViewNode): ViewNode[][] => {
  if ("use" in n) return n.children ? [n.children] : [];
  if ("when" in n) return [n.then, ...(n.else ? [n.else] : [])];
  if ("each" in n) return [n.do];
  if ("organism" in n) return Object.values(n.slots ?? {}).map((s) => s.do);
  return [];
};

type Records = Map<string, Map<string, string>>;
/** element type of a list type: "Feature[]" -> "Feature" */
const elementOf = (t: string | undefined): string | undefined => t?.match(/^([A-Z]\w*)\[\]$/)?.[1];

function rowName(spec: OrganismSpec, records: Records, scope: Map<string, string>, items: Value): string | undefined {
  if (!isRef(items)) return undefined;
  const [head, ...rest] = items.$.split(".");
  let type: string | undefined;
  if (scope.has(head)) type = scope.get(head);
  else {
    const p = spec.props.find((x) => x.name === head);
    const t = p?.type;
    type = typeof t === "string" ? t : t && "ts" in t ? t.ts : t && "record" in t ? t.record : undefined;
  }
  for (const seg of rest) {
    const rec = type && /^[A-Z]\w*$/.test(type) ? records.get(type) : undefined;
    type = rec?.get(seg);
  }
  return elementOf(type);
}

function setSlot(n: Extract<ViewNode, { use: string }>, name: string | undefined): void {
  const attrs = n.attrs ?? {};
  const testid = attrs[TESTID];
  delete attrs[TESTID];
  const own = INTRINSIC.has(n.use) || attrs[SLOT] !== undefined;
  if (!own) {
    const fromTestid = typeof testid === "string" && !RESERVED.has(testid) ? testid : undefined;
    // a computed test id (the `testid` prop of NavBlock, FigureBlock, ...) names the slot, the component name is the fallback
    const slot: Value | undefined = testid !== undefined && typeof testid !== "string"
      ? (name !== undefined ? coalesce(testid, name) : testid)
      : (fromTestid ?? name);
    if (slot !== undefined) attrs[SLOT] = slot;
  }
  if (Object.keys(attrs).length) n.attrs = attrs; else delete n.attrs;
}

/** slot names that are style hooks of a composition: never given to another element */
const RESERVED = new Set([...INTRINSIC.values(), "summary-indicator"]);

/** the data-testid and data-slot names the specs author (literals and the literal arguments of a computed test id) */
function authoredNames(specs: OrganismSpec[], skipRoots = false): Set<string> {
  const out = new Set<string>(RESERVED);
  const visit = (nodes: ViewNode[], top: boolean): void => {
    for (const n of nodes) {
      if ("when" in n) { for (const k of kids(n)) visit(k, top); continue; }
      if ("use" in n && !(top && skipRoots)) {
        const t = n.attrs?.[TESTID], own = n.attrs?.[SLOT];
        if (typeof own === "string") out.add(own);
        if (typeof t === "string") out.add(t);
        else if (t && typeof t === "object" && "args" in t) for (const a of (t as { args: unknown[] }).args) if (typeof a === "string") out.add(a);
      }
      if ("organism" in n && typeof n.props?.["testid"] === "string") out.add(n.props["testid"] as string);
      for (const k of kids(n)) visit(k, false);
    }
  };
  for (const s of specs) visit(s.view, true);
  return out;
}

/** the generated name of a row: the record, else the list + "-row"; never an authored name */
function generatedRow(spec: OrganismSpec, records: Records, scope: Map<string, string>, items: Value, taken: Set<string>): string {
  const el = rowName(spec, records, scope, items);
  if (el && !taken.has(kebab(el))) return kebab(el);
  const last = isRef(items) ? items.$.split(".").at(-1)! : "items";
  return `${kebab(last)}-row`;
}

/** the generated name of a root: the component name; a block whose name an inner element of its own spec authors takes
 * "<name>-root" (CartTable: the table is "cart-table", its scroll box "cart-table-root"); a part or a pattern takes its
 * name only when no spec authors it */
function rootName(spec: OrganismSpec, block: boolean, taken: Set<string>): string | undefined {
  const name = kebab(idName(spec.id));
  if (!block) return taken.has(name) ? undefined : name;
  return authoredNames([spec], true).has(name) && !RESERVED.has(name) ? `${name}-root` : name;
}

type Walk = { spec: OrganismSpec; records: Records; taken: Set<string>; root: string | undefined };

function walk(w: Walk, nodes: ViewNode[], role: "root" | "row" | "inner", scope: Map<string, string>, row?: string): void {
  const { spec, records } = w;
  for (const n of nodes) {
    if ("use" in n) {
      if (role === "root") setSlot(n, w.root);
      else if (role === "row") setSlot(n, row);
      else setSlot(n, undefined);
      for (const k of kids(n)) walk(w, k, "inner", scope);
      continue;
    }
    if ("when" in n) { for (const k of kids(n)) walk(w, k, role, scope, row); continue; }
    if ("each" in n) {
      const el = rowName(spec, records, scope, n.each);
      const inner = new Map(scope);
      if (el) inner.set(n.as, el);
      walk(w, n.do, "row", inner, generatedRow(spec, records, scope, n.each, w.taken));
      continue;
    }
    for (const k of kids(n)) walk(w, k, "inner", scope);
  }
}

/** data-slot on the roots of the blocks and on the rows of every spec, data-testid -> data-slot (in place, idempotent) */
export function withSlots(specs: OrganismSpec[], blocks: ReadonlySet<string>): void {
  const records: Records = new Map();
  for (const s of specs) for (const [r, fields] of Object.entries(s.records ?? {})) records.set(r, new Map(fields.map((f) => [f.name, f.type])));
  const taken = authoredNames(specs);
  for (const s of specs) walk({ spec: s, records, taken, root: rootName(s, blocks.has(s.id), taken) }, s.view, "root", new Map());
}
