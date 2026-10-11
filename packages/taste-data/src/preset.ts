// The preset of a style: what `npx cgenx` will read (a stub until the CLI exists; plan/MAGAZINE.md §4, §7). Plain JSON.
import { COMPOSITION_OF } from "./compositions";
import { parseStyleKey, type StyleKey } from "./picks";

export type Preset = {
  format: 1;
  screen: string;
  skin: string;
  /** the style's one font: the body face (`--font-sans`); `fonts` keeps the pair the screen was authored with */
  font: string;
  fonts: { display: string; body: string };
  radius: number;
  pattern?: string;
  style: StyleKey;
};

export function presetOf(key: StyleKey): Preset | null {
  const p = parseStyleKey(key);
  if (!p) return null;
  const pattern = COMPOSITION_OF[p.screen]?.primary;
  return { format: 1, screen: p.screen, skin: p.skin, font: p.fonts.body, fonts: p.fonts, radius: p.radius, ...(pattern ? { pattern } : {}), style: key };
}

/** the stub line shown next to the button: the shape of the future command */
export const cliLine = (p: Preset): string => `npx cgenx add --skin ${p.skin} --font ${p.font} --radius ${p.radius}`;
