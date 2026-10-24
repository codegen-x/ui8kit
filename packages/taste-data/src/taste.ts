// The axes of a taste. A taste = skin + font pairing + radius + composition + procedural image recipe (+ the copy deck it shows).
// Ids only (lowercase tokens): names and families live in CSS and fixtures, so this file is plain data for a future ranking index.
import type { FontId } from "./fonts";

/** the skins of the kit (packages/compose-gen/runtimes/core/assets/styles/skins): sky + the 14 tweakcn presets */
export const SKIN_IDS = [
  "sky", "modern-minimal", "violet-bloom", "t3-chat", "bubblegum", "doom-64", "amber-minimal", "supabase",
  "kodama-grove", "perpetuity", "cosmic-night", "claude", "mocha-mousse", "neo-brutalism", "notebook",
] as const;
export type SkinId = (typeof SKIN_IDS)[number];

/** corner radius in px, written to --radius on the frame of a screen (plain `rounded` follows it) */
export const RADII = [0, 4, 8, 12, 16] as const;
export type Radius = (typeof RADII)[number];

/** the layout family of a first screen */
export const COMPOSITIONS = [
  "poster",      // centered poster headline over a media field
  "split",       // text on one side, media on the other
  "full-bleed",  // type set across the whole width, media behind or around
  "dense-grid",  // many tiles: bento, cards, catalogue
  "airy",        // one headline, one button, a lot of air
  "stats",       // headline over a row of figures
  "ribbon",      // headline over a ribbon of icon slots
  "editorial",   // magazine columns, rules of type, a lead paragraph
  "frame",       // the hero inside a framed window / device / panel
  "prompt",      // an input or a composer as the main action
] as const;
export type Composition = (typeof COMPOSITIONS)[number];

/** the procedural image of the media slot: SVG/CSS only, colours from the skin's variables */
export const RECIPES = [
  "mesh",      // mesh-blur blobs
  "grain",     // a colour field under film grain
  "duotone",   // the kit placeholder picture in two skin colours
  "geometric", // circles, squares, triangles on a grid
  "glass",     // frosted panels over a glow
  "flat",      // big flat bold shapes
  "rings",     // concentric rings and orbits
  "stripes",   // repeating bands and lines
  "dots",      // dot and halftone fields
  "conic",     // conic sweeps and sunbursts
] as const;
export type Recipe = (typeof RECIPES)[number];

export type FontPair = { display: FontId; body: FontId };

/** one hand-written screen and the taste it was authored in */
export type Taste = {
  /** file name in src/screens without .svelte, e.g. "t001-poster-mesh" */
  id: string;
  skin: SkinId;
  fonts: FontPair;
  radius: Radius;
  composition: Composition;
  recipe: Recipe;
  /** index of the copy deck in content/copy.json (generated from packages/compose-gen/fixtures/deck*.json) */
  deck: number;
};

/** what one card of the panorama shows: a screen in its own taste or re-rendered with another skin, fonts or radius */
export type Variant = {
  /** index of the card on the sphere */
  slot: number;
  screen: string;
  skin: SkinId;
  fonts: FontPair;
  radius: Radius;
  /** true when skin, fonts and radius are the screen's own */
  base: boolean;
};

export const variantKey = (v: Pick<Variant, "screen" | "skin" | "fonts" | "radius">): string =>
  `${v.screen}|${v.skin}|${v.fonts.display}+${v.fonts.body}|${v.radius}`;
