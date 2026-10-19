#!/usr/bin/env node
// Fails fast when the ui8kit/codegen submodule is missing: xgen/specs/ui and xgen/specs/assets are symlinks into vendor/codegen.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const isDir = (p) => { try { return fs.statSync(path.join(repo, p)).isDirectory(); } catch { return false; } };
const missing = ["vendor/codegen/xgen/specs/ui", "xgen/specs/ui", "xgen/specs/assets"].filter((p) => !isDir(p));
if (missing.length) {
  console.error(`vendor-guard: not a directory: ${missing.join(", ")}
  the bricks come from the ui8kit/codegen submodule through symlinks:
    git submodule update --init          (or clone with --recurse-submodules)
  on Windows enable symlinks first: Developer Mode + git config core.symlinks true (or use WSL), then check out again`);
  process.exit(1);
}
