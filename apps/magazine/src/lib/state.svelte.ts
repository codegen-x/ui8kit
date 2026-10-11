// The visitor's picks in the magazine: the 10 exact styles from `?picks=` (URL wins, and is written back), else the ones stored
// on this device (`magazine:v1:picks`), else the ones Discovery left in `discovery-picked-recommend` (same origin). Fewer than
// MIN_PICKS never unlock the feed. Local only (plan/MAGAZINE.md §12, decisions 4-5).
import { decodePicks, encodePicks, MIN_PICKS, type StyleKey } from "@ui8kit/taste-data/picks";
import { clearStore, exactPicks, readStore, writeStore } from "@ui8kit/taste-data/picks-store";

export const STORE_PICKS = "magazine:v1:picks";
export const DISCOVERY_PICKS = "discovery-picked-recommend";

/** Discovery's own list (same origin, localStorage only); [] unless it holds valid styles */
function readDiscovery(): StyleKey[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(DISCOVERY_PICKS) ?? "[]");
    return Array.isArray(raw) ? decodePicks(raw.filter((k): k is string => typeof k === "string").join(",").replace(/\|/g, "~")) : [];
  } catch { return []; }
}

/** save to every mirror (localStorage, sessionStorage, cookie, memory); only exactly MIN_PICKS valid styles are kept */
export function savePicks(keys: StyleKey[]): void { writeStore(keys); }
/** forget the saved picks everywhere (Reset) */
export const forgetPicks = clearStore;

/** where this visit's picks came from: the URL (the sphere flies into the header), storage, Discovery's list, or nowhere */
export type PicksSource = "url" | "store" | "discovery" | "none";

/**
 * The unlocked picks for this visit, decided before anything renders. `?picks=` is the source of truth: with at least MIN_PICKS
 * valid styles the first 10 win and are written to storage. Otherwise the stored picks (exactly 10 valid, from any mirror; the
 * mirrors are healed); else Discovery's list when it is exactly 10; else the two lists merged when together they reach 10.
 */
export function loadPicks(search: string = location.search): { picks: StyleKey[]; source: PicksSource } {
  const fromUrl = decodePicks(new URLSearchParams(search).get("picks"));
  if (fromUrl.length >= MIN_PICKS) { const p = fromUrl.slice(0, MIN_PICKS); savePicks(p); return { picks: p, source: "url" }; }
  const stored = readStore().picks;
  if (stored.length) { savePicks(stored); return { picks: stored, source: "store" }; }
  const disc = readDiscovery();
  const d = exactPicks(disc);
  if (d.length) { savePicks(d); return { picks: d, source: "discovery" }; }
  const merged = [...new Set(disc)];
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
/** the tabs of the detail page: the overview, the 10 templates, the design system */
export type StyleTab = "overview" | "templates" | "design";
export type Route = { name: "home" } | { name: "style"; key: StyleKey; tab: StyleTab } | { name: "collection"; id: string } | { name: "packs" } | { name: "presets" } | { name: "search"; query: string };
export function parseRoute(hash: string): Route {
  const m = /^#\/style\/([^/]+?)(?:\/(templates|design))?$/.exec(hash);
  if (m) {
    const key = decodePicks(decodeURIComponent(m[1]!))[0];
    if (key) return { name: "style", key, tab: (m[2] as StyleTab | undefined) ?? "overview" };
  }
  const c = /^#\/collection\/([A-Za-z0-9_-]+)$/.exec(hash);
  if (c) return { name: "collection", id: c[1]! };
  const sr = /^#\/search(?:\?(.*))?$/.exec(hash);
  if (sr) return { name: "search", query: sr[1] ?? "" };
  if (hash === "#/packs") return { name: "packs" };
  if (hash === "#/presets") return { name: "presets" };
  return { name: "home" };
}

/** the magazine's shared state: the picks, and the phase of the sphere (empty: no picks; flying/ball/expanding/search) */
export type Phase = "empty" | "flying" | "ball" | "expanding" | "search";
export const mag = $state<{ picks: StyleKey[]; phase: Phase; draft: number }>({ picks: [], phase: "empty", draft: 0 });

/** the sphere registers these; the header ball and the search bar call them */
export const ctl: { apply: () => void; cancel: () => void; expand: () => void } = { apply: () => {}, cancel: () => {}, expand: () => {} };
