// The props schemas of the registry blocks (content/props.v0.json, alexy-os/chaosbun#138): one JSON Schema (draft 2020-12) per
// organism of the organism tier (id organism.*, the blocks/ files of packages/kit-compose), under its registry name, generated from
// the props and records of packages/compose-gen/specs, the spec every runtime file is generated from, so the 8 runtimes share one
// schema. A program validates the props of a page-spec with it instead of guessing.
//   values: the spec values the specs and content/variants.v0.json write. A text is a string, a dictionary reference
//   { "$": "ui.<key>" } or a field of the data ({ "$": "entry.title" }); a record and a map are the value, a group of the dictionary
//   ({ "$": "ui.<group>" }, labels) or the data; a list and TrustedHtml are the value or the data the block reads: a collection reference
//   { "$": "<as>" } (no ui. prefix) or a data operation { "op", "args" } (OPS of packages/compose-gen/screens/src/ir.ts).
//   closed: additionalProperties false on the props and on every record, like the TypeScript types the specs generate
//   (`export type FeatureGridProps = { ... }`); a prop the organism does not have is an error, not ignored.
//   required: the props with `required: true` and the record fields without `optional` (the `?` of the generated types).
//   icon: a text that reaches the Name of LucideIcon in a view (directly, through a loop or a nested organism) is one of the
//   glyphs the kit ships (packages/compose-gen/specs/assets/lucide-icons.json), $defs.lucideIcon.
//   out of the schema: events and render-prop slots (functions, named per runtime), listed beside the schema.
//   viewMap: where each prop lands in the DOM of the block (data-slot names, scripts/lib/viewmap.ts, alexy-os/chaosbun#149).
import { createHash } from "node:crypto";
import { OPS, type OrganismSpec, type PropType, type Value, type ViewNode } from "../../../../packages/compose-gen/screens/src/ir";
import { viewMaps, type ViewMap } from "./viewmap";

export type JsonSchema = { [key: string]: unknown };
/** one registry block: its organism, the callbacks and render-prop slots it takes besides the props, and the schema of its props */
export type PropsItem = { organism: string; events: string[]; slots: string[]; schema: JsonSchema; viewMap: ViewMap };
/** content/props.v0.json: `items` by registry name; `digest` is the sha256 of the file without it */
export type PropsIndex = { version: string; digest: string; registry: string; items: Record<string, PropsItem> };

/** a spec of packages/compose-gen/specs (organisms, parts, patterns) as the generator reads it */
export type PropsSpec = OrganismSpec;

export const SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";

// ---- the TypeScript types the specs write ({ ts } props and record fields) -------------------------------------------------
type TsType =
  | { k: "prim"; name: "string" | "number" | "boolean" | "TrustedHtml" }
  | { k: "lit"; values: Array<string | number> }
  | { k: "ref"; name: string }
  | { k: "array"; of: TsType }
  | { k: "map"; of: TsType }
  | { k: "object"; fields: Array<{ name: string; optional: boolean; type: TsType }> }
  | { k: "union"; of: TsType[] };

/** split at a separator outside quotes and brackets */
function splitTop(text: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0, quote = "", cur = "";
  for (const ch of text) {
    if (quote) { cur += ch; if (ch === quote) quote = ""; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if ("<{([".includes(ch)) depth++;
    if (">})]".includes(ch)) depth--;
    if (ch === sep && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter((s, i, a) => s !== "" || a.length === 1);
}

/** the TypeScript type text of a spec as a tree; anything outside the subset the specs use is an error (fail closed) */
export function parseTs(text: string): TsType {
  const t = text.trim();
  const parts = splitTop(t, "|");
  if (parts.length > 1) {
    const of = parts.map(parseTs);
    if (of.every((x) => x.k === "lit")) return { k: "lit", values: of.flatMap((x) => (x as { values: Array<string | number> }).values) };
    return { k: "union", of };
  }
  if (/^"[^"]*"$/.test(t)) return { k: "lit", values: [t.slice(1, -1)] };
  if (/^-?\d+(\.\d+)?$/.test(t)) return { k: "lit", values: [Number(t)] };
  if (t === "string" || t === "number" || t === "boolean" || t === "TrustedHtml") return { k: "prim", name: t };
  if (t.startsWith("readonly ")) return parseTs(t.slice(9));
  if (t.endsWith("[]")) return { k: "array", of: parseTs(t.slice(0, -2)) };
  let m = /^Array<(.*)>$/s.exec(t);
  if (m) return { k: "array", of: parseTs(m[1]!) };
  m = /^Record<\s*string\s*,(.*)>$/s.exec(t);
  if (m) return { k: "map", of: parseTs(m[1]!) };
  if (t.startsWith("{") && t.endsWith("}")) {
    const fields = splitTop(t.slice(1, -1), ";").filter(Boolean).map((f) => {
      const fm = /^([A-Za-z_$][\w$]*)(\?)?\s*:(.*)$/s.exec(f);
      if (!fm) throw new Error(`props schema: cannot read the field "${f}" of the type ${text}`);
      return { name: fm[1]!, optional: fm[2] === "?", type: parseTs(fm[3]!) };
    });
    return { k: "object", fields };
  }
  if (/^[A-Z]\w*$/.test(t)) return { k: "ref", name: t };
  throw new Error(`props schema: the type ${text} is outside the subset the specs use`);
}

const typeText = (t: PropType): string => (typeof t === "string" ? t : "record" in t ? t.record : t.ts);
/** the element type of a list type text (Feature[] -> Feature), undefined for anything else */
const elementOf = (text: string | undefined): string | undefined => {
  if (text === undefined) return undefined;
  const t = parseTs(text);
  if (t.k !== "array") return undefined;
  const o = t.of;
  return o.k === "ref" ? o.name : o.k === "prim" ? o.name : undefined;
};

// ---- which texts are Lucide icon names: the values that reach LucideIcon.Name ----------------------------------------------
/** icon keys: `<Record>.<field>` for a record field, `<Organism>#<prop>` for a prop; `unresolved`: the LucideIcon names (in the
 *  last pass) whose reference reaches no record field or prop (a local of the view), `<Spec>: <path>` */
export function iconKeys(specs: OrganismSpec[]): { keys: Set<string>; unresolved: string[] } {
  const byName = new Map(specs.map((s) => [s.name, s]));
  const records = new Map<string, Map<string, string>>();
  for (const s of specs) for (const [r, fields] of Object.entries(s.records ?? {})) records.set(r, new Map(fields.map((f) => [f.name, f.type])));
  const keys = new Set<string>();
  type Scope = Map<string, { type?: string; key?: string }>;
  // the type of a reference path and the key it marks: "f.icon" with f: Feature -> Feature.icon
  const resolve = (path: string, scope: Scope): { type?: string; key?: string } => {
    const [head, ...rest] = path.split(".");
    let cur = scope.get(head!);
    for (const field of rest) {
      const rec = cur?.type !== undefined && /^[A-Z]\w*$/.test(cur.type) ? records.get(cur.type) : undefined;
      cur = rec?.has(field) ? { type: rec.get(field), key: `${cur!.type}.${field}` } : undefined;
    }
    return cur ?? {};
  };
  // the references a value can evaluate to: itself, the branches of cond, the arguments of coalesce (not a condition or an operand)
  const refsOf = (v: Value | undefined, out: string[] = []): string[] => {
    if (v === null || typeof v !== "object") return out;
    if (typeof (v as { $?: unknown }).$ === "string") out.push((v as { $: string }).$);
    else if (Array.isArray((v as { args?: unknown }).args)) {
      const { op, args } = v as { op: string; args: Value[] };
      if (op === "cond") { refsOf(args[1], out); refsOf(args[2], out); }
      else if (op === "coalesce") for (const a of args) refsOf(a, out);
    }
    return out;
  };
  let unresolved: string[] = [];
  let at = "";
  const mark = (v: Value | undefined, scope: Scope, lucide = false): boolean => {
    let added = false;
    for (const r of refsOf(v)) {
      const k = resolve(r, scope).key;
      if (k && !keys.has(k)) { keys.add(k); added = true; }
      if (!k && lucide) unresolved.push(`${at}: ${r}`);
    }
    return added;
  };
  const isIcon = (org: OrganismSpec, prop: string): boolean => keys.has(`${org.name}#${prop}`);
  const walk = (nodes: ViewNode[], scope: Scope): boolean => {
    let added = false;
    for (const n of nodes) {
      if ("use" in n) {
        if (n.use === "LucideIcon") added = mark(n.props?.["Name"], scope, true) || added;
        if (n.children) added = walk(n.children, scope) || added;
      } else if ("when" in n) {
        added = walk(n.then, scope) || added;
        if (n.else) added = walk(n.else, scope) || added;
      } else if ("each" in n) {
        const [src] = refsOf(n.each);
        const el = src !== undefined && typeof n.each === "object" && n.each !== null && "$" in n.each ? elementOf(resolve(src, scope).type) : undefined;
        const inner: Scope = new Map(scope);
        inner.set(n.as, { type: el });
        if (n.index) inner.set(n.index, { type: "number" });
        added = walk(n.do, inner) || added;
      } else if ("organism" in n) {
        const child = byName.get(n.organism);
        for (const [k, v] of Object.entries(n.props ?? {})) if (child && isIcon(child, k)) added = mark(v, scope) || added;
        for (const [slot, fill] of Object.entries(n.slots ?? {})) {
          const args = child?.slots.find((s) => s.name === slot)?.args ?? [];
          const inner: Scope = new Map(scope);
          fill.args.forEach((a, i) => inner.set(a, { type: args[i] ? typeText(args[i]!.type) : undefined }));
          added = walk(fill.do, inner) || added;
        }
      }
    }
    return added;
  };
  for (let changed = true; changed;) {
    changed = false;
    unresolved = [];
    for (const s of specs) {
      at = s.name;
      const scope: Scope = new Map(s.props.map((p) => [p.name, { type: typeText(p.type), key: `${s.name}#${p.name}` }]));
      for (const d of s.derived ?? []) { const [r] = refsOf(d.value); if (r !== undefined && typeof d.value === "object" && d.value !== null && "$" in d.value) scope.set(d.name, resolve(r, scope)); }
      changed = walk(s.view, scope) || changed;
    }
  }
  return { keys, unresolved: [...new Set(unresolved)].sort() };
}

// ---- the schemas ---------------------------------------------------------------------------------------------------------
const REF = (name: string): JsonSchema => ({ $ref: `#/$defs/${name}` });

/** the shared definitions of every item schema (each item carries only the ones it uses) */
function baseDefs(icons: string[]): Record<string, JsonSchema> {
  return {
    uiRef: { description: "a text of the ui dictionary, or a group of its texts for a record of labels", type: "object", properties: { $: { type: "string", pattern: "^ui\\." } }, required: ["$"], additionalProperties: false },
    dataRef: { description: "the data the block reads under this name (data[].as of the block spec)", type: "object", properties: { $: { type: "string", not: { pattern: "^ui\\." } } }, required: ["$"], additionalProperties: false },
    dataOp: { description: "an operation over the data (packages/compose-gen/screens/src/ir.ts OPS)", type: "object", properties: { op: { enum: Object.keys(OPS).sort() }, args: { type: "array" } }, required: ["op", "args"], additionalProperties: false },
    data: { anyOf: [REF("dataRef"), REF("dataOp")] },
    text: { anyOf: [{ type: "string" }, REF("uiRef"), REF("data")] },
    trustedHtml: { description: "markup from a trusted source ({ __html })", anyOf: [{ type: "object", properties: { __html: { type: "string" } }, required: ["__html"], additionalProperties: false }, REF("data")] },
    lucideIcon: { description: "a Lucide icon the kit ships (packages/compose-gen/specs/assets/lucide-icons.json)", type: "string", enum: [...icons].sort() },
  };
}

export function propsIndex(opts: { specs: OrganismSpec[]; icons: string[]; version: string; registry: string; kebab: (s: string) => string }): PropsIndex {
  const { specs, kebab } = opts;
  const records = new Map<string, Array<{ name: string; type: string; optional?: boolean; docs?: string }>>();
  for (const s of specs) for (const [r, fields] of Object.entries(s.records ?? {})) {
    if (records.has(r)) throw new Error(`props schema: the record ${r} is defined twice`);
    records.set(r, fields);
  }
  const icon = iconKeys(specs).keys;
  const base = baseDefs(opts.icons);
  const maps = viewMaps(specs);

  const items: Record<string, PropsItem> = {};
  for (const org of specs.filter((s) => s.id.startsWith("organism.")).sort((a, b) => kebab(a.name).localeCompare(kebab(b.name)))) {
    const defs: Record<string, JsonSchema> = {};
    const use = (name: string): JsonSchema => {
      if (!(name in defs)) {
        if (name in base) { defs[name] = base[name]!; for (const m of JSON.stringify(base[name]).matchAll(/#\/\$defs\/(\w+)/g)) use(m[1]!); }
        else {
          const fields = records.get(name);
          if (!fields) throw new Error(`props schema: ${org.name} uses the type ${name}, which no spec defines as a record`);
          defs[name] = {}; // reserve (a record may refer to itself)
          defs[name] = object(fields.map((f) => ({ name: f.name, optional: f.optional === true, docs: f.docs, schema: fieldSchema(parseTs(f.type), `${name}.${f.name}`) })));
        }
      }
      return REF(name);
    };
    const object = (fields: Array<{ name: string; optional: boolean; docs?: string; schema: JsonSchema }>): JsonSchema => ({
      type: "object",
      properties: Object.fromEntries(fields.map((f) => [f.name, f.docs ? { description: f.docs, ...f.schema } : f.schema])),
      ...(fields.some((f) => !f.optional) ? { required: fields.filter((f) => !f.optional).map((f) => f.name) } : {}),
      additionalProperties: false,
    });
    // a value of a type; `key` names the field or prop (icon detection)
    const fieldSchema = (t: TsType, key: string): JsonSchema => {
      switch (t.k) {
        case "prim":
          if (t.name === "string") return icon.has(key) ? use("lucideIcon") : use("text");
          if (t.name === "TrustedHtml") return use("trustedHtml");
          return { type: t.name };
        case "lit":
          return t.values.every((v) => typeof v === "string") ? { type: "string", enum: t.values } : { enum: t.values };
        case "ref":
          return { anyOf: [use(t.name), use("uiRef"), use("data")] };
        case "array":
          return { anyOf: [{ type: "array", items: fieldSchema(t.of, key) }, use("data")] };
        case "map":
          return { anyOf: [{ type: "object", additionalProperties: fieldSchema(t.of, key) }, use("uiRef"), use("data")] };
        case "object":
          return { anyOf: [object(t.fields.map((f) => ({ name: f.name, optional: f.optional, schema: fieldSchema(f.type, `${key}.${f.name}`) }))), use("uiRef"), use("data")] };
        case "union":
          return { anyOf: t.of.map((x) => fieldSchema(x, key)) };
      }
    };
    const props = org.props.map((p) => {
      const s = fieldSchema(parseTs(typeText(p.type)), `${org.name}#${p.name}`);
      return { name: p.name, optional: p.required !== true, docs: p.docs, schema: p.default !== undefined ? { ...s, default: p.default } : s };
    });
    const body = object(props);
    const name = kebab(org.name);
    const schema: JsonSchema = { $schema: SCHEMA_DIALECT, title: `${org.name}Props`, description: org.docs, ...body, $defs: Object.fromEntries(Object.keys(defs).sort().map((k) => [k, defs[k]!])) };
    items[name] = { organism: org.name, events: org.events.map((e) => e.name), slots: org.slots.map((s) => s.name), schema, viewMap: maps.get(org.name)! };
  }
  const bodyOut = { version: opts.version, registry: opts.registry, items };
  return { version: bodyOut.version, digest: "sha256:" + createHash("sha256").update(JSON.stringify(bodyOut)).digest("hex"), registry: bodyOut.registry, items };
}
