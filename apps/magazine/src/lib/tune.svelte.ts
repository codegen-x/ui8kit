// The tune of the magazine home (src/lib/feed.ts) as shared state: the derived profile of the picks, the current one (from the
// address), whether the Filters sheet is open and how many pages of the feed are shown. Changes are written to the address
// (replaceState, hash kept), so a tuned feed can be shared; Reset drops the tune parameters.
import type { StyleKey } from "@ui8kit/taste-data/picks";
import { deriveTune, readTune, tuneSearch, type Tune } from "./feed";

export const tuning = $state<{ base: Tune | null; tune: Tune | null; sheet: boolean; pages: number }>({ base: null, tune: null, sheet: false, pages: 1 });

/** (re)start from the picks and the address */
export function startTune(picks: readonly StyleKey[]): void {
  const base = deriveTune(picks);
  tuning.base = base;
  tuning.tune = readTune(location.search, base);
  tuning.pages = 1;
}

/** use a tune: the feed rerenders, the address keeps it */
export function applyTune(tune: Tune): void {
  if (!tuning.base) return;
  tuning.tune = tune;
  tuning.pages = 1;
  const q = tuneSearch(location.search.slice(1), tune, tuning.base);
  history.replaceState(null, "", `${location.pathname}${q ? "?" + q : ""}${location.hash}`);
}

/** back to the profile of the picks */
export function resetTune(): void { if (tuning.base) applyTune(tuning.base); }
