// Snapshots for the cards: the Discovery pipeline (serialise → rasterise → WebP → IndexedDB) with the same content-address key as
// the Loader of the panorama, so a style Discovery already rendered is a cache lookup here, and the other way round. The key is
// hash(markup) + hash(document CSS) + theme + size under the profile prefix (s3 desktop, m3 light): equal CSS in both apps (see
// app.css and `bun run css-parity`) is what makes the entries shared.
import { deckAt } from "@ui8kit/taste-data/copy";
import { TASTES } from "@ui8kit/taste-data/tastes";
import { SCREENS } from "@ui8kit/taste-screens/screens";
import { getShot, putShot } from "@ui8kit/panorama/cache";
import { HIGH_H, HIGH_W } from "@ui8kit/panorama/panorama";
import { profile } from "@ui8kit/panorama/profile";
import { collectCss, hash, rasterise, serialise, toBlob } from "@ui8kit/panorama/snapshot";
import TasteFrame from "@ui8kit/panorama/taste-frame.svelte";
import type { Style } from "@ui8kit/taste-data/recommend";
import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";

const TASTE = new Map(TASTES.map((t) => [t.id, t]));
let cssHash = "";

export type Lookup = { key: string; html: string; blob: Blob | null };

/** the cache key of a style under the current theme, and the snapshot when the cache has it (no rasterising) */
export async function lookup(s: Style, dark: boolean): Promise<Lookup> {
  const taste = TASTE.get(s.screen)!;
  const html = serialise(TasteFrame, { screen: SCREENS[s.screen]!, deck: deckAt(taste.deck), skin: s.skin as SkinId, fonts: s.fonts as FontPair, radius: s.radius as Radius });
  if (!cssHash) cssHash = hash(collectCss());
  const key = `${profile().prefix}-${hash(html)}-${hash(html, 0x1234567)}-${cssHash}-${dark ? "d" : "l"}-${HIGH_W}x${HIGH_H}`;
  return { key, html, blob: await getShot(key) };
}

// rasterising is the expensive step: three at a time, in the order asked, and a card that scrolled away before its turn is skipped
const CONCURRENCY = 3;
type Job = { lk: Lookup; s: Style; dark: boolean; wanted: () => boolean; resolve: (b: Blob | null) => void };
const queue: Job[] = [];
const inflight = new Map<string, Promise<Blob | null>>();
let running = 0;

async function run(job: Job): Promise<void> {
  try {
    if (!job.wanted()) { job.resolve(null); return; }
    const prof = profile();
    const canvas = await rasterise(job.lk.html, [job.s.fonts.display, job.s.fonts.body] as never, job.dark, HIGH_W, HIGH_H);
    const blob = await toBlob(canvas, prof.quality, prof.id === "light");
    void putShot(job.lk.key, blob);
    job.resolve(blob);
  } catch {
    job.resolve(null);
  }
}

function pump(): void {
  while (running < CONCURRENCY && queue.length) {
    const job = queue.shift()!;
    running++;
    void run(job).finally(() => { running--; pump(); });
  }
}

/** rasterise a style that is not cached yet (null when `wanted()` turned false before its turn, or on failure); one job per key */
export function make(lk: Lookup, s: Style, dark: boolean, wanted: () => boolean): Promise<Blob | null> {
  const have = inflight.get(lk.key);
  if (have) return have;
  const p = new Promise<Blob | null>((resolve) => { queue.push({ lk, s, dark, wanted, resolve }); pump(); });
  inflight.set(lk.key, p);
  void p.finally(() => inflight.delete(lk.key));
  return p;
}

/** how many cards show live DOM at once (a budget shared by every card: the plan's ≤ 36) */
export const LIVE_MAX = 36;
let live = 0;
export const liveSlots = {
  acquire(): boolean { if (live >= LIVE_MAX) return false; live++; return true; },
  release(): void { if (live > 0) live--; },
  get count(): number { return live; },
};
