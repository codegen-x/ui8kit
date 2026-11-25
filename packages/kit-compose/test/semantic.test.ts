// The semantic class mode of the templ runtime (compose.SetClassMode, orgutils SetClassMode): the Go tests of the
// generated compose package (compose_semantic_test.go) and of the organism helpers (runtimes/templ/assets/go).
import { test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dir, "..");
const RT = path.resolve(ROOT, "../compose-gen/runtimes");
const REQUIRED = process.env.UI8KIT_REQUIRE_ALL_RUNTIMES === "1";
const hasGo = spawnSync("go", ["version"]).status === 0;
const env = { ...process.env, GOFLAGS: "-mod=mod" };
const run = hasGo || REQUIRED ? test : test.skip;

run("templ compose: Rc in ClassesSemantic, unique names, SemanticRules", () => {
  if (!hasGo) throw new Error("go not found");
  execFileSync("go", ["test", "./src/compose/"], { cwd: path.join(ROOT, "templ"), env, stdio: ["ignore", "pipe", "inherit"] });
}, 120_000);

run("templ orgutils: Cnv joins in ClassesSemantic, merges in ClassesUtilities", () => {
  if (!hasGo) throw new Error("go not found");
  const tmp = mkdtempSync(path.join(tmpdir(), "semantic-orgutils-"));
  try {
    const src = path.join(RT, "templ/assets/go");
    mkdirSync(path.join(tmp, "uiutils"));
    for (const f of readdirSync(src).filter((f) => f.endsWith(".go"))) cpSync(path.join(src, f), path.join(tmp, "uiutils", f));
    writeFileSync(path.join(tmp, "go.mod"), readFileSync(path.join(ROOT, "templ/go.mod"), "utf8").replace(/^module .*$/m, "module probe"));
    cpSync(path.join(ROOT, "templ/go.sum"), path.join(tmp, "go.sum"));
    execFileSync("go", ["test", "./uiutils/"], { cwd: tmp, env, stdio: ["ignore", "pipe", "inherit"] });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}, 120_000);
