// The Lucide glyphs (ISC license, https://lucide.dev): every icon of the pinned `lucide-static` package, by kebab-case name.
// One source for the props enum (apps/stock), the server runtimes (inline SVG from the generated data) and the JS runtimes,
// which render through the `lucide` package of the same version (packages/kit-compose/<rt>/package.json).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

export type LucideNode = [string, Record<string, string>];
const require = createRequire(import.meta.url);

/** the pinned Lucide version: lucide-static here, lucide in the JS runtime packages */
export const LUCIDE_VERSION: string = (JSON.parse(readFileSync(require.resolve("lucide-static/package.json"), "utf8")) as { version: string }).version;

let cache: Record<string, LucideNode[]> | undefined;
/** every glyph by kebab-case name, sorted by name: the nodes of <svg viewBox="0 0 24 24"> */
export function lucideIcons(): Record<string, LucideNode[]> {
  if (cache) return cache;
  const all = JSON.parse(readFileSync(require.resolve("lucide-static/icon-nodes.json"), "utf8")) as Record<string, LucideNode[]>;
  cache = Object.fromEntries(Object.keys(all).sort().map((n) => [n, all[n]!]));
  return cache;
}
