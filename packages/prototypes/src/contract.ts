// The contract of a prototype (out/contracts/<item>/<version>.json): what a builder needs to drive one block of the simple line
// without reading its code: the registry item, the content model and its schema, the variants with their axes, the settings, the
// modes and the places (the fields each region draws). out/contracts/v0.json indexes them. No timestamps: the output is stable.
import type { BlockSpec, OrganismSpec } from "../../compose-gen/screens/src/ir";
import { MODEL_BASE, SETTINGS, type ModelSpec } from "../../compose-gen/model/src/index";
import { fileName } from "../../compose-gen/screens/src/index";
import { MODES, WIRE_ITEMS, type Place } from "./project";

export const CONTRACT_VERSION = 1;
export const CONTRACT_BASE = "https://registry.buildy.tw/contracts";

export interface Contract {
  item: string; version: number; block: string; organism: string; line: string; model: string; modelSchema: string;
  axes: Record<string, string[]>; defaults: Record<string, string>;
  variants: Array<{ id: string; label: string; axes: Record<string, string> }>; defaultVariant: string;
  settings: Record<string, { type: string; default?: string | number | boolean }>;
  modes: readonly string[]; defaultMode: string; places: Place[]; wireframe: { items: number };
}

const tsOf = (p: OrganismSpec["props"][number]): string => (typeof p.type === "string" ? p.type : "ts" in p.type ? p.type.ts : p.type.record);

export function contractOf(b: BlockSpec, clean: OrganismSpec, model: ModelSpec, places: Place[], labels: Record<string, string>): Contract {
  const settings = Object.fromEntries(clean.props.filter((p) => (SETTINGS as readonly string[]).includes(p.name) && p.name !== "id")
    .map((p) => [p.name, { type: tsOf(p), ...(p.default !== undefined ? { default: p.default } : {}) }]));
  return {
    item: fileName(clean.name), version: CONTRACT_VERSION, block: b.id, organism: clean.name, line: b.line!, model: b.model!,
    modelSchema: `${MODEL_BASE}/${model.id}@${model.version}.schema.json`,
    axes: b.axes, defaults: b.defaults,
    variants: b.variants.map((v) => ({ id: v.id, label: labels[v.id] ?? v.id, axes: { ...b.defaults, ...v.set } })),
    defaultVariant: b.variants[0]!.id,
    settings, modes: MODES, defaultMode: MODES[0], places, wireframe: { items: WIRE_ITEMS },
  };
}

/** the index of every contract: item -> latest version, model and path */
export function contractIndex(cs: Contract[]) {
  return {
    version: 0,
    base: CONTRACT_BASE,
    items: Object.fromEntries(cs.map((c) => [c.item, { version: c.version, block: c.block, model: c.model, path: `${c.item}/${c.version}.json` }])),
  };
}
