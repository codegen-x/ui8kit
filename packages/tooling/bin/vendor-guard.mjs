#!/usr/bin/env node
// Fails fast when the ui8kit/codegen submodule is missing: the bricks (xgen/specs/ui, xgen/specs/assets), the shared TS
// utilities (xgen/runtimes/core/assets/ts) and the base styles (kit.css, theme.css) are symlinks into vendor/codegen.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const isDir = (p) => { try { return fs.statSync(path.join(repo, p)).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return fs.statSync(path.join(repo, p)).isFile(); } catch { return false; } };
const styles = "xgen/runtimes/core/assets/styles";
const missing = [
  ...["vendor/codegen/xgen/specs/ui", "xgen/specs/ui", "xgen/specs/assets", "xgen/runtimes/core/assets/ts"].filter((p) => !isDir(p)),
  ...[`${styles}/kit.css`, `${styles}/theme.css`].filter((p) => !isFile(p)),
];
if (missing.length) {
  console.error(`vendor-guard: missing or not resolvable: ${missing.join(", ")}
  the bricks come from the ui8kit/codegen submodule through symlinks:
    git submodule update --init          (or clone with --recurse-submodules)
  on Windows enable symlinks first: Developer Mode + git config core.symlinks true (or use WSL), then check out again`);
  process.exit(1);
}
