// The catalog groups of compose-gen check (ported from `compose-gen check`): registry (the 92 layouts of the reference catalog),
// themes (every block is used by a theme screen), routes (screen menus and the hosts that serve them) and versions.
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { blockKey, CONTRACT_PATTERNS, coverageMarkdown, coverageProblems, themeApps, themeTexts, type AppSpec, type ScreenSpec } from "../../../screens/src/index";
import { portableTo } from "../../../spec/src/index";
import { versionProblem, composeGenPaths } from "../../../schema/src/index";
import { result, type Ctx, type CheckResult } from "./context";

export const COVERAGE_DOC = "docs/vibeui-coverage.md";
export const JS_RUNTIMES = ["svelte", "react", "vue", "solid"] as const;

export function checkRegistry(ctx: Ctx): CheckResult {
  const blocks = ctx.inputs.blocks.map((b) => b.value);
  const patterns = new Set(ctx.inputs.organisms.filter((o) => o.value.id.startsWith("pattern.")).map((o) => o.value.id.slice("pattern.".length)));
  const problems = coverageProblems(blocks, patterns, new Set(CONTRACT_PATTERNS));
  const file = join(ctx.root, COVERAGE_DOC);
  if (!existsSync(file)) problems.push(`packages/compose-gen/${COVERAGE_DOC}: missing; run bun packages/compose-gen/check.ts --write`);
  else if (readFileSync(file, "utf8") !== coverageMarkdown(blocks)) problems.push(`packages/compose-gen/${COVERAGE_DOC}: differs from the registry (screens/src/authoring/gallery/coverage.ts); run bun packages/compose-gen/check.ts --write`);
  return result("registry", `the ${blocks.length} layouts of the reference catalog map to existing blocks, variants and contracts; the coverage document is the one the registry writes`, problems);
}

export function checkThemes(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const ids = new Set(ctx.inputs.screens.map((s) => s.value.id));
  const used = new Set<string>(["navbar"]);
  for (const app of themeApps) {
    if (!ids.has(`screen.theme-${app.name}`)) problems.push(`theme ${app.name}: no screen spec screen.theme-${app.name}`);
    used.add(app.footer.split(".")[0]!);
    for (const p of app.pages) for (const r of [p.lead, ...p.rest]) used.add(r.split(".")[0]!);
  }
  for (const b of ctx.inputs.blocks) { const k = blockKey(b.value); if (!used.has(k)) problems.push(`block ${k}: not used by any theme screen; add it to a page in screens/src/authoring/screens/themes.ts`); }
  const dict = (ctx.inputs.dictionary.value as { pages?: unknown }).pages;
  if (JSON.stringify(dict) !== JSON.stringify({ ...themeTexts() })) problems.push("content/ui/en.json: `pages` differs from themeTexts()");
  const ports = ctx.apps.map((a) => a.app.port);
  for (const p of new Set(ports)) if (ports.filter((x) => x === p).length > 1) problems.push(`port ${p} is used by more than one host app`);
  return result("themes", "every theme is a screen spec, every block is used by a theme, page texts match the dictionary, host ports are unique", [...new Set(problems)]);
}

/** the screens a host serves: its list, or every screen portable to its runtime for ["*"] (the rule of kit-compose/src/hosts.ts) */
export function hostedScreens(app: AppSpec, all: ScreenSpec[]): { screens: ScreenSpec[]; missing: string[] } {
  if (app.screens.includes("*")) return { screens: all.filter((s) => portableTo(s.portable as never, app.runtime as never) === true), missing: [] };
  const screens: ScreenSpec[] = [], missing: string[] = [];
  for (const id of app.screens) { const s = all.find((x) => x.id === id); if (s) screens.push(s); else missing.push(id); }
  return { screens, missing };
}

export function checkRoutes(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const dict = ctx.inputs.dictionary.value;
  const leaf = (key: string): boolean => typeof key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), dict) === "string";
  for (const { file, value: s } of ctx.inputs.screens) {
    const at0 = relative(ctx.workspace, file);
    const menu = s.menu ?? [];
    if (s.nav && menu.length === 0) problems.push(`${at0}: the screen reads the menu (nav) but has no "menu"`);
    if (menu.length && !s.nav) problems.push(`${at0}: a "menu", but the screen shows no menu (nav)`);
    const paths = new Set(s.routes.map((r) => r.path));
    const seen = { id: new Set<string>(), path: new Set<string>() };
    menu.forEach((r, i) => {
      const at = `${at0}: menu[${i}] (${r.id})`;
      if (seen.id.has(r.id)) problems.push(`${at}: the id is used twice`);
      if (seen.path.has(r.path)) problems.push(`${at}: the path "${r.path}" is used twice`);
      seen.id.add(r.id); seen.path.add(r.path);
      if (!paths.has(r.path)) problems.push(`${at}: the screen has no route "${r.path}"`);
      if (!leaf(r.titleKey)) problems.push(`${at}: titleKey ${r.titleKey} is not a text of content/ui/en.json`);
    });
  }
  const all = ctx.inputs.screens.map((s) => s.value);
  for (const h of ctx.apps) for (const id of hostedScreens(h.app, all).missing) problems.push(`${relative(ctx.workspace, h.file)}: screen ${id} does not exist`);
  for (const rt of JS_RUNTIMES) {
    const hosts = ctx.apps.filter((a) => a.app.runtime === rt);
    if (!hosts.length) { problems.push(`no host app for ${rt}`); continue; }
    const served = new Set(hosts.flatMap((h) => hostedScreens(h.app, all).screens.map((s) => s.id)));
    for (const s of all) if (portableTo(s.portable as never, rt) === true && !served.has(s.id)) problems.push(`${s.id}: portable to ${rt} but no ${rt} host serves it`);
  }
  return result("routes", "every screen menu leads to routes of its screen and names texts of the dictionary, a screen with nav has a menu, and the hosts serve every screen in every JS runtime", problems);
}

export function checkVersions(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const specs: Array<{ file: string; value: { specVersion?: unknown } }> = [
    ...ctx.inputs.organisms, ...ctx.inputs.screens, ...ctx.inputs.blocks, ...ctx.apps.map((a) => ({ file: a.file, value: a.app as { specVersion?: unknown } })),
  ];
  for (const s of specs) { const why = versionProblem(s.value); if (why) problems.push(`${relative(ctx.workspace, s.file)}: ${why}`); }
  if (!existsSync(join(composeGenPaths(ctx.root).docs, "migrations.md"))) problems.push("packages/compose-gen/docs/migrations.md: missing; it holds the log of the versions");
  return result("versions", `every spec (${specs.length}) is on the current specVersion, and the migrations are documented`, problems);
}
