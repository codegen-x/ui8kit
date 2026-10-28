// The colour a person types or pastes into the palette's Options (layouts/src/theme/palette-options): HSL in the skins' token
// format (`H S% L%`, also `hsl(H S% L%)`, commas or bare numbers) or Hex (`#rgb`, `#rrggbb`, with or without `#`). Hex turns into
// HSL; the palette stores whole numbers (hue 0..359, saturation and lightness 0..100), so a Hex colour lands on the nearest such
// HSL and its Hex round trip may differ by a step or two per channel. Plain TypeScript, no DOM.
import type { Hsl } from "./palette";

const whole = (v: number): number => Math.round(v);

/** `#rgb` / `#rrggbb` (the `#` optional) as [r, g, b] 0..255; null when it is not one */
export function parseHex(text: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!m) return null;
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join("") : m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** RGB 0..255 as whole-number HSL (hue 0..359) */
export function rgbToHsl([r, g, b]: [number, number, number]): Hsl {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h: whole(h) % 360, s: whole(s * 100), l: whole(l * 100) };
}

/** HSL as `#rrggbb` */
export function hslToHex({ h, s, l }: Hsl): string {
  const S = s / 100, L = l / 100, k = (n: number) => (n + h / 30) % 12, a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => whole(v * 255).toString(16).padStart(2, "0")).join("");
}

/** `H S% L%` (the skins' token format; `%` optional), `hsl(...)`, commas allowed; whole numbers in range, else null */
export function parseHsl(text: string): Hsl | null {
  const t = text.trim().replace(/^hsla?\(\s*(.*?)\s*\)$/i, "$1");
  const m = /^(-?[\d.]+)(?:deg)?\s*[\s,]\s*([\d.]+)%?\s*[\s,]\s*([\d.]+)%?$/i.exec(t);
  if (!m) return null;
  const [h, s, l] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (![h, s, l].every(Number.isFinite) || h < 0 || h > 360 || s > 100 || l > 100) return null;
  return { h: whole(h) % 360, s: whole(s), l: whole(l) };
}

/** what the field shows: the token format */
export const formatHsl = ({ h, s, l }: Hsl): string => `${h} ${s}% ${l}%`;

/** a typed or pasted colour: HSL first, then Hex; `from` says which it was */
export function parseColour(text: string): { hsl: Hsl; from: "hsl" | "hex" } | null {
  const hsl = parseHsl(text);
  if (hsl) return { hsl, from: "hsl" };
  const rgb = parseHex(text);
  return rgb ? { hsl: rgbToHsl(rgb), from: "hex" } : null;
}
