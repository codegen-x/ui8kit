// Adapters from a copy deck to the record shapes of kit components (LogoRibbon logos, StatsBand stats, FeatureCards
// features, TopicChips topics, BarChart bars). Icons are Lucide names from the kit set; nothing here is visible text.
import type { Deck } from "@ui8kit/taste-data/copy";

/** neutral glyphs for icon slots (a ribbon of abstract marks, never real logos) */
export const MARKS = ["orbit", "layers", "boxes", "blocks", "puzzle", "compass", "mountain", "trees", "zap", "sparkles", "hash", "anchor", "bolt", "globe", "palette", "rocket"];
export const GLYPHS = ["sparkles", "layers", "zap", "shield-check", "chart-line", "users", "wand-sparkles", "globe", "clock", "heart", "rocket", "compass"];

export const logos = (c: Deck, n = 6, from = 0) =>
  Array.from({ length: n }, (_, i) => ({ id: `logo-${i}`, name: c.tags[i % c.tags.length]!, icon: MARKS[(i + from) % MARKS.length]! }));

export const stats = (c: Deck, from = 0) =>
  c.stats.map((s, i) => ({ id: `stat-${i}`, label: s.label, value: s.value, icon: GLYPHS[(i + from) % GLYPHS.length]!, hint: "" }));

export const features = (c: Deck, from = 0) =>
  c.items.map((it, i) => ({ id: `feature-${i}`, title: it.title, text: it.text, icon: GLYPHS[(i + from) % GLYPHS.length]! }));

export const topics = (c: Deck, from = 0) =>
  c.tags.map((t, i) => ({ id: `topic-${i}`, name: t, icon: GLYPHS[(i + from + 3) % GLYPHS.length]! }));

/** a deterministic bar series (values 20..100) */
export const bars = (seed: number, n = 8) =>
  Array.from({ length: n }, (_, i) => ({ id: `bar-${i}`, label: String(i + 1), value: 20 + ((seed * 37 + i * 53 + i * i * 11) % 81) }));

/** a repeated list for dense grids */
export const repeat = <T>(xs: T[], n: number): T[] => Array.from({ length: n }, (_, i) => xs[i % xs.length]!);
