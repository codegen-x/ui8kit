#!/usr/bin/env node
// UI8Kit 3: every packages/kit/<runtime> is installed by the ui8kit CLI (init + add --all) from @ui8kit/registry.
// `ui8kit check` (offline) fails on a missing, modified or mixed-version file against ui8kit.lock.json.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const kit = path.join(repo, "packages/kit");
const bin = path.join(repo, "node_modules/ui8kit/dist/index.js");
const runtimes = fs.readdirSync(kit).filter((d) => fs.existsSync(path.join(kit, d, "ui8kit.lock.json"))).sort();
if (!runtimes.length) { console.error("kit-check: no packages/kit/*/ui8kit.lock.json"); process.exit(1); }
let failed = 0;
for (const rt of runtimes) {
  const r = spawnSync(process.execPath, [bin, "check"], { cwd: path.join(kit, rt), encoding: "utf8" });
  const out = `${r.stdout}${r.stderr}`.trim().split("\n").pop();
  console.log(`kit-check ${rt}: ${out}`);
  if (r.status !== 0) failed++;
}
process.exit(failed ? 1 : 0);
