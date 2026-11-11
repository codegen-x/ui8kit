// Thumbnails of the Stock assets: public/thumbs/<id>.webp (served by the app at thumbs/...), written on demand by
// scripts/thumbs.ts from the live render (#/frame/<id>); build-index adds `thumb` to an asset whose file exists.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const THUMBS_DIR = join(import.meta.dir, "..", "..", "public", "thumbs");
/** the picture: the top 1280x800 of the render at half scale (640x400, the 16:10 of the Stock cards), WebP quality 70 */
export const THUMB = { width: 1280, height: 800, scale: 0.5, quality: 70 } as const;

/** file name of an asset id: block.about/split -> block.about--split.webp */
export const thumbFile = (id: string): string => `${id.replace(/\//g, "--").replace(/[^a-z0-9.-]/gi, "_")}.webp`;

/** the asset's thumbnail as a path relative to the app root, versioned by its content (thumbs/x.webp?v=<sha8>), or null */
export function thumbOf(id: string, dir = THUMBS_DIR): string | null {
  const file = join(dir, thumbFile(id));
  if (!existsSync(file)) return null;
  return `thumbs/${thumbFile(id)}?v=${createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8)}`;
}
