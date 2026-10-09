// The snapshot queue: renders the variant of every card once per theme, nearest to the view first. For each card the screen
// is mounted and serialised (cheap); the hash of that XHTML + the CSS + theme + size is the cache key, so an unchanged card
// is a lookup in IndexedDB, and only a new or changed one is rasterised. Results go to the panorama: the canvas (or the
// cached blob) fills the low-tier atlas cell, the WebP blob feeds the high tier.
import type { Component } from "svelte";
import { deckAt, type Deck } from "@ui8kit/taste-data/copy";
import TasteFrame from "./taste-frame.svelte";
import type { Taste, Variant } from "@ui8kit/taste-data/taste";
import { getShot, putShot } from "./cache";

import { HIGH_H, HIGH_W, type Panorama } from "./panorama";
import { profile } from "./profile";
import { collectCss, hash, rasterise, resetCss, serialise, toBlob } from "./snapshot";

export type LoaderStats = { done: number; total: number; rasterised: number; cached: number; ms: number };

export class Loader {
  private queue: number[] = [];
  private done = new Set<number>();
  private generation = 0;
  private dark = true;
  private cssHash = "";
  private lastSort = 0;
  readonly stats: LoaderStats;
  onProgress?: (s: LoaderStats) => void;

  constructor(
    private pano: Panorama,
    private variants: Variant[],
    private tastes: Map<string, Taste>,
    private screens: Record<string, Component<{ c: Deck }>>,
    private concurrency = 3,
  ) {
    this.stats = { done: 0, total: variants.length, rasterised: 0, cached: 0, ms: 0 };
  }

  /** (re)start for a theme: cards already shown keep their old picture until the new one lands */
  start(dark: boolean): void {
    this.dark = dark;
    this.generation++;
    this.done.clear();
    resetCss();
    this.cssHash = "";
    Object.assign(this.stats, { done: 0, rasterised: 0, cached: 0, ms: 0 });
    this.resort(true);
    // workers of the previous generation stop at their next card; this generation gets a full set of its own
    for (let i = 0; i < this.concurrency; i++) void this.worker();
  }

  /** re-sort the queue by closeness to the view (called by the panorama when the view moved; throttled) */
  resort(force = false): void {
    const now = performance.now();
    if (!force && now - this.lastSort < 300) return;
    this.lastSort = now;
    this.queue = this.pano.rankByView().filter((i) => !this.done.has(i));
  }

  private async worker(): Promise<void> {
    const gen = this.generation;
    try {
      while (gen === this.generation) {
        const i = this.queue.shift();
        if (i === undefined) break;
        if (this.done.has(i)) continue;
        this.done.add(i);
        await this.render(i, gen);
        // yield to input and rendering between cards
        await new Promise((r) => setTimeout(r, 0));
      }
    } catch (e) {
      console.error("discovery: snapshot worker stopped", e);
    }
  }

  private async render(i: number, gen: number): Promise<void> {
    const t0 = performance.now();
    const v = this.variants[i]!;
    const taste = this.tastes.get(v.screen)!;
    const screen = this.screens[v.screen];
    if (!screen) throw new Error(`no screen component for ${v.screen}`);
    const html = serialise(TasteFrame, { screen, deck: deckAt(taste.deck), skin: v.skin, fonts: v.fonts, radius: v.radius });
    if (!this.cssHash) this.cssHash = hash(collectCss());
    const fonts = [v.fonts.display, v.fonts.body];
    const prof = profile();
    // the prefix carries the snapshot version and the device profile (s2 desktop, m2 tablets/phones): never mixed
    const key = `${prof.prefix}-${hash(html)}-${hash(html, 0x1234567)}-${this.cssHash}-${this.dark ? "d" : "l"}-${HIGH_W}x${HIGH_H}`;
    let blob = await getShot(key);
    if (gen !== this.generation) return;
    if (blob) {
      const bmp = await createImageBitmap(blob);
      if (gen !== this.generation) { bmp.close(); return; }
      this.pano.setLow(i, bmp);
      bmp.close();
      this.stats.cached++;
    } else {
      const canvas = await rasterise(html, fonts, this.dark, HIGH_W, HIGH_H);
      if (gen !== this.generation) return;
      this.pano.setLow(i, canvas);
      blob = await toBlob(canvas, prof.quality, prof.id === "light");
      void putShot(key, blob);
      this.stats.rasterised++;
    }
    this.pano.setBlob(i, blob);
    this.stats.done++;
    this.stats.ms += performance.now() - t0;
    this.onProgress?.(this.stats);
  }
}
