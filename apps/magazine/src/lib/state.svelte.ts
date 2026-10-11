// The visitor's picks in the magazine: the 10 exact styles from `?picks=` (URL wins, and is written back), else the ones stored
// on this device (`magazine:v1:picks`). Fewer than MIN_PICKS never unlock the feed. Local only (plan/MAGAZINE.md §12, decisions 4-5).
import { decodePicks, MIN_PICKS, type StyleKey } from "@ui8kit/taste-data/picks";

export const STORE_PICKS = "magazine:v1:picks";

/** the unlocked picks for this visit: from the URL (and saved), else from storage, else none */
export function loadPicks(search: string = location.search): StyleKey[] {
  const fromUrl = decodePicks(new URLSearchParams(search).get("picks"));
  if (fromUrl.length >= MIN_PICKS) {
    try { localStorage.setItem(STORE_PICKS, JSON.stringify(fromUrl)); } catch { /* storage blocked */ }
    return fromUrl;
  }
  try {
    const stored = decodePicks((JSON.parse(localStorage.getItem(STORE_PICKS) ?? "[]") as string[]).join(",").replace(/\|/g, "~"));
    if (stored.length >= MIN_PICKS) return stored;
  } catch { /* nothing usable stored */ }
  return [];
}

/** the route of the hash: home, or one style (`#/style/<key>` with "~" for "|") */
export type Route = { name: "home" } | { name: "style"; key: StyleKey };
export function parseRoute(hash: string): Route {
  const m = /^#\/style\/(.+)$/.exec(hash);
  if (m) {
    const key = decodePicks(decodeURIComponent(m[1]!))[0];
    if (key) return { name: "style", key };
  }
  return { name: "home" };
}
