// Texture and cache profile. "full" is the desktop output (unchanged: 400×300 near cards with mipmaps, 96×72 far cells in
// 2048² atlases, WebP 0.86, cache prefix s2). "light" is for tablets and phones (coarse pointer, or a small screen): 320×240
// near cards without mipmaps, 64×48 far cells in one smaller atlas, WebP 0.65 in IndexedDB, and its own cache prefix (m2)
// so the two profiles never read or overwrite each other's snapshots. `?profile=light|full` forces one (testing).
export type Profile = {
  id: "full" | "light";
  /** cache key prefix: the snapshot version in front of the profile */
  prefix: string;
  /** near-card texture and cached image size */
  highW: number;
  highH: number;
  /** far cell size in the atlas */
  lowW: number;
  lowH: number;
  /** longest atlas side cap */
  atlas: number;
  /** one atlas for all cards if they fit (light), or a 2048² atlas per 588 cells (full) */
  singleAtlas: boolean;
  pool: number;
  mipmaps: boolean;
  /** encoder quality of the cached blobs */
  quality: number;
};

const SNAP = "2";

export const FULL: Profile = { id: "full", prefix: "s" + SNAP, highW: 400, highH: 300, lowW: 96, lowH: 72, atlas: 2048, singleAtlas: false, pool: 80, mipmaps: true, quality: 0.86 };
export const LIGHT: Profile = { id: "light", prefix: "m" + SNAP, highW: 320, highH: 240, lowW: 64, lowH: 48, atlas: 2048, singleAtlas: true, pool: 80, mipmaps: false, quality: 0.65 };

let chosen: Profile | null = null;

/** the profile of this device, decided once: touch (coarse primary pointer) or a small screen gets the light one */
export function profile(): Profile {
  if (chosen) return chosen;
  let force = "";
  try { force = new URLSearchParams(location.search).get("profile") ?? ""; } catch { /* no location */ }
  if (force === "light") chosen = LIGHT;
  else if (force === "full") chosen = FULL;
  else {
    const coarse = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    const small = typeof screen !== "undefined" && Math.min(screen.width, screen.height) <= 820;
    chosen = coarse || small ? LIGHT : FULL;
  }
  return chosen;
}
