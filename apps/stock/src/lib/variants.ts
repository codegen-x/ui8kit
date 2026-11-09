// The variant presets of Stock (named variants, not the layout presets of packages/compose-gen/specs/presets): for every registry block, the props of each variant Stock shows (asset id block.<block>/<variant>),
// so a consumer (BuildY chat, the CLI, the MCP server later) draws exactly that variant. Plain JSON with English keys
// (content/variants.v0.json), written by the index builder (scripts/lib/build.ts) from packages/compose-gen/specs/blocks, the JSON the
// gallery authoring (packages/compose-gen/screens/src/authoring/gallery/blocks*.ts) is stored as; no table of its own.
// The props of a variant are the gallery's layers without the sample content: axis defaults < variant axes < variant props
// (compose-kit.ts blockProps). Draw a variant with your content under them: mergeProps(content, preset.props). A text is a dictionary
// reference `{ "$": "ui.<key>" }` and any other `{ "$": "<as>" }` is the
// data collection the block reads under that name (data[].as of the block spec), the way the specs write them. A block drawn by two organisms (hero: HeroClassic, HeroPrompt when
// chrome is nav) hands each one only the props it has, without the switching axis, like the gallery does.
import type { SpecValue } from "./model";

export type Props = Record<string, SpecValue>;
/** one variant: its Stock asset, the axes it sets over the defaults, and the organism props it is drawn with */
export type VariantPreset = { asset: string; set: Record<string, string>; props: Props };
/** one registry block: the catalog block it comes from, its organism, the axes it varies on, their defaults and its variants */
export type VariantItem = { block: string; spec: string; organism: string; axes: Record<string, string[]>; defaults: Record<string, string>; defaultVariant: string; variants: Record<string, VariantPreset> };
/** content/variants.v0.json: `items` by registry name; `digest` is the sha256 of the file without it */
export type VariantIndex = { version: string; digest: string; registry: string; items: Record<string, VariantItem> };

// the predicates of packages/compose-gen/screens/src/ir.ts (isRef, isOp, isGroup), so a merge here is the merge of the gallery
const isRef = (v: unknown): boolean => typeof v === "object" && v !== null && typeof (v as { $?: unknown }).$ === "string";
const isOp = (v: unknown): boolean => typeof v === "object" && v !== null && typeof (v as { op?: unknown }).op === "string" && Array.isArray((v as { args?: unknown }).args);
const isGroup = (v: unknown): v is Props => typeof v === "object" && v !== null && !isRef(v) && !isOp(v);

/** props in layers, later wins; a grouped prop merges field by field (compose-kit.ts mergeProps) */
export function mergeProps(...layers: Array<Props | undefined>): Props {
  const out: Props = {};
  for (const layer of layers) for (const [k, v] of Object.entries(layer ?? {})) {
    const have = out[k];
    out[k] = isGroup(have) && isGroup(v) ? mergeProps(have, v) : v;
  }
  return out;
}

/** axis values as props: `media.kind: "code"` is the field kind of the grouped prop media (compose-kit.ts axisProps) */
export function axisProps(set: Record<string, string>): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(set)) {
    const [group, field] = k.split(".");
    if (field === undefined) out[k] = v;
    else out[group!] = { ...((out[group!] as Props | undefined) ?? {}), [field]: v };
  }
  return out;
}
