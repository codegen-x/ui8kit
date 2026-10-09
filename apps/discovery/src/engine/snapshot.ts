// Snapshot of a taste screen into a bitmap, without a screenshot library: the screen is mounted into a detached element,
// serialised to XHTML and drawn through an SVG <foreignObject> together with the app's own CSS (collected once from the
// document) and the latin face of the fonts it uses (embedded as data URLs, fetched once). Everything is a data URL, so the
// canvas stays untainted and can feed WebGL. The SVG is the desktop screen at its natural size (1440×1080, no viewBox, no scaling inside the SVG: WebKit
// ignores the viewBox scale for foreignObject content and shows only the top-left corner of the screen at 1:1, and the
// SVG size is also the viewport its media queries see). The downscale to the texture size is done by the canvas drawImage.
import { mount, unmount, type Component } from "svelte";
import { FONT_FILES, family, LATIN, type FontId } from "../fonts";
import { SCREEN_H, SCREEN_W } from "./grid";

let cssText: string | null = null;
const fontData = new Map<FontId, Promise<string>>();

/** the CSS of the document, minus @font-face (a snapshot carries its own faces); computed once per session */
export function collectCss(): string {
  if (cssText !== null) return cssText;
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of Array.from(rules)) if (!(r instanceof CSSFontFaceRule)) parts.push(r.cssText);
  }
  cssText = parts.join("\n");
  return cssText;
}

/** drop the cached CSS (the theme or the styles changed in dev) */
export function resetCss(): void { cssText = null; }

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

function fontUrl(id: FontId): Promise<string> {
  let p = fontData.get(id);
  if (!p) {
    p = fetch(FONT_FILES[id].latin).then((r) => r.blob()).then((b) => toDataUrl(new Blob([b], { type: "font/woff2" })));
    fontData.set(id, p);
  }
  return p;
}

async function fontFaces(ids: FontId[]): Promise<string> {
  const uniq = [...new Set(ids)];
  const urls = await Promise.all(uniq.map(fontUrl));
  return uniq.map((id, i) => `@font-face{font-family:${family(id)};font-weight:100 900;font-style:normal;src:url(${urls[i]}) format("woff2");unicode-range:${LATIN};}`).join("\n");
}

const xmlEscape = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** mount a component into a detached node and return its XHTML; nothing is laid out or painted in the page */
export function serialise<P extends Record<string, unknown>>(component: Component<P>, props: P): string {
  const host = document.createElement("div");
  const app = mount(component, { target: host, props });
  const ser = new XMLSerializer();
  const html = Array.from(host.childNodes).filter((n) => n.nodeType === 1).map((n) => ser.serializeToString(n)).join("");
  unmount(app);
  return html;
}

/** a small, fast, non-cryptographic hash (FNV-1a, 32 bit) as hex: the content address of a snapshot */
export function hash(s: string, seed = 0x811c9dc5): string {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

/** rasterise serialised XHTML at w×h; `dark` puts the frame under the kit's dark selectors (.dark / data-theme) */
export async function rasterise(html: string, fonts: FontId[], dark: boolean, w: number, h: number): Promise<HTMLCanvasElement> {
  const faces = await fontFaces(fonts);
  const css = xmlEscape(collectCss() + "\n" + faces);
  const theme = dark ? "dark" : "light";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SCREEN_W}" height="${SCREEN_H}">` +
    `<foreignObject x="0" y="0" width="${SCREEN_W}" height="${SCREEN_H}">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" class="${theme}" data-theme="${theme}" ` +
    `style="width:${SCREEN_W}px;height:${SCREEN_H}px;overflow:hidden;line-height:1.5;color-scheme:${theme}">` +
    `<style>${css}</style>${html}</div></foreignObject></svg>`;
  const img = new Image();
  img.decoding = "async";
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H, 0, 0, w, h);
  return canvas;
}

/** WebP at `quality`. A browser without WebP encoding (older Safari) silently returns PNG, which is far bigger: with `jpegFallback` (light profile) JPEG then. */
export async function toBlob(canvas: HTMLCanvasElement, quality = 0.86, jpegFallback = false): Promise<Blob> {
  const enc = (type: string, q: number) =>
    new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, q));
  const webp = await enc("image/webp", quality);
  if (webp.type === "image/webp" || !jpegFallback) return webp;
  return enc("image/jpeg", Math.min(quality + 0.05, 0.9));
}
