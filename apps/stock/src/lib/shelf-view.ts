// From the shelf (lib/collection.ts) to what the Collections and Compare pages show: plain view models in the current language.
// Pure (tested in collection.test.ts). An item the index does not have keeps its stored title and has no link.
import { textIn, type Locale } from "@ui8kit/facet-search/model";
import type { CompareRow, CompareView, KeptView, StockText } from "@ui8kit/layouts/stock/text";
import { assetIdOf, type CollectionItem } from "./collection";
import type { InstallIndex } from "./install";
import type { Asset, Index } from "./model";
import { assetHash } from "./route";

const kindOf = (index: Index, type: string, locale: Locale): string => {
  const v = index.facets.find((f) => f.id === "type")?.values.find((x) => x.id === type);
  return v ? textIn(v.label, locale) : type;
};

export function keptViews(index: Index, items: CollectionItem[], locale: Locale): KeptView[] {
  const byId = new Map(index.assets.map((a) => [a.id, a]));
  return items.map((it) => {
    const key = assetIdOf(it);
    const a = byId.get(key);
    return {
      key,
      title: a?.title ?? it.title ?? key,
      kind: kindOf(index, it.kind, locale),
      variant: a?.subtitle ?? (it.kind === "block" ? it.variant ?? "" : key),
      note: it.note ?? "",
      href: a ? assetHash(a.id) : "",
      preview: !!a?.preview,
    };
  });
}

/** the facets the Compare table shows, in this order, when one of the items carries a label of it */
export const COMPARE_FACETS = ["site", "job", "role", "composition", "pattern", "layout", "density", "media", "slots", "tone", "industry", "section", "blocks"] as const;

export function compareViews(index: Index, ids: string[], locale: Locale): CompareView[] {
  const byId = new Map(index.assets.map((a) => [a.id, a]));
  return ids.map((key) => {
    const a = byId.get(key);
    return { key, title: a ? (a.subtitle ? `${a.title} / ${a.subtitle}` : a.title) : key, kind: kindOf(index, a?.type ?? (key.startsWith("screen.") ? "screen" : "block"), locale), href: a ? assetHash(a.id) : "", preview: !!a?.preview };
  });
}

/** the registry items of an asset: a block variant its block, a screen page the blocks of the page */
function registryOf(a: Asset | undefined, inst: InstallIndex): string[] {
  if (!a) return [];
  if (a.type === "screen") return inst.screens[a.id]?.items.map((i) => i.name) ?? [];
  return a.registry ? [a.registry] : [];
}

export function compareRows(index: Index, inst: InstallIndex, ids: string[], locale: Locale, t: StockText): CompareRow[] {
  const byId = new Map(index.assets.map((a) => [a.id, a]));
  const assets = ids.map((id) => byId.get(id));
  const rows: CompareRow[] = [
    { id: "registry", label: t.compare.registry, values: assets.map((a) => registryOf(a, inst).join(", ")) },
    { id: "install", label: t.compare.install, values: assets.map((a) => { const r = registryOf(a, inst); return r.length ? `npx ui8kit add ${r.join(" ")}` : ""; }) },
  ];
  for (const id of COMPARE_FACETS) {
    const f = index.facets.find((x) => x.id === id);
    if (!f) continue;
    const values = assets.map((a) => (a?.labels[id] ?? []).map((v) => { const x = f.values.find((y) => y.id === v); return x ? textIn(x.label, locale) : v; }).join(", "));
    if (values.some(Boolean)) rows.push({ id, label: textIn(f.label, locale), values });
  }
  return rows;
}
