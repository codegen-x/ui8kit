// Shared by the check scripts of @ui8kit/xgen-tooling. A script runs with the working directory set to one workspace: an app (apps/<name>),
// a package (packages/<name>) or the repository root itself (only the root scripts/ folder is checked there).
//   APP      absolute path of the workspace being checked (process.cwd(), or APP_ROOT when set)
//   REPO     absolute path of the repository root (the folder with the workspaces package.json)
//   KIND     "apps", "packages" or "root"
//   HOST_DIR where raw host markup is allowed (relative to APP): packages/ui keeps it in src/ui, apps allow it nowhere
//   projectFile(name)   .project/<kind>/<name>/<file>: baselines and allow-lists per workspace live in the repo root, next to the shared .project material
import fs from "node:fs";
import path from "node:path";

export const APP = path.resolve(process.env.APP_ROOT ?? process.cwd());
export const REPO = (() => {
  for (let d = APP; ; d = path.dirname(d)) {
    try { if (JSON.parse(fs.readFileSync(path.join(d, "package.json"), "utf8")).workspaces) return d; } catch { /* no package.json here */ }
    if (path.dirname(d) === d) throw new Error(`no workspace root above ${APP}`);
  }
})();
const parts = path.relative(REPO, APP).split(path.sep);
export const KIND = APP === REPO ? "root" : parts[0] === "packages" ? "packages" : parts[0] === "apps" ? "apps" : "xgen";
// packages/svelte/ui -> svelte-ui
export const APP_NAME = parts.slice(1).join("-") || parts[0];
export const HOST_DIR = KIND === "packages" ? "src/ui" : null;
export const projectFile = (name) => path.join(REPO, ".project", KIND, KIND === "root" ? "" : APP_NAME, name);
