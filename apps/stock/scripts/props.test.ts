// The props schemas (content/props.v0.json, scripts/lib/props.ts): one JSON Schema (draft 2020-12) per organism of the organism tier,
// under its registry name; every variant Stock shows validates (its props over the sample content, the props the gallery draws it
// with), the props a variant sets validate on their own, and wrong values, unknown props and missing required props fail. The
// schema names the props the generated components take (svelte, react and templ files of packages/kit-compose), with the same
// required ones.
import { describe, expect, test } from "bun:test";
import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { blockProps, drawnBy } from "../../../packages/compose-gen/screens/src/compose-kit";
import { fileName, type BlockSpec, type OrganismSpec } from "../../../packages/compose-gen/screens/src/ir";
import { build, OUTPUTS, ROOT, serialise } from "./lib/build";
import { iconKeys, type PropsIndex } from "./lib/props";
import { kebab } from "../src/lib/install";
import { mergeProps } from "../src/lib/variants";

const built = build();
const P = built.props;
const V = built.variants;
const SPECS = join(ROOT, "packages", "compose-gen", "specs");
const KIT = join(ROOT, "packages", "kit-compose");
const specs = (dir: string): unknown[] => readdirSync(join(SPECS, dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => JSON.parse(readFileSync(join(SPECS, dir, f), "utf8")));
const blocks = specs("blocks") as BlockSpec[];
const organisms = specs("organisms") as OrganismSpec[];
const orgs = Object.fromEntries(organisms.map((o) => [o.name, o]));
const registry = new Set((JSON.parse(readFileSync(join(import.meta.dir, "fixtures", "registry-blocks.json"), "utf8")) as { names: string[] }).names);

// strict: a schema with a keyword outside draft 2020-12 or a loose type does not compile
const ajv = new Ajv2020({ strict: true, allErrors: true });
const validators = new Map<string, ValidateFunction>();
const validate = (name: string, props: unknown): boolean => {
  let fn = validators.get(name);
  if (!fn) { fn = ajv.compile(P.items[name]!.schema); validators.set(name, fn); }
  return fn(props) as boolean;
};
/** a schema without any required list (props and record fields): what a preset alone has to match, since it merges field by field
 *  over the content (mergeProps: `actions: { mode: "two" }` over the sample actions) */
const deepPartial = (s: unknown): unknown =>
  Array.isArray(s) ? s.map(deepPartial) : s && typeof s === "object" ? Object.fromEntries(Object.entries(s).filter(([k, v]) => !(k === "required" && Array.isArray(v))).map(([k, v]) => [k, deepPartial(v)])) : s;
const partial = (name: string): ValidateFunction => ajv.compile(deepPartial(P.items[name]!.schema) as object);

/** the props of a variant over the sample content: the props the gallery draws it with (variants.test.ts) */
function drawn(b: BlockSpec, variant: BlockSpec["variants"][number]): { name: string; props: Record<string, unknown>; preset: Record<string, unknown> } {
  const org = drawnBy(b, variant);
  const name = kebab(org);
  const own = new Set(Object.keys(blockProps(b, variant, {}, orgs[org])));
  const preset = V.items[name]!.variants[variant.id]!.props;
  const props = Object.fromEntries(Object.entries(mergeProps(b.sample.props as never, preset)).filter(([k]) => !b.alt || own.has(k)));
  return { name, props, preset };
}

describe("props schemas", () => {
  test("the committed props.v0.json is the fresh build, and its digest is the sha256 of the file without it", () => {
    expect(readFileSync(OUTPUTS.props, "utf8")).toBe(serialise(built).props);
    const { digest, ...body } = JSON.parse(readFileSync(OUTPUTS.props, "utf8")) as PropsIndex;
    expect(digest).toBe("sha256:" + createHash("sha256").update(JSON.stringify(body)).digest("hex"));
  });

  test("one schema per organism of the organism tier, each a block of the registry; every variants.v0.json item has one", () => {
    const tier = organisms.filter((o) => o.id.startsWith("organism.")).map((o) => kebab(o.name)).sort();
    expect(Object.keys(P.items)).toEqual(tier);
    expect(Object.keys(P.items).sort()).toEqual([...registry].sort());
    for (const [name, it] of Object.entries(V.items)) expect(P.items[name]?.organism).toBe(it.organism);
    for (const [name, it] of Object.entries(P.items)) {
      expect(it.schema["$schema"]).toBe("https://json-schema.org/draft/2020-12/schema");
      expect(it.schema["title"]).toBe(`${it.organism}Props`);
      expect(it.schema["additionalProperties"]).toBe(false);
      expect(() => ajv.compile(it.schema)).not.toThrow();
      expect(name).toBe(kebab(it.organism));
    }
  });

  test("every variant Stock shows validates: its props over the sample content, and its preset alone (fields of a group may be left to the content)", () => {
    let n = 0;
    const bad: string[] = [];
    const partials = new Map<string, ValidateFunction>();
    for (const b of blocks) for (const variant of b.variants) {
      const { name, props, preset } = drawn(b, variant);
      if (!validate(name, props)) bad.push(`${name}/${variant.id}: ${JSON.stringify(validators.get(name)!.errors?.slice(0, 2))}`);
      const pv = partials.get(name) ?? partials.set(name, partial(name)).get(name)!;
      if (!pv(preset)) bad.push(`${name}/${variant.id} preset: ${JSON.stringify(pv.errors?.slice(0, 2))}`);
      n++;
    }
    expect(bad).toEqual([]);
    expect(n).toBe(532);
    expect(n).toBe(built.index.counts["block"]);
  });

  test("feature-grid: axis enums, the action link, Lucide icons, required props; anything else fails (closed)", () => {
    const b = blocks.find((x) => x.organism === "FeatureGrid")!;
    const { props } = drawn(b, b.variants.find((x) => x.id === "cells4")!);
    expect(validate("feature-grid", props)).toBe(true);
    const ok = (p: Record<string, unknown>): boolean => validate("feature-grid", p);
    // wrong enum values
    expect(ok({ ...props, cols: "1-5" })).toBe(false);
    expect(ok({ ...props, item: "box" })).toBe(false);
    expect(ok({ ...props, mediaSide: "left" })).toBe(false);
    expect(ok({ ...props, tone: "loud" })).toBe(false);
    expect(ok({ ...props, density: { $: "ui.x" } })).toBe(false);
    // unknown props, at the top and inside a record
    expect(ok({ ...props, colour: "red" })).toBe(false);
    expect(ok({ ...props, action: { label: { $: "ui.site.home.featuresAction" }, href: "#/", target: "_blank" } })).toBe(false);
    // a missing required prop
    const { id: _id, ...noId } = props;
    expect(ok(noId)).toBe(false);
    // the records, written out: an icon is a Lucide name the kit ships
    const feature = { id: "f1", title: "Fast", text: { $: "ui.x.text" }, icon: "zap" };
    expect(ok({ ...props, features: [feature] })).toBe(true);
    expect(ok({ ...props, features: [{ ...feature, icon: "not-an-icon" }] })).toBe(false);
    expect(ok({ ...props, features: [{ ...feature, extra: 1 }] })).toBe(false);
    const { icon: _icon, ...noIcon } = feature;
    expect(ok({ ...props, features: [noIcon] })).toBe(false);
    // a reference: ui. is the dictionary, anything else the data; a data operation is one of OPS
    expect(ok({ ...props, title: { $: "ui.a.b" } })).toBe(true);
    expect(ok({ ...props, features: { $: "values" } })).toBe(true);
    expect(ok({ ...props, features: { op: "where", args: [{ $: "values" }, "kind", "x"] } })).toBe(true);
    expect(ok({ ...props, features: { op: "eval", args: [] } })).toBe(false);
    expect(ok({ ...props, features: "values" })).toBe(false);
    const schema = P.items["feature-grid"]!.schema as { required: string[]; properties: Record<string, { enum?: string[]; default?: string }> };
    expect(schema.required).toEqual(["id", "title", "features"]);
    expect(schema.properties["cols"]).toMatchObject({ enum: ["1-2", "1-3", "1-4"], default: "1-3" });
  });

  test("an icon is a text that reaches LucideIcon.Name; every such reference resolves to a record field or a prop", () => {
    const all = ["organisms", "parts", "patterns"].flatMap((d) => specs(d)) as OrganismSpec[];
    const { keys, unresolved } = iconKeys(all);
    expect(unresolved).toEqual([]);
    for (const k of ["Feature.icon", "Stat.icon", "NavLink.icon", "Quote.mark"]) expect(keys.has(k)).toBe(true);
    const defs = (P.items["stats-band"]!.schema["$defs"] ?? {}) as Record<string, { properties?: Record<string, unknown> }>;
    expect(defs["Stat"]!.properties!["icon"]).toEqual({ $ref: "#/$defs/lucideIcon" });
  });

  test("the schema names the props of the generated components (svelte, react, templ), with the same required ones", () => {
    const typeLines = (file: string, org: string): Map<string, boolean> => {
      const text = readFileSync(file, "utf8");
      const start = text.indexOf(`export type ${org}Props = {`);
      expect(start).toBeGreaterThanOrEqual(0);
      const body = text.slice(start, text.indexOf("};", start));
      return new Map([...body.matchAll(/^\s+(\w+)(\?)?:/gm)].map((m) => [m[1]!, m[2] !== "?"]));
    };
    for (const it of Object.values(P.items)) {
      const s = it.schema as { properties: Record<string, unknown>; required?: string[] };
      const names = Object.keys(s.properties);
      const required = new Set(s.required ?? []);
      const extra = new Set([...it.slots, ...it.events.map((e) => `on${e}`.toLowerCase())]);
      for (const [rt, ext] of [["svelte", "svelte"], ["react", "tsx"]] as const) {
        const lines = typeLines(join(KIT, rt, "src", "blocks", `${fileName(it.organism)}.${ext}`), it.organism);
        expect([...lines.keys()].filter((k) => !extra.has(k.toLowerCase()) && !extra.has(k)).sort()).toEqual([...names].sort());
        for (const n of names) expect(lines.get(n)).toBe(required.has(n));
      }
      const templ = readFileSync(join(KIT, "templ", "src", "blocks", `${fileName(it.organism)}.templ`), "utf8");
      const struct = templ.slice(templ.indexOf(`type ${it.organism}Props struct {`));
      const tags = [...struct.slice(0, struct.indexOf("\n}")).matchAll(/`json:"([^"-][^"]*)"`/g)].map((m) => m[1]!);
      expect(tags.sort()).toEqual([...names].sort());
    }
  });
});
