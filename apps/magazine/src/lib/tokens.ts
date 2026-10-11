// The skin's colour tokens as HSL, read from the real CSS: a hidden probe carries data-skin (and the dark class for the dark twin),
// the computed colour of each variable goes through the canvas (any CSS colour → RGB) and then to HSL. The values are what a skin
// writes into a project: `--primary: 262 83% 58%`.
import { rgb } from "@ui8kit/panorama/colors";

export const TOKEN_NAMES = ["background", "foreground", "card", "primary", "primary-foreground", "secondary", "accent", "muted", "border", "ring"] as const;
export type Hsl = { h: number; s: number; l: number };
export type Token = { name: string; hsl: Hsl; css: string; value: string };

export function toHsl([r, g, b]: [number, number, number]): Hsl {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d > 1e-9) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** the tokens of a skin in one theme */
export function skinTokens(skin: string, dark: boolean): Token[] {
  const wrap = document.createElement("div");
  wrap.className = dark ? "dark" : "";
  wrap.dataset.theme = dark ? "dark" : "light";
  wrap.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden";
  document.body.appendChild(wrap);
  const probe = document.createElement("div");
  probe.dataset.skin = skin;
  wrap.appendChild(probe);
  const out = TOKEN_NAMES.map((name) => {
    probe.style.background = `var(--${name})`;
    const c = rgb(getComputedStyle(probe).backgroundColor);
    const hsl = toHsl(c);
    const value = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    return { name, hsl, value, css: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)` };
  });
  wrap.remove();
  return out;
}
