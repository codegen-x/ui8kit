// The live preview of a kit block variant or of a page of a composed screen, from its recipe (Stock: content/previews.v0.json, built
// from packages/compose-gen/specs by apps/stock/scripts/build-index.ts). The same merge as the compose-gen expansion
// (packages/compose-gen/screens/src/compose-kit.ts blockProps: sample < axis defaults < variant axes < variant props < the use; an
// alt block hands each organism only its own props), then the references resolved at run time: {"$": "ui.x.y"} from the kit
// dictionary, {"$": "<as>"} from a Codex collection read through its field map, {"$": "nav.links" | "nav.current" | "route.area"}
// from the screen's menu, and the operations pick, nth, list, undef. Pure: the data comes in through `Ctx`.

/** a value of a spec prop: a literal, a nested group, a reference ({ "$": "ui.x.y" }), an operation ({ "op": "pick", "args": [...] }) */
export type SpecValue = string | number | boolean | null | SpecValue[] | { [k: string]: SpecValue };
export type DataSource = { as: string; collection: string; fields: Record<string, string> };
export type BlockRecipe = {
  organism: string;
  alt?: { axis: string; values: string[]; organism: string };
  fit?: "section" | "card";
  defaults: Record<string, string>;
  sample: Record<string, SpecValue>;
  variants: { id: string; set: Record<string, string>; props?: Record<string, SpecValue> }[];
  data: DataSource[];
  /** the prop names of every organism the block draws */
  orgProps: Record<string, string[]>;
};
export type BlockUse = { block: string; variant?: string; props?: Record<string, SpecValue> };
export type ScreenRecipe = { name: string; before: BlockUse[]; after: BlockUse[]; areas: Record<string, BlockUse[]> };
export type Recipes = { version: string; blocks: Record<string, BlockRecipe>; screens: Record<string, ScreenRecipe> };

/** what the references read: the kit dictionary, the collections by their `as` name (already mapped), the menu and the route */
export type Ctx = { ui: unknown; data: Record<string, readonly unknown[]>; nav?: { links: readonly unknown[]; current: string }; route?: { area: string } };
/** one organism to draw: its component name, the props before resolution, whether it is a card-sized block */
export type Part = { key: string; organism: string; props: Record<string, SpecValue>; fit?: "section" | "card"; block: string; variant: string };

type Obj = { [k: string]: SpecValue };
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isGroup = (v: unknown): v is Obj => isObj(v) && !("$" in v) && !("op" in v);

export function mergeProps(...layers: Array<Record<string, SpecValue> | undefined>): Record<string, SpecValue> {
  const out: Record<string, SpecValue> = {};
  for (const layer of layers) for (const [k, v] of Object.entries(layer ?? {})) {
    const have = out[k];
    out[k] = isGroup(have) && isGroup(v) ? mergeProps(have, v) : v;
  }
  return out;
}

/** axis values as props: `media.kind: "code"` is the field kind of the grouped prop media */
export function axisProps(set: Record<string, string>): Record<string, SpecValue> {
  const out: Record<string, SpecValue> = {};
  for (const [k, v] of Object.entries(set)) {
    const [group, field] = k.split(".");
    if (field === undefined) out[k] = v;
    else out[group!] = { ...((out[group!] as Obj | undefined) ?? {}), [field]: v };
  }
  return out;
}

/** the organism a variant draws: the block's, or the alt organism when the variant sets the alt axis to its second value */
export function drawnBy(r: BlockRecipe, v: BlockRecipe["variants"][number]): string {
  return r.alt && (v.set[r.alt.axis] ?? r.defaults[r.alt.axis]) === r.alt.values[1] ? r.alt.organism : r.organism;
}

/** the part of one block use: its organism and its merged (unresolved) props; null for an unknown block or variant */
export function blockPart(recipes: Recipes, use: BlockUse, key: string, extra: Record<string, SpecValue> = {}): Part | null {
  const r = recipes.blocks[use.block];
  const v = r && (use.variant ? r.variants.find((x) => x.id === use.variant) : r.variants[0]);
  if (!r || !v) return null;
  const organism = drawnBy(r, v);
  const known = new Set(r.orgProps[organism] ?? []);
  const all = mergeProps(r.sample, axisProps({ ...r.defaults, ...v.set }), v.props, use.props, Object.fromEntries(Object.entries(extra).filter(([k]) => known.has(k))));
  if (r.alt) delete all[r.alt.axis];
  const props = r.alt ? Object.fromEntries(Object.entries(all).filter(([k]) => known.has(k))) : all;
  return { key, organism, props, block: use.block, variant: v.id, ...(r.fit ? { fit: r.fit } : {}) };
}

/** the parts of a page of a screen: the frame before, the blocks of the area, the frame after (unique ids per part) */
export function screenParts(recipes: Recipes, screen: string, area: string, prefix: string): Part[] {
  const s = recipes.screens[screen];
  if (!s) return [];
  const uses: [string, BlockUse][] = [...s.before.map((u, i): [string, BlockUse] => [`before${i}`, u]), ...(s.areas[area] ?? []).map((u, i): [string, BlockUse] => [`${area}${i}`, u]), ...s.after.map((u, i): [string, BlockUse] => [`after${i}`, u])];
  return uses.flatMap(([k, u]) => { const p = blockPart(recipes, u, k, { id: `${prefix}-${k}` }); return p ? [p] : []; });
}

/** the collections the parts read (by `as` name) */
export function sourcesOf(recipes: Recipes, parts: readonly Part[]): DataSource[] {
  const out = new Map<string, DataSource>();
  for (const p of parts) for (const d of recipes.blocks[p.block]?.data ?? []) if (!out.has(d.as)) out.set(d.as, d);
  return [...out.values()];
}

const getAt = (o: unknown, path: readonly string[]): unknown => path.reduce<unknown>((a, k) => (a && typeof a === "object" ? (a as Record<string, unknown>)[k] : undefined), o);

/** a reference: ui.* from the dictionary, nav.* and route.* from the screen, anything else a collection by its `as` name */
export function lookup(ref: string, ctx: Ctx): unknown {
  const [head, ...rest] = ref.split(".");
  if (head === "ui") return getAt(ctx.ui, rest);
  if (head === "nav") return getAt(ctx.nav, rest);
  if (head === "route") return getAt(ctx.route, rest);
  return getAt(ctx.data[head!], rest);
}

/** resolve a spec value to a plain prop value */
export function resolve(v: SpecValue | undefined, ctx: Ctx): unknown {
  if (v === null || v === undefined || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map((x) => resolve(x, ctx));
  if (typeof v["$"] === "string") return lookup(v["$"], ctx);
  if (typeof v["op"] === "string") {
    const args = Array.isArray(v["args"]) ? v["args"].map((a) => resolve(a, ctx)) : [];
    switch (v["op"]) {
      case "pick": return Array.isArray(args[0]) ? (args[0] as { id?: unknown }[]).find((i) => i?.id === args[1]) : undefined;
      case "nth": return Array.isArray(args[0]) ? args[0][Number(args[1])] : undefined;
      case "list": return args;
      case "undef": return undefined;
      default: throw new Error(`preview: unknown operation ${String(v["op"])}`);
    }
  }
  const out: Record<string, unknown> = {};
  if ("..." in v) Object.assign(out, resolve(v["..."], ctx) as object);
  for (const [k, x] of Object.entries(v)) if (k !== "...") out[k] = resolve(x, ctx);
  return out;
}

/** the props of a part, resolved */
export const resolveProps = (p: Part, ctx: Ctx): Record<string, unknown> => resolve(p.props, ctx) as Record<string, unknown>;

/** what a card renders: one variant of a block, or one page (area) of a composed screen */
export type PreviewRef = { kind: "block"; block: string; variant: string } | { kind: "screen"; screen: string; area: string };
/** the parts of a preview, with unique ids (prefix) so many previews can share one document */
export function partsOf(recipes: Recipes, ref: PreviewRef, prefix: string): Part[] {
  if (ref.kind === "screen") return screenParts(recipes, ref.screen, ref.area, prefix);
  const p = blockPart(recipes, { block: ref.block, variant: ref.variant }, "b", { id: prefix });
  return p ? [p] : [];
}
