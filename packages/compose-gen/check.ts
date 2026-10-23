// compose-gen self-check: the specs stored in specs/{organisms,parts,patterns,blocks,presets,screens} are the output of the
// builder (screens/src/authoring). `bun check.ts` fails on a drift, `bun check.ts --write` rewrites them.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { authoredDirs, stringify } from "./screens/src/authored";

const bad: string[] = [];
let n = 0;
for (const [dir, list] of authoredDirs()) for (const spec of list) {
  const file = join(import.meta.dir, "specs", dir, `${spec.id.split(".")[1]}.json`), body = stringify(spec);
  n++;
  if (!existsSync(file) || readFileSync(file, "utf8") !== body) { bad.push(`${dir}/${spec.id}`); if (process.argv.includes("--write")) writeFileSync(file, body); }
}
if (bad.length && !process.argv.includes("--write")) { console.error(`compose-gen: ${bad.length} stored specs differ from the builder:\n${bad.join("\n")}`); process.exit(1); }
console.log(`compose-gen: ${n} authored specs ${bad.length ? `rewritten (${bad.length})` : "up to date"}`);
