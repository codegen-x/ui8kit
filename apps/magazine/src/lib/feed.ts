// The tuned feed of the magazine home (marketplace-like): a taste profile ("tune") derived from the 10 picks, overridable from the
// Filters sheet and kept in the address (?c=…&sk=…), and the feed sections built from it. Pure and deterministic: the same picks
// and the same query give the same feed. Copy lives in content/ui.json (feed.*); this file returns ids only.
import { EXCLUDED_SCREENS, EXCLUDED_SCREENS_2 } from "@ui8kit/taste-data/curated";
import { FONT_IDS, type FontId } from "@ui8kit/taste-data/font-ids";
import { parseStyleKey, styleKey, type StyleKey } from "@ui8kit/taste-data/picks";
import { skinDistance } from "@ui8kit/taste-data/recommend";
import { COMPOSITIONS, RADII, RECIPES, SKIN_IDS, type Composition, type Radius, type Recipe, type SkinId, type Taste } from "@ui8kit/taste-data/taste";
import { TASTES } from "@ui8kit/taste-data/tastes";

/** the character of a screen, read from its procedural image recipe */
export const CHARACTERS = ["calm", "bold", "technical", "playful"] as const;
export type Character = (typeof CHARACTERS)[number];
export const CHARACTER_OF: Record<Recipe, Character> = {
  mesh: "calm", grain: "calm", glass: "calm", duotone: "bold", flat: "bold", conic: "bold",
  geometric: "technical", stripes: "technical", dots: "playful", rings: "playful",
};
/** how much a first screen holds, read from its layout family */
export const DENSITIES = ["airy", "balanced", "dense"] as const;
export type Density = (typeof DENSITIES)[number];
export const DENSITY_OF: Record<Composition, Density> = {
  airy: "airy", poster: "airy", "full-bleed": "airy", split: "balanced", editorial: "balanced", frame: "balanced", prompt: "balanced",
  "dense-grid": "dense", stats: "dense", ribbon: "dense",
};
/** what the visitor builds; each task prefers some layout families ("any": no preference) */
export const TASKS = ["any", "landing", "shop", "dashboard", "docs", "portfolio"] as const;
export type Task = (typeof TASKS)[number];
export const TASK_LAYOUTS: Record<Task, readonly Composition[]> = {
  any: [], landing: ["poster", "split", "airy", "full-bleed"], shop: ["dense-grid", "frame", "split"], dashboard: ["stats", "dense-grid", "frame"],
  docs: ["editorial", "prompt", "split"], portfolio: ["full-bleed", "editorial", "frame"],
};

export type Fonts = { display: FontId; body: FontId };
export type Tune = { comp: Composition[]; character: Character[]; density: Density[]; skins: SkinId[]; font: Fonts; radius: Radius; task: Task; media: Recipe[] };
export type Axis = "comp" | "character" | "density" | "media" | "task";

const EXCLUDED = new Set<string>([...EXCLUDED_SCREENS, ...EXCLUDED_SCREENS_2]);
export const SCREENS: readonly Taste[] = TASTES.filter((t) => !EXCLUDED.has(t.id));
const SCREEN = new Map(TASTES.map((t) => [t.id, t]));

/** the values of a list by count (ties: vocabulary order), the first n */
function top<T extends string>(values: readonly T[], order: readonly T[], n: number): T[] {
  const count = new Map<T, number>();
  for (const v of values) count.set(v, (count.get(v) ?? 0) + 1);
  return [...count.keys()].sort((a, b) => count.get(b)! - count.get(a)! || order.indexOf(a) - order.indexOf(b)).slice(0, n);
}

/** the profile of the picks: their layout families, characters, densities, skins, the most used font pair and the nearest radius */
export function deriveTune(picks: readonly StyleKey[]): Tune {
  const parts = picks.map(parseStyleKey).filter((p) => p !== null);
  const screens = parts.map((p) => SCREEN.get(p.screen)).filter((t) => t !== undefined);
  const pairs = top(parts.map((p) => `${p.fonts.display}+${p.fonts.body}`), [], 1)[0] ?? "inter+inter";
  const [display, body] = pairs.split("+") as [FontId, FontId];
  const mean = parts.length ? parts.reduce((n, p) => n + p.radius, 0) / parts.length : 8;
  const radius = [...RADII].sort((a, b) => Math.abs(a - mean) - Math.abs(b - mean) || a - b)[0]!;
  return {
    comp: top(screens.map((t) => t.composition), COMPOSITIONS, 3),
    character: top(screens.map((t) => CHARACTER_OF[t.recipe]), CHARACTERS, 2),
    density: top(screens.map((t) => DENSITY_OF[t.composition]), DENSITIES, 1),
    skins: top(parts.map((p) => p.skin as SkinId), SKIN_IDS, 3),
    font: { display, body },
    radius,
    task: "any",
    media: top(screens.map((t) => t.recipe), RECIPES, 3),
  };
}

// ---- the address: only what differs from the derived tune is written (c, ch, d, sk, f, r, task, m) ----

const list = <T extends string>(v: string | null, vocab: readonly T[]): T[] | null => {
  if (v === null) return null;
  const out = v.split(".").filter((x): x is T => (vocab as readonly string[]).includes(x));
  return [...new Set(out)];
};
const same = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

/** the tune of this visit: the derived one, overridden by the valid parameters of the query */
export function readTune(search: string, base: Tune): Tune {
  const q = new URLSearchParams(search);
  const f = (q.get("f") ?? "").split("~");
  const fontOk = f.length === 2 && f.every((x) => (FONT_IDS as readonly string[]).includes(x));
  const r = Number(q.get("r"));
  const task = q.get("task");
  return {
    comp: list(q.get("c"), COMPOSITIONS) ?? base.comp,
    character: list(q.get("ch"), CHARACTERS) ?? base.character,
    density: list(q.get("d"), DENSITIES) ?? base.density,
    skins: (list(q.get("sk"), SKIN_IDS) ?? base.skins).length ? (list(q.get("sk"), SKIN_IDS) ?? base.skins) : base.skins,
    font: fontOk ? { display: f[0] as FontId, body: f[1] as FontId } : base.font,
    radius: q.has("r") && (RADII as readonly number[]).includes(r) ? (r as Radius) : base.radius,
    task: task && (TASKS as readonly string[]).includes(task) ? (task as Task) : base.task,
    media: list(q.get("m"), RECIPES) ?? base.media,
  };
}

export const TUNE_PARAMS = ["c", "ch", "d", "sk", "f", "r", "task", "m"] as const;

/** the query of a tune against its base: the other parameters (picks) are kept, the tune ones rewritten; "" parts dropped */
export function tuneSearch(search: string, tune: Tune, base: Tune): string {
  const q = new URLSearchParams(search);
  const picks = q.get("picks");
  for (const k of TUNE_PARAMS) q.delete(k);
  q.delete("picks");
  if (!same(tune.comp, base.comp)) q.set("c", tune.comp.join("."));
  if (!same(tune.character, base.character)) q.set("ch", tune.character.join("."));
  if (!same(tune.density, base.density)) q.set("d", tune.density.join("."));
  if (!same(tune.skins, base.skins)) q.set("sk", tune.skins.join("."));
  if (tune.font.display !== base.font.display || tune.font.body !== base.font.body) q.set("f", `${tune.font.display}~${tune.font.body}`);
  if (tune.radius !== base.radius) q.set("r", String(tune.radius));
  if (tune.task !== base.task) q.set("task", tune.task);
  if (!same(tune.media, base.media)) q.set("m", tune.media.join("."));
  const rest = q.toString();
  // picks first and unescaped (the Discovery link keeps "," and "+"), as writePicksToUrl writes it
  const head = picks !== null ? `picks=${picks.replace(/ /g, "+")}` : "";
  return [head, rest].filter(Boolean).join("&");
}

/** true when the tune is the derived one (nothing to reset) */
export const isDerived = (tune: Tune, base: Tune): boolean => tuneSearch("", tune, base) === "";

// ---- the feed ----

export type FeedCard = { key: StyleKey; screen: string; skin: string; fonts: Fonts; radius: number; why: Axis[] };

/** how well a screen fits the tune, and the axes it matches (strongest first) */
export function fit(t: Taste, tune: Tune): { score: number; why: Axis[] } {
  const hits: Array<[Axis, number]> = [];
  if (tune.comp.includes(t.composition)) hits.push(["comp", 3]);
  if (tune.task !== "any" && TASK_LAYOUTS[tune.task].includes(t.composition)) hits.push(["task", 2]);
  if (tune.character.includes(CHARACTER_OF[t.recipe])) hits.push(["character", 2]);
  if (tune.density.includes(DENSITY_OF[t.composition])) hits.push(["density", 1.5]);
  if (tune.media.includes(t.recipe)) hits.push(["media", 1]);
  return { score: hits.reduce((n, [, w]) => n + w, 0), why: hits.map(([a]) => a) };
}

const ranked = (tune: Tune): Array<{ t: Taste; score: number; why: Axis[] }> =>
  SCREENS.map((t) => ({ t, ...fit(t, tune) })).sort((a, b) => b.score - a.score || (a.t.id < b.t.id ? -1 : 1));

const make = (t: Taste, skin: string, fonts: Fonts, radius: number, why: Axis[]): FeedCard => ({
  key: styleKey({ screen: t.id, skin, fonts, radius }), screen: t.id, skin, fonts, radius, why,
});

/** "Closest to your picks": the best screens, each rendered in the visitor's skin, fonts and radius */
export function closest(tune: Tune, n = 8): FeedCard[] {
  const skin = tune.skins[0] ?? "sky";
  return ranked(tune).slice(0, n).map((r) => make(r.t, skin, tune.font, tune.radius, r.why));
}

/** the skins ordered by colour distance from one skin (itself first) */
const bySkin = (from: string): SkinId[] => [...SKIN_IDS].sort((a, b) => skinDistance(from, a) - skinDistance(from, b) || (a < b ? -1 : 1));

/** "Same structure, different look": the best screen in three skins: the visitor's, a near one, a far one */
export function structure(tune: Tune): FeedCard[] {
  const best = ranked(tune)[0]!;
  const own = tune.skins[0] ?? "sky";
  const order = bySkin(own);
  const near = order.find((s) => s !== own && !tune.skins.includes(s)) ?? order[1]!;
  const far = order[order.length - 1]!;
  return [own, near, far].map((s) => make(best.t, s, tune.font, tune.radius, best.why));
}

const otherFont = (f: FontId, i: number): FontId => FONT_IDS.filter((x) => x !== f)[i % (FONT_IDS.length - 1)]!;
const oppositeRadius = (r: number): Radius => [...RADII].sort((a, b) => Math.abs(b - r) - Math.abs(a - r) || a - b)[0]!;

/** "The opposite of your taste": the screens that fit least, in a far skin, another font and the opposite corners */
export function opposite(tune: Tune, n = 6): FeedCard[] {
  const far = bySkin(tune.skins[0] ?? "sky").reverse();
  return ranked(tune).reverse().slice(0, n).map((r, i) => {
    const f = otherFont(tune.font.display, i);
    return make(r.t, far[i % 3]!, { display: f, body: f }, oppositeRadius(tune.radius), []);
  });
}

/**
 * "Unexpected combinations", page by page: screens outside the visitor's layout families but sharing a character or an imagery,
 * dressed in a mix: the visitor's display font over another body font, the skins of the tune in turn, the radius one step away.
 */
export function unexpected(tune: Tune, page: number, n = 6): FeedCard[] {
  const pool = ranked(tune).filter((r) => !tune.comp.includes(r.t.composition));
  const skins = tune.skins.length ? tune.skins : (["sky"] as SkinId[]);
  const ri = RADII.indexOf(tune.radius);
  return pool.slice(page * n, page * n + n).map((r, i) => {
    const k = page * n + i;
    const radius = RADII[(ri + 1 + (k % 2) * (RADII.length - 2)) % RADII.length]!;
    return make(r.t, skins[k % skins.length]!, { display: tune.font.display, body: otherFont(tune.font.display, k) }, radius, r.why);
  });
}
/** how many pages of unexpected combinations the catalogue holds */
export const unexpectedPages = (tune: Tune, n = 6): number => Math.ceil(ranked(tune).filter((r) => !tune.comp.includes(r.t.composition)).length / n);

/** the marketplace inserts between sections, in turn: templates, design system, series, video */
export const INSERTS = ["templates", "design", "series", "video"] as const;
export type InsertKind = (typeof INSERTS)[number];
export type Insert = { kind: InsertKind; href: string; key: StyleKey };
export function insertAt(i: number, key: StyleKey, encode: (k: StyleKey) => string): Insert {
  const kind = INSERTS[i % INSERTS.length]!;
  const href = kind === "templates" ? `#/style/${encode(key)}/templates` : kind === "design" ? `#/style/${encode(key)}/design` : kind === "series" ? `#/style/${encode(key)}` : "/discovery/";
  return { kind, href, key };
}
