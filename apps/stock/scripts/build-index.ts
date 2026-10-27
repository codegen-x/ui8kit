// Build the Stock index: content/assets.v0.json (assets + resolved vocabulary + digest), content/previews.v0.json (what each
// card renders) and src/lib/collections.gen.ts (the data loaders of the previews).
//   bun scripts/build-index.ts           write the files
//   bun scripts/build-index.ts --check   fail when a file differs from a fresh build (the index is deterministic)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";
import { build, OUTPUTS, ROOT, serialise } from "./lib/build";

const check = process.argv.includes("--check");
const built = build();
const files = serialise(built);
let stale = 0;
for (const [k, text] of Object.entries(files) as [keyof typeof OUTPUTS, string][]) {
  const path = OUTPUTS[k];
  const now = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (now === text) continue;
  if (check) { console.error(`build-index: ${relative(ROOT, path)} is stale; run bun run --cwd apps/stock index`); stale++; }
  else writeFileSync(path, text);
}
const c = built.index.counts;
console.log(`build-index: ${built.index.assets.length} assets (${Object.entries(c).map(([k, v]) => `${k} ${v}`).join(", ")}), ${built.index.facets.length} facets, ${built.index.digest}${check ? (stale ? ", STALE" : ", up to date") : ""}`);
process.exit(stale ? 1 : 0);
