// `portable` of every spec is the fact of generation: a spec names a runtime `true` exactly where a file is generated for it.
// Organisms, parts and patterns: packages/kit-compose/<rt>/src/{blocks,components}/<file-name>.* (every runtime folder with src/blocks);
// screens: apps/host-<rt>/gen/screens/<Name>.* (every host app). A runtime added or dropped (a generator, a host) fails here until
// PORTABLE_ORGANISM / PORTABLE_SCREEN (compose-gen/screens/src/ir.ts) follow it and `bun packages/compose-gen/check.ts --write` reruns.
import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileName, ORGANISM_RUNTIMES, SCREEN_RUNTIMES } from "../../compose-gen/screens/src/ir";

const ROOT = join(import.meta.dir, "..", "..", "..");
const KIT = join(ROOT, "packages", "kit-compose"), SPECS = join(ROOT, "packages", "compose-gen", "specs"), APPS = join(ROOT, "apps");
type Spec = { id: string; name: string; portable: Record<string, unknown> };
const specs = (dir: string): Spec[] =>
  readdirSync(join(SPECS, dir)).filter((f) => f.endsWith(".json") && !f.endsWith(".variants.json")).map((f) => JSON.parse(readFileSync(join(SPECS, dir, f), "utf8")) as Spec);
const named = (s: Spec): string[] => Object.entries(s.portable).filter(([, v]) => v === true).map(([k]) => k).sort();
const stems = (dir: string): Set<string> => new Set(existsSync(dir) ? readdirSync(dir).filter((f) => !f.includes(".types.")).map((f) => f.split(".")[0]!) : []);

const kitRuntimes = readdirSync(KIT).filter((d) => existsSync(join(KIT, d, "src", "blocks"))).sort();
const hostRuntimes = readdirSync(APPS).filter((d) => d.startsWith("host-") && existsSync(join(APPS, d, "gen", "screens"))).map((d) => d.slice(5)).sort();

test("the runtime lists of the authored portable flags are the generated runtimes", () => {
  expect([...ORGANISM_RUNTIMES].sort()).toEqual(kitRuntimes);
  expect([...SCREEN_RUNTIMES].sort()).toEqual(hostRuntimes);
});

test("organisms, parts and patterns: portable names exactly the runtimes with a generated file", () => {
  const files = Object.fromEntries(kitRuntimes.map((rt) => [rt, new Set([...stems(join(KIT, rt, "src", "blocks")), ...stems(join(KIT, rt, "src", "components"))])]));
  for (const dir of ["organisms", "parts", "patterns"]) for (const s of specs(dir)) {
    const generated = kitRuntimes.filter((rt) => files[rt]!.has(fileName(s.name)));
    expect(named(s), `${s.id}: portable vs generated`).toEqual(generated.sort());
  }
});

test("screens: portable names exactly the runtimes whose host serves the screen", () => {
  const files = Object.fromEntries(hostRuntimes.map((rt) => [rt, stems(join(APPS, `host-${rt}`, "gen", "screens"))]));
  for (const s of specs("screens")) expect(named(s), `${s.id}: portable vs hosts`).toEqual(hostRuntimes.filter((rt) => files[rt]!.has(s.name)).sort());
});
