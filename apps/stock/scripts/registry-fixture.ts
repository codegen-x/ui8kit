// Refresh fixtures/registry-blocks.json from the live registry: the registry:block names every one of the 8 runtime roots lists.
// Never hand-edit the fixture: a name the live registry does not serve makes install.test.ts pass while `npx ui8kit add` 404s.
// Run: bun scripts/registry-fixture.ts (writes) | bun scripts/registry-fixture.ts --check (exit 1 when the fixture differs).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REGISTRY_URL, RUNTIMES } from "../src/lib/install";

const FILE = join(import.meta.dir, "fixtures", "registry-blocks.json");
const per = await Promise.all(RUNTIMES.map(async (rt) => {
  const r = await fetch(`${REGISTRY_URL}/${rt}/index.json`);
  if (!r.ok) throw new Error(`${rt}/index.json: ${r.status}`);
  const j = (await r.json()) as { components: { name: string; type: string }[] };
  return new Set(j.components.filter((c) => c.type === "registry:block").map((c) => c.name));
}));
const names = [...per[0]!].filter((n) => per.every((s) => s.has(n))).sort();
const partial = [...new Set(per.flatMap((s) => [...s]))].filter((n) => !names.includes(n)).sort();
const old = JSON.parse(readFileSync(FILE, "utf8")) as { names: string[] };
const missing = old.names.filter((n) => !names.includes(n));
if (process.argv.includes("--check")) {
  if (missing.length || partial.length) { console.error(`not served on all ${RUNTIMES.length} runtimes: ${[...missing, ...partial].join(", ")}`); process.exit(1); }
  console.log(`fixture ok: ${old.names.length} names served on all ${RUNTIMES.length} runtimes`);
} else {
  const out = { source: `${REGISTRY_URL}/<runtime>/index.json`, fetched: new Date().toISOString().slice(0, 10), note: `registry:block names served by all ${RUNTIMES.length} runtime roots (${names.length}); written by scripts/registry-fixture.ts`, names };
  writeFileSync(FILE, JSON.stringify(out, null, 1) + "\n");
  console.log(`wrote ${names.length} names; dropped ${missing.join(", ") || "none"}; partial ${partial.join(", ") || "none"}`);
}
