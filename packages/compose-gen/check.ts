// compose-gen check: the stored specs equal the builder (screens/src/authoring), and the groups ported from the former `xgen check`
// (schema, registry, themes, routes, dictionary, text, dead, duplicates, readability, structure, versions) hold.
//   bun packages/compose-gen/check.ts            run every group, exit 1 on a problem
//   bun packages/compose-gen/check.ts --write    rewrite the stored specs and docs/vibeui-coverage.md from the builder first
//   bun packages/compose-gen/check.ts --write --no-check   only rewrite them (the first step of `bun run build`)
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { coverageMarkdown } from "./screens/src/index";
import { checkAuthored, GROUPS, loadCtx, COVERAGE_DOC, type CheckResult } from "./check/src/groups/index";

const write = process.argv.includes("--write");
if (write) checkAuthored(loadCtx(), true, writeFileSync);
const ctx = loadCtx();
if (write) writeFileSync(join(ctx.root, COVERAGE_DOC), coverageMarkdown(ctx.inputs.blocks.map((b) => b.value)));
if (process.argv.includes("--no-check")) { console.log("compose-gen: authored specs and the coverage document written"); process.exit(0); }
const results: CheckResult[] = [checkAuthored(ctx), ...GROUPS.map((g) => g(ctx))];
let bad = 0;
for (const r of results) {
  console.log(`${r.problems.length ? "FAIL" : "ok  "}  compose-gen ${r.name.padEnd(11)} ${r.what}`);
  for (const p of r.problems.slice(0, 25)) console.log(`        ${p}`);
  if (r.problems.length > 25) console.log(`        ... and ${r.problems.length - 25} more`);
  bad += r.problems.length;
}
console.log(bad ? `compose-gen check: ${bad} problem(s)` : `compose-gen check: ok (${results.length} groups)`);
process.exit(bad ? 1 : 0);
