// Collections and Compare of Stock (alexy-os/chaosbun#151): the screens and block variants a person keeps on this device
// (localStorage, no accounts yet), the items picked for side-by-side comparison, and the hand-off to BuildY as a
// buildy-collection:v1 document (https://schema.buildy.tw/collection.schema.json, ui8kit/contract). Pure: the reactive
// store (collection.svelte.ts) and the pages call it; tests run it on the real index.
import type { Asset } from "./model";

/** The BuildY chat that "Open in BuildY" targets: the one place to change (final domain https://chat.buildy.tw). A build
 *  may override it with VITE_BUILDY_URL. Never the staging deployment. */
export const BUILDY_URL: string = ((import.meta as { env?: Record<string, string | undefined> }).env?.VITE_BUILDY_URL || "https://buildychat.vercel.app").replace(/\/+$/, "");
export const COLLECTION_FORMAT = "buildy-collection:v1";
export const COLLECTION_SCHEMA = "https://schema.buildy.tw/collection.schema.json";
/** a link longer than this is not opened (browsers, proxies and the host cut long URLs): the file is downloaded instead */
export const MAX_LINK = 8000;
/** the contract's limit of items per collection */
export const MAX_ITEMS = 100;
/** the most items Compare shows side by side */
export const MAX_COMPARE = 4;
export const STORE_KEY = "stock:v1:collections";

export type CollectionItem =
  | { kind: "screen"; id: string; title?: string; note?: string }
  | { kind: "block"; id: string; variant?: string; registry?: string; title?: string; note?: string };
/** one collection as this device keeps it */
export type Kept = { id: string; title: string; createdAt: string; updatedAt: string; items: CollectionItem[] };
/** everything Stock keeps: the collections, the one the cards add to, and the asset ids picked for Compare */
export type Shelf = { version: 1; active: string; collections: Kept[]; compare: string[] };
/** the document handed to BuildY (buildy-collection:v1) */
export type CollectionDoc = {
  $schema: string; format: typeof COLLECTION_FORMAT; id: string; title: string; createdAt: string; updatedAt: string;
  source: { app: string; url: string }; pins: { stock: { repo: string; assetsDigest: string }; registry: { url: string } };
  skin?: string; items: CollectionItem[];
};

/** the Stock asset id of an item (the key of the index and of the BuildY snapshot) */
export const assetIdOf = (item: CollectionItem): string => (item.kind === "block" && item.variant ? `${item.id}/${item.variant}` : item.id);

/** the item of an asset: a screen page by its id, a block variant as its block + variant (page-spec catalogBlock + variant) */
export function itemOf(a: Asset): CollectionItem {
  const title = a.subtitle ? `${a.title} / ${a.subtitle}` : a.title;
  if (a.type === "screen") return { kind: "screen", id: a.id, title };
  const variant = a.id.slice(a.spec.length + 1);
  return { kind: "block", id: a.spec, ...(variant ? { variant } : {}), ...(a.registry ? { registry: a.registry } : {}), title };
}

/** a collection id: col-<time base 36>-<4 random base 36> */
export const newId = (now: Date, rand: () => number = Math.random): string =>
  `col-${now.getTime().toString(36)}-${Math.floor(rand() * 36 ** 4).toString(36).padStart(4, "0")}`;

export function newCollection(title: string, now: Date, rand?: () => number): Kept {
  const at = now.toISOString();
  return { id: newId(now, rand), title, createdAt: at, updatedAt: at, items: [] };
}

/** a fresh shelf with one empty collection */
export function emptyShelf(title: string, now: Date, rand?: () => number): Shelf {
  const c = newCollection(title, now, rand);
  return { version: 1, active: c.id, collections: [c], compare: [] };
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ASSET = /^(screen\.[a-z0-9-]+\/[a-z0-9-]+|block\.[a-z0-9-]+(\/[A-Za-z][A-Za-z0-9-]*)?)$/;
const str = (v: unknown, max: number): string | undefined => (typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined);

function cleanItem(v: unknown): CollectionItem | null {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const id = str(o.id, 120);
  if (!id) return null;
  const title = str(o.title, 160);
  const note = str(o.note, 500);
  const extra = { ...(title ? { title } : {}), ...(note ? { note } : {}) };
  if (o.kind === "screen" && /^screen\.[a-z0-9-]+\/[a-z0-9-]+$/.test(id)) return { kind: "screen", id, ...extra };
  if (o.kind === "block" && /^block\.[a-z0-9-]+$/.test(id)) {
    const variant = str(o.variant, 40);
    const registry = str(o.registry, 200);
    if (variant && !/^[A-Za-z][A-Za-z0-9-]*$/.test(variant)) return null;
    return { kind: "block", id, ...(variant ? { variant } : {}), ...(registry ? { registry } : {}), ...extra };
  }
  return null;
}

/** the shelf from storage (anything): unknown or broken parts are dropped, never guessed; nothing usable gives `fallback` */
export function readShelf(raw: string | null, fallback: () => Shelf): Shelf {
  let v: unknown;
  try { v = raw ? JSON.parse(raw) : null; } catch { v = null; }
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const collections: Kept[] = [];
  for (const c of Array.isArray(o.collections) ? o.collections : []) {
    const x = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
    const id = typeof x.id === "string" && ID.test(x.id) ? x.id : null;
    const title = str(x.title, 160);
    if (!id || !title || collections.some((k) => k.id === id)) continue;
    const at = typeof x.createdAt === "string" ? x.createdAt : new Date(0).toISOString();
    const items = (Array.isArray(x.items) ? x.items : []).map(cleanItem).filter((i): i is CollectionItem => i !== null);
    const seen = new Set<string>();
    collections.push({
      id, title, createdAt: at, updatedAt: typeof x.updatedAt === "string" ? x.updatedAt : at,
      items: items.filter((i) => { const k = assetIdOf(i); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, MAX_ITEMS),
    });
  }
  if (!collections.length) return fallback();
  const active = typeof o.active === "string" && collections.some((c) => c.id === o.active) ? o.active : collections[0]!.id;
  const compare = [...new Set((Array.isArray(o.compare) ? o.compare : []).filter((x): x is string => typeof x === "string" && ASSET.test(x)))].slice(0, MAX_COMPARE);
  return { version: 1, active, collections, compare };
}

export const activeOf = (s: Shelf): Kept => s.collections.find((c) => c.id === s.active) ?? s.collections[0]!;
/** the asset is in the active collection */
export const kept = (s: Shelf, assetId: string): boolean => activeOf(s).items.some((i) => assetIdOf(i) === assetId);

const touch = (s: Shelf, id: string, now: Date, f: (c: Kept) => Kept): Shelf =>
  ({ ...s, collections: s.collections.map((c) => (c.id === id ? { ...f(c), updatedAt: now.toISOString() } : c)) });

/** add the asset to the active collection, or take it out; a full collection takes nothing more */
export function toggleKept(s: Shelf, a: Asset, now: Date): Shelf {
  const c = activeOf(s);
  if (kept(s, a.id)) return touch(s, c.id, now, (k) => ({ ...k, items: k.items.filter((i) => assetIdOf(i) !== a.id) }));
  if (c.items.length >= MAX_ITEMS) return s;
  return touch(s, c.id, now, (k) => ({ ...k, items: [...k.items, itemOf(a)] }));
}
export function removeItem(s: Shelf, collection: string, assetId: string, now: Date): Shelf {
  return touch(s, collection, now, (k) => ({ ...k, items: k.items.filter((i) => assetIdOf(i) !== assetId) }));
}
/** move an item one place up (-1) or down (+1): the order is the order BuildY reads */
export function moveItem(s: Shelf, collection: string, assetId: string, by: -1 | 1, now: Date): Shelf {
  return touch(s, collection, now, (k) => {
    const i = k.items.findIndex((x) => assetIdOf(x) === assetId);
    const j = i + by;
    if (i < 0 || j < 0 || j >= k.items.length) return k;
    const items = [...k.items];
    [items[i], items[j]] = [items[j]!, items[i]!];
    return { ...k, items };
  });
}
export function setNote(s: Shelf, collection: string, assetId: string, note: string, now: Date): Shelf {
  const n = note.slice(0, 500);
  return touch(s, collection, now, (k) => ({
    ...k,
    items: k.items.map((i) => {
      if (assetIdOf(i) !== assetId) return i;
      const { note: _old, ...rest } = i;
      return (n.trim() ? { ...rest, note: n } : rest) as CollectionItem;
    }),
  }));
}
export function rename(s: Shelf, collection: string, title: string, now: Date): Shelf {
  const t = title.trim().slice(0, 160);
  return t ? touch(s, collection, now, (k) => ({ ...k, title: t })) : s;
}
export function addCollection(s: Shelf, title: string, now: Date, rand?: () => number): Shelf {
  const c = newCollection(title, now, rand);
  return { ...s, active: c.id, collections: [...s.collections, c] };
}
/** delete a collection; the last one is emptied instead (there is always one to add to) */
export function deleteCollection(s: Shelf, collection: string, fresh: () => Kept): Shelf {
  const rest = s.collections.filter((c) => c.id !== collection);
  const collections = rest.length ? rest : [fresh()];
  return { ...s, collections, active: collections.some((c) => c.id === s.active) ? s.active : collections[0]!.id };
}
export const setActive = (s: Shelf, collection: string): Shelf => (s.collections.some((c) => c.id === collection) ? { ...s, active: collection } : s);

/** Compare: add or take out an asset id; at most MAX_COMPARE (a fifth one is refused: `full`) */
export function toggleCompare(s: Shelf, assetId: string): Shelf {
  if (s.compare.includes(assetId)) return { ...s, compare: s.compare.filter((x) => x !== assetId) };
  if (s.compare.length >= MAX_COMPARE) return s;
  return { ...s, compare: [...s.compare, assetId] };
}
export const clearCompare = (s: Shelf): Shelf => ({ ...s, compare: [] });

/** the buildy-collection:v1 document of a collection, pinned to the index it was picked from */
export function toDoc(c: Kept, pins: { assetsDigest: string }, skin: string | null, url: string): CollectionDoc {
  return {
    $schema: COLLECTION_SCHEMA, format: COLLECTION_FORMAT, id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt,
    source: { app: "stock", url },
    pins: { stock: { repo: "codegen-x/ui8kit", assetsDigest: pins.assetsDigest }, registry: { url: "https://registry.buildy.tw" } },
    ...(skin ? { skin } : {}),
    items: c.items,
  };
}

/** UTF-8 JSON in base64url without padding (RFC 4648 section 5) */
export function encodeDoc(doc: CollectionDoc): string {
  const bytes = new TextEncoder().encode(JSON.stringify(doc));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeDoc(payload: string): unknown {
  const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0))));
}

/** the Open in BuildY link: `<chat>/?collection=<payload>`; `fits` false when it is longer than MAX_LINK (download instead) */
export function buildyLink(doc: CollectionDoc, base: string = BUILDY_URL): { href: string; length: number; fits: boolean } {
  const href = `${base}/?collection=${encodeDoc(doc)}`;
  return { href, length: href.length, fits: href.length <= MAX_LINK };
}

/** the file name of a downloaded collection: its title in safe ASCII */
export const fileName = (title: string): string =>
  (title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "collection") + ".buildy-collection.json";
