// Colours read from CSS: any CSS colour string (oklch, hex, rgb) to RGB 0..1 through a 1×1 canvas, and the background of
// every skin in a theme (the placeholder of a card until its snapshot lands).
import { SKIN_IDS, type SkinId } from "../taste";

let ctx: CanvasRenderingContext2D | null = null;

export function rgb(css: string): [number, number, number] {
  ctx ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
}

/** the --background of every skin under the given theme, probed in a hidden element */
export function skinBackgrounds(dark: boolean): Record<SkinId, [number, number, number]> {
  const wrap = document.createElement("div");
  wrap.className = dark ? "dark" : "";
  wrap.dataset.theme = dark ? "dark" : "light";
  wrap.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden";
  document.body.appendChild(wrap);
  const out = {} as Record<SkinId, [number, number, number]>;
  for (const s of SKIN_IDS) {
    const probe = document.createElement("div");
    probe.dataset.skin = s;
    probe.style.background = "var(--background)";
    wrap.appendChild(probe);
    out[s] = rgb(getComputedStyle(probe).backgroundColor);
  }
  wrap.remove();
  return out;
}
