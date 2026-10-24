// What every group of compose-gen check reads: the loaded inputs (specs, fixtures, dictionary), the host apps and the paths.
// The successor of the `Plan` of the former `compose-gen check`: no bricks (the primitives are UI8Kit 3, installed by the CLI) and no
// in-memory build: the generated organisms and screens are read from disk (`bun run compose:check` keeps them equal to the build).
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadInputs, findApps, loadApp, APP_FILE, type Inputs, type AppSpec } from "../../../screens/src/index";

export interface CheckResult { name: string; what: string; problems: string[] }
export const result = (name: string, what: string, problems: string[]): CheckResult => ({ name, what, problems });

export interface HostApp { dir: string; file: string; app: AppSpec }
export interface Ctx {
  /** packages/compose-gen: specs, fixtures, content, docs */
  root: string;
  /** the repository */
  workspace: string;
  inputs: Inputs;
  apps: HostApp[];
  /** problems of loading (schemas of the specs, apps) */
  problems: string[];
}

export function loadCtx(root = resolve(import.meta.dir, "../../.."), workspace = resolve(root, "../..")): Ctx {
  const inputs = loadInputs(root);
  const problems = [...inputs.problems];
  const apps = findApps(workspace).map((dir) => {
    const file = join(dir, APP_FILE);
    const { app, problems: p } = loadApp(file);
    problems.push(...p);
    return { dir, file, app };
  });
  return { root, workspace, inputs, apps, problems };
}

const SKIP = new Set(["node_modules", "dist", ".git", "shots"]);
/** every file under dir (no tool output) */
export const walk = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir).sort().flatMap((n) => (SKIP.has(n) ? [] : statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)])) : [];

type Tree = Record<string, unknown>;
export const isTree = (v: unknown): v is Tree => !!v && typeof v === "object" && !Array.isArray(v);
export const getAt = (d: unknown, key: string): unknown => key.split(".").reduce<unknown>((o, k) => (isTree(o) ? o[k] : undefined), d);
export function leavesOf(d: unknown, prefix = ""): string[] {
  if (!isTree(d)) return [prefix];
  return Object.entries(d).flatMap(([k, v]) => leavesOf(v, prefix ? `${prefix}.${k}` : k));
}
