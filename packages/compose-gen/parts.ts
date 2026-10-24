// The prop tables the organism emitters and the view validator name props by (PartRef), derived from the kit-compose description:
// every composition of ../kit-compose/src/map.ts is its v3 primitive (specs/primitives.json, copied from @ui8kit/codegen 3.2.0)
// plus the cva keys of its recipe (../kit-compose/variants), the prop that picks its tag, and the native attributes it forwards.
// Replaces the v2 brick specs (packages/compose-gen/specs/ui) — exit step 2 of docs/ui8kit3-xgen-exit.md.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BRICKS } from "../kit-compose/src/map";
import { RECIPES } from "../kit-compose/src/recipes";
import type { Parts } from "./screens/src/validate-view";

interface PrimProp { name: string; html: string; react: string; type: string; required: boolean; passthrough: boolean; enum?: string[]; docs?: string }
interface PrimPart { name: string; acceptsClass: boolean; acceptsChildren: boolean; acceptsAttrs: boolean; props: PrimProp[] }
type Def = { name: string; type: string; passthrough?: boolean; cva?: boolean; cvaKey?: string; required?: boolean; attr?: string; param?: string; wire?: string };
// `wire`: the Go type of the field on the templ composition (the v3 primitive type; the organism value is converted to it)
// `param`: the parameter name of the Twig / Latte composition (the camelCase name of the v3 primitive, the recipe key)
// `attr`: the HTML attribute a native prop is (the server runtimes pass it with the free attributes; the JS ones as a prop)

const PRIMS: Record<string, PrimPart> = Object.fromEntries(
  (JSON.parse(readFileSync(join(import.meta.dir, "specs/primitives.json"), "utf8")) as { primitives: Array<{ parts: PrimPart[] }> })
    .primitives.flatMap((p) => p.parts).map((p) => [p.name, p]));

/** fields of the installed templ kit typed `*string` (nullable passthrough Value since registry 3.2.2: nil = unset,
 *  new("") = value=""): "Part.Field", read from packages/kit/templ so the wire type follows the kit. The templ emitter passes
 *  the value through uiutils.SP (null stays nil, as React omits the attribute) */
const KIT_TEMPL = join(import.meta.dir, "../kit/templ/src/ui");
const PTR: Set<string> = new Set(readdirSync(KIT_TEMPL, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".templ")).flatMap((f) =>
  [...readFileSync(join(KIT_TEMPL, f), "utf8").matchAll(/^type (\w+)Props struct \{\n([^]*?)^\}/gm)].flatMap(([, part, body]) =>
    [...body!.matchAll(/^\t(\w+) \*string$/gm)].map(([, field]) => `${part}.${field}`))));

/** native attributes an organism sets on a composition that its v3 primitive does not list (forwarded as rest, plain HTML names):
 *  each is a typed prop of the organism view so the validator and the emitters name it */
const NATIVE: Record<string, Def[]> = {
  Box: [{ name: "ID", type: "string", passthrough: true, attr: "id" }],
  Text: [{ name: "ID", type: "string", passthrough: true, attr: "id" }],
  Button: [{ name: "Role", type: "string", passthrough: true, attr: "role" }],
  Input: [{ name: "Autocomplete", type: "string", passthrough: true, attr: "autocomplete" }, { name: "AriaLabel", type: "string", passthrough: true, attr: "aria-label" }],
  Select: [{ name: "AriaLabel", type: "string", passthrough: true, attr: "aria-label" }],
  SelectOption: [{ name: "Label", type: "string", passthrough: true, attr: "label" }],
  Icon: [{ name: "Name", type: "string", param: "name" }],
};
/** props whose value is a number in the organism specs (the v3 primitive takes the string form) */
const INT = new Set(["Range.Min", "Range.Max", "Textarea.Rows", "LucideIcon.Size"]);

const pascal = (k: string) => k.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());

export function partsFromKit(): Parts {
  const out: Parts = {};
  for (const [name, m] of Object.entries(BRICKS)) {
    const prim = PRIMS[m.primitive];
    if (!prim) throw new Error(`parts: ${name}: primitive ${m.primitive} is not in specs/primitives.json`);
    const recipe = m.recipe ? RECIPES[m.recipe] : undefined;
    if (m.recipe && !recipe) throw new Error(`parts: ${name}: recipe ${m.recipe} missing`);
    const props: Def[] = [];
    const add = (d: Def) => { if (!props.some((p) => p.name === d.name)) props.push(d); };
    for (const k of recipe?.keys ?? []) add({ name: pascal(k), type: "string", cva: true, param: k, wire: "string", ...(pascal(k).toLowerCase() !== k ? { cvaKey: k } : {}) });
    if (m.tagFrom) add({ name: m.tagFrom.prop, type: m.tagFrom.heading ? "int" : "string", param: m.tagFrom.prop.toLowerCase(), wire: "string" });
    for (const p of prim.props) {
      if (p.name === "Tag" && (m.tag || m.tagFrom)) continue;
      if (m.fixed && Object.keys(m.fixed).some((f) => f.toLowerCase() === p.html)) continue;
      add({ name: p.name, type: INT.has(`${name}.${p.name}`) ? "int" : p.type, passthrough: p.passthrough, wire: PTR.has(`${m.primitive}.${p.name}`) ? "*string" : p.type, param: p.react.includes("-") ? p.name[0]!.toLowerCase() + p.name.slice(1) : p.react });
    }
    for (const [a, t] of Object.entries(m.attrs ?? {})) add({ name: pascal(a), type: t === "number" ? "int" : "string", passthrough: true, attr: a.toLowerCase() });
    for (const d of NATIVE[m.primitive] ?? []) add(d);
    if (prim.acceptsClass) add({ name: "Class", type: "string", param: "class" });
    if (prim.acceptsChildren) add({ name: "Children", type: "children", param: "children" });
    if (prim.acceptsAttrs) add({ name: "Attrs", type: "attrs", param: "attrs" });
    const recipes = recipe ? { [m.recipe!]: recipe } : {};
    const part = { name, props, recipeId: m.recipe };
    out[name] = { brick: { id: `compose.${name}`, dir: "compose", file: name, docs: "", parts: [part], recordTypes: [], recipes, recipeFiles: {} }, part } as never;
  }
  return out;
}
