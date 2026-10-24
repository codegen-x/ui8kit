// compose-gen e2e: every screen in every built host (apps/host-*/dist, `bun run build:hosts` first) at /<screen>/: its scenario, screenshots,
// the DOM of the svelte, react, vue and solid hosts compared in the same states, HTML5 validity of every state (rules/html-validate.json).
// COMPOSE_E2E_ONLY=site,plans (screen keys) or host-svelte (a host) narrows the run; --shots <dir> (default shots/).
import { join, resolve } from "node:path";
import { runE2e } from "./check/src/e2e/index";

const workspace = resolve(import.meta.dir, "../..");
const at = process.argv.indexOf("--shots");
const report = await runE2e(workspace, at > 0 ? resolve(process.argv[at + 1]!) : join(workspace, "shots"));
let bad = 0;
for (const r of report.results) {
  console.log(`${r.failures.length ? "FAIL" : "ok  "}  ${r.name.padEnd(12)} ${r.steps} steps`);
  for (const f of r.failures) console.log(`        ${f}`);
  bad += r.failures.length;
}
console.log(`${report.pair.differences.length ? "FAIL" : "ok  "}  pair         DOM of the svelte, react, vue and solid hosts compared in ${report.pair.states} states`);
for (const d of report.pair.differences) console.log(`        ${d}`);
bad += report.pair.differences.length;
console.log(`${report.html.problems.length ? "FAIL" : "ok  "}  html         HTML5 validity (rules/html-validate.json) of ${report.html.states} states, ${report.html.documents} distinct documents`);
for (const d of report.html.problems) console.log(`        ${d}`);
for (const [rule, n] of Object.entries(report.html.warnings)) console.log(`  warn  html         ${rule}: ${n} (in states, rules/html-validate.json)`);
bad += report.html.problems.length;
console.log(`compose-gen e2e: ${report.results.length} runs, ${report.shots.length} screenshots`);
console.log(bad ? `compose-gen e2e: ${bad} problem(s)` : "compose-gen e2e: ok");
process.exit(bad ? 1 : 0);
