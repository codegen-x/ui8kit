// Collections: local only, `magazine:v1:collections` (plan/MAGAZINE.md §8, decision 5; never shared by URL).
// The default collection `recommended` ("Recommended") always exists and is where a heart puts a style. Packs and Presets are
// read-only views over these collections. Reset clears everything the magazine keeps (and Discovery's picks it merges from).
import { decodePicks, type StyleKey } from "@ui8kit/taste-data/picks";
import { cleanTokens, type Tokens } from "@ui8kit/theme-model/design";
import { clearStore } from "@ui8kit/taste-data/picks-store";

export const COLLECTIONS_KEY = "magazine:v1:collections";
export const DEFAULT_ID = "recommended";
export type Collection = { id: string; title: string; kind: "recommended" | "manual" | "pack"; styles: StyleKey[]; created: string;
  /** per-element token overrides of a saved item (only changed keys), by style key; the key itself never carries them */
  tokens?: Record<string, Tokens> };

function tokensOf(c: { tokens?: unknown }): { tokens?: Record<string, Tokens> } {
  if (!c.tokens || typeof c.tokens !== "object") return {};
  const out: Record<string, Tokens> = {};
  for (const [k, v] of Object.entries(c.tokens)) { const t = cleanTokens(v); if (Object.keys(t).length) out[k] = t; }
  return Object.keys(out).length ? { tokens: out } : {};
}

const fresh = (): Collection => ({ id: DEFAULT_ID, title: "Recommended", kind: "recommended", styles: [], created: new Date().toISOString() });

function load(): Collection[] {
  let list: Collection[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(COLLECTIONS_KEY) ?? "[]");
    if (Array.isArray(raw)) {
      list = raw
        .filter((c): c is Collection => !!c && typeof c.id === "string" && typeof c.title === "string" && Array.isArray(c.styles))
        .map((c) => ({ id: c.id, title: c.title, kind: c.kind === "pack" || c.kind === "manual" ? c.kind : "recommended", created: String(c.created ?? ""), styles: decodePicks(c.styles.join(",").replace(/\|/g, "~")), ...tokensOf(c) }));
    }
  } catch { /* nothing usable stored */ }
  if (!list.some((c) => c.id === DEFAULT_ID)) list.unshift(fresh());
  return list;
}

export const lib = $state<{ collections: Collection[] }>({ collections: load() });

function save(): void {
  try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(lib.collections)); } catch { /* storage blocked */ }
}

export const collectionOf = (id: string): Collection | undefined => lib.collections.find((c) => c.id === id);
export const hearted = (key: StyleKey, id: string = DEFAULT_ID): boolean => !!collectionOf(id)?.styles.includes(key);

/** add or remove a style in a collection (the default one unless named); returns whether it is in afterwards */
export function toggleHeart(key: StyleKey, id: string = DEFAULT_ID): boolean {
  const c = collectionOf(id);
  if (!c) return false;
  const next = c.styles.includes(key) ? c.styles.filter((k) => k !== key) : [...c.styles, key];
  lib.collections = lib.collections.map((x) => {
    if (x.id !== id) return x;
    const { tokens, ...rest } = x;
    const kept = tokens && next.includes(key) ? tokens : tokens ? Object.fromEntries(Object.entries(tokens).filter(([k]) => k !== key)) : undefined;
    return { ...rest, styles: next, ...(kept && Object.keys(kept).length ? { tokens: kept } : {}) };
  });
  save();
  return next.includes(key);
}

/** Save as collection item: the style is in the collection afterwards, with its token overrides (replaced; none: removed) */
export function saveStyle(key: StyleKey, tokens: Tokens, id: string = DEFAULT_ID): void {
  const c = collectionOf(id);
  if (!c) return;
  const clean = cleanTokens(tokens);
  const all = { ...(c.tokens ?? {}) };
  if (Object.keys(clean).length) all[key] = clean; else delete all[key];
  lib.collections = lib.collections.map((x) => {
    if (x.id !== id) return x;
    const { tokens: _old, ...rest } = x;
    return { ...rest, styles: x.styles.includes(key) ? x.styles : [...x.styles, key], ...(Object.keys(all).length ? { tokens: all } : {}) };
  });
  save();
}

/** the saved token overrides of a style in any collection ({} when none) */
export const savedTokens = (key: StyleKey): Tokens => lib.collections.find((c) => c.tokens?.[key])?.tokens?.[key] ?? {};

/** every distinct style in any collection, in collection order */
export const allStyles = (): StyleKey[] => [...new Set(lib.collections.flatMap((c) => c.styles))];

/** Reset: forget picks, collections and presets of the magazine, and the picks Discovery left for it */
export function resetAll(): void {
  clearStore(); // the picks, in every mirror (localStorage, sessionStorage, cookie, memory)
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("magazine:v1:")) localStorage.removeItem(k);
    localStorage.removeItem("discovery-picked-recommend");
    sessionStorage.removeItem("magazine:v1:search-last");
  } catch { /* storage blocked */ }
  lib.collections = [fresh()];
}
