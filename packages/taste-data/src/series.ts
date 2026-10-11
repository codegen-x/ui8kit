// The series of a style (plan/MAGAZINE.md §7, step 6): the same skin, fonts and radius applied to other screens, one per layout
// family, so a visitor sees the style in ten different first-screen layouts. Deterministic by key (FNV-1a over key + family): the
// same key always gives the same screens; the style's own family shows the style's own screen. Authored series blocks come later.
import { EXCLUDED_SCREENS, EXCLUDED_SCREENS_2 } from "./curated";
import { parseStyleKey, styleKey, type StyleKey } from "./picks";
import { COMPOSITIONS, type Composition } from "./taste";
import { TASTES } from "./tastes";

export type SeriesItem = { family: Composition; key: StyleKey; screen: string; skin: string; fonts: { display: string; body: string }; radius: number };

const EXCLUDED = new Set([...EXCLUDED_SCREENS, ...EXCLUDED_SCREENS_2]);

const fnv = (s: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
};

/** one item per layout family, in COMPOSITIONS order; empty for a key that is not an exact style */
export function seriesOf(key: StyleKey): SeriesItem[] {
  const p = parseStyleKey(key);
  if (!p) return [];
  const own = TASTES.find((t) => t.id === p.screen)?.composition;
  return COMPOSITIONS.flatMap((family) => {
    let screen = p.screen;
    if (family !== own) {
      const pool = TASTES.filter((t) => t.composition === family && !EXCLUDED.has(t.id)).map((t) => t.id).sort();
      if (!pool.length) return [];
      screen = pool[fnv(`${key}#${family}`) % pool.length]!;
    }
    return [{ family, key: styleKey({ screen, skin: p.skin, fonts: p.fonts, radius: p.radius }), screen, skin: p.skin, fonts: p.fonts, radius: p.radius }];
  });
}
