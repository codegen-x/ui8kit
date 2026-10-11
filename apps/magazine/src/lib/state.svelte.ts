// The visitor's picks in the magazine: the 10 exact styles from `?picks=` (URL wins, and is written back), else the ones stored
// on this device (`magazine:v1:picks`), else the ones Discovery left in `discovery-picked-recommend` (same origin). Fewer than
// MIN_PICKS never unlock the feed. Local only (plan/MAGAZINE.md §12, decisions 4-5).
import { decodePicks, encodePicks, MIN_PICKS, type StyleKey } from "@ui8kit/taste-data/picks";

export const STORE_PICKS = "magazine:v1:picks";
export const DISCOVERY_PICKS = "discovery-picked-recommend";

function readList(key: string): StyleKey[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return decodePicks(raw.filter((k): k is string => typeof k === "string").join(",").replace(/\|/g, "~"));
  } catch { return []; }
}

export function savePicks(keys: StyleKey[]): void {
  try { localStorage.setItem(STORE_PICKS, JSON.stringify(keys)); } catch { /* storage blocked */ }
}

/** where this visit's picks came from: the URL (the sphere flies into the header), storage, Discovery's list, or nowhere */
export type PicksSource = "url" | "store" | "discovery" | "none";

/**
 * The unlocked picks for this visit. The URL wins and is saved. Without it, the stored picks win when they are complete; else
 * Discovery's own list when it is complete; else the two lists merged (stored first, deduped) when together they reach MIN_PICKS.
 */
export function loadPicks(search: string = location.search): { picks: StyleKey[]; source: PicksSource } {
  const fromUrl = decodePicks(new URLSearchParams(search).get("picks"));
  if (fromUrl.length >= MIN_PICKS) { savePicks(fromUrl); return { picks: fromUrl, source: "url" }; }
  const stored = readList(STORE_PICKS);
  if (stored.length >= MIN_PICKS) return { picks: stored, source: "store" };
  const disc = readList(DISCOVERY_PICKS);
  if (disc.length >= MIN_PICKS) { savePicks(disc); return { picks: disc, source: "discovery" }; }
  const merged = [...new Set([...stored, ...disc])];
  if (merged.length >= MIN_PICKS) { const m = merged.slice(0, MIN_PICKS); savePicks(m); return { picks: m, source: "discovery" }; }
  return { picks: [], source: "none" };
}

/** write the picks into the address bar (`?picks=`), keeping the hash; no new history entry */
export function writePicksToUrl(keys: StyleKey[]): void {
  // built by hand: URLSearchParams would escape the "," and "+" that the Discovery link keeps as they are
  const rest = new URLSearchParams(location.search);
  rest.delete("picks");
  const tail = rest.toString();
  history.replaceState(null, "", `${location.pathname}?picks=${encodePicks(keys)}${tail ? "&" + tail : ""}${location.hash}`);
}

/** the routes of the hash: home, one style (`#/style/<key>` with "~" for "|"), one collection, and the read-only lists */
export type Route = { name: "home" } | { name: "style"; key: StyleKey } | { name: "collection"; id: string } | { name: "packs" } | { name: "presets" };
export function parseRoute(hash: string): Route {
  const m = /^#\/style\/(.+)$/.exec(hash);
  if (m) {
    const key = decodePicks(decodeURIComponent(m[1]!))[0];
    if (key) return { name: "style", key };
  }
  const c = /^#\/collection\/([A-Za-z0-9_-]+)$/.exec(hash);
  if (c) return { name: "collection", id: c[1]! };
  if (hash === "#/packs") return { name: "packs" };
  if (hash === "#/presets") return { name: "presets" };
  return { name: "home" };
}

/** the magazine's shared state: the picks, and the phase of the sphere (empty: no picks; flying/ball/expanding/search) */
export type Phase = "empty" | "flying" | "ball" | "expanding" | "search";
export const mag = $state<{ picks: StyleKey[]; phase: Phase; draft: number }>({ picks: [], phase: "empty", draft: 0 });

/** the sphere registers these; the header ball and the search bar call them */
export const ctl: { apply: () => void; cancel: () => void; expand: () => void } = { apply: () => {}, cancel: () => {}, expand: () => {} };
