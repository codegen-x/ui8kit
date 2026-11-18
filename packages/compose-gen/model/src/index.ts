// Content models (specs/models/<id>.json): one JSON object of content, shared by every variant of the blocks that declare it
// (BlockSpec.model = "<id>@<version>"). From one model come its JSON Schema 2020-12 (schemaOf), its TypeScript types (typesOf),
// validate() (./validate.ts) and the check that the organism of a block takes exactly the model fields as props (propsProblems).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BlockSpec, OrganismSpec } from "../../screens/src/ir";
import { ID_PATTERN, IMAGE_PATTERN, URL_MAX, URL_PATTERN, type ModelField, type ModelSpec } from "./validate";

export * from "./validate";

/** where the published schemas live: https://registry.buildy.tw/models/<id>@<version>.schema.json */
export const MODEL_BASE = "https://registry.buildy.tw/models";
/** props of an organism that are settings of an instance, not content (the rest are the model fields and the block axes) */
export const SETTINGS = ["id", "level", "padding", "landmarkLabel"] as const;

export const modelKey = (m: Pick<ModelSpec, "id" | "version">): string => `${m.id}@${m.version}`;
export const modelsDir = (root: string): string => join(root, "specs", "models");

/** every model file of specs/models, by key (hero@1) */
export function loadModels(root: string): Map<string, { file: string; model: ModelSpec }> {
  const out = new Map<string, { file: string; model: ModelSpec }>();
  for (const f of readdirSync(modelsDir(root)).filter((x) => x.endsWith(".json")).sort()) {
    const model = JSON.parse(readFileSync(join(modelsDir(root), f), "utf8")) as ModelSpec;
    out.set(modelKey(model), { file: `specs/models/${f}`, model });
  }
  return out;
}

const pascal = (s: string): string => s.replace(/(^|-)([a-z0-9])/g, (_m, _d, c: string) => c.toUpperCase());
/** the name of the content type of a model: hero -> HeroContent */
export const contentType = (m: Pick<ModelSpec, "id">): string => `${pascal(m.id)}Content`;

function fieldSchema(f: ModelField): Record<string, unknown> {
  const doc = { description: f.docs };
  switch (f.type) {
    case "list": return { ...doc, type: "array", ...(f.minItems !== undefined ? { minItems: f.minItems } : {}), ...(f.maxItems !== undefined ? { maxItems: f.maxItems } : {}), items: objectSchema(f.item!.fields, f.item!.record) };
    case "id": return { ...doc, type: "string", pattern: ID_PATTERN };
    case "url": return { ...doc, type: "string", maxLength: f.maxLength ?? URL_MAX, pattern: URL_PATTERN };
    case "image": return { ...doc, type: "string", maxLength: f.maxLength ?? URL_MAX, pattern: IMAGE_PATTERN };
    default: return { ...doc, type: "string", ...(f.maxLength !== undefined ? { maxLength: f.maxLength } : {}), ...(f.required ? { minLength: 1, pattern: "\\S" } : {}) };
  }
}

function objectSchema(fields: Record<string, ModelField>, title?: string): Record<string, unknown> {
  const required = Object.entries(fields).filter(([, f]) => f.required).map(([k]) => k);
  return {
    ...(title ? { title } : {}),
    type: "object",
    additionalProperties: false,
    ...(required.length ? { required } : {}),
    properties: Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, fieldSchema(f)])),
  };
}

/** the JSON Schema 2020-12 of a model (closed: additionalProperties false at every level) */
export function schemaOf(m: ModelSpec): Record<string, unknown> {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${MODEL_BASE}/${modelKey(m)}.schema.json`,
    title: contentType(m),
    description: m.docs,
    ...objectSchema(m.fields),
  };
}

const tsField = (f: ModelField): string => (f.type === "list" ? `${f.item!.record}[]` : "string");
const tsBody = (fields: Record<string, ModelField>, pad: string): string[] =>
  Object.entries(fields).flatMap(([k, f]) => [`${pad}/** ${f.docs} */`, `${pad}${k}${f.required ? "" : "?"}: ${tsField(f)};`]);

/** the TypeScript types of a model: one type per list record, then the content type */
export function typesOf(m: ModelSpec): string {
  const records = Object.values(m.fields).filter((f) => f.type === "list").map((f) => [`/** a ${f.item!.record} of ${modelKey(m)} */`, `export type ${f.item!.record} = {`, ...tsBody(f.item!.fields, "  "), `};`].join("\n"));
  return [...records, [`/** ${m.docs} */`, `export type ${contentType(m)} = {`, ...tsBody(m.fields, "  "), `};`].join("\n")].join("\n\n");
}

type Prop = OrganismSpec["props"][number];
const propTs = (p: Prop): string => (typeof p.type === "string" ? p.type : "ts" in p.type ? p.type.ts : `record:${p.type.record}`);

/** why the organism of a block does not take exactly the fields of its model as props (empty when it does) */
export function propsProblems(block: BlockSpec, org: OrganismSpec, m: ModelSpec): string[] {
  const out: string[] = [];
  const where = `${block.id} (${org.name}, ${modelKey(m)})`;
  const props = new Map(org.props.map((p) => [p.name, p]));
  for (const [k, f] of Object.entries(m.fields)) {
    const p = props.get(k);
    if (!p) { out.push(`${where}: model field ${k} is no prop of the organism`); continue; }
    if (Boolean(p.required) !== Boolean(f.required)) out.push(`${where}: ${k} is ${f.required ? "required" : "optional"} in the model, not in the organism`);
    if (propTs(p) !== tsField(f)) out.push(`${where}: ${k} is ${tsField(f)} in the model, ${propTs(p)} in the organism`);
    if (f.type === "list") {
      const rec = org.records[f.item!.record];
      if (!rec) { out.push(`${where}: record ${f.item!.record} is not declared by the organism`); continue; }
      const names = rec.map((r) => r.name).sort().join(",");
      if (names !== Object.keys(f.item!.fields).sort().join(",")) out.push(`${where}: record ${f.item!.record} has fields ${names}, the model ${Object.keys(f.item!.fields).sort().join(",")}`);
      for (const r of rec) { const mf = f.item!.fields[r.name]; if (mf && Boolean(r.optional) === Boolean(mf.required)) out.push(`${where}: ${f.item!.record}.${r.name} optionality differs from the model`); }
    }
  }
  for (const p of org.props) if (!(p.name in m.fields) && !(p.name in block.axes) && !(SETTINGS as readonly string[]).includes(p.name)) out.push(`${where}: prop ${p.name} is neither a model field, an axis of the block nor a setting (${SETTINGS.join(", ")})`);
  return out;
}
