// compose-gen check: the groups ported from the former `xgen check`. Each returns a list of problems; a group passes when it is empty.
import { authoredDirs, stringify } from "../../../screens/src/authored";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCtx, result, type Ctx, type CheckResult } from "./context";
import { checkRegistry, checkThemes, checkRoutes, checkVersions } from "./catalog";
import { checkDictionary } from "./dictionary";
import { checkText } from "./text";
import { checkDead, checkDuplicates, checkStructure } from "./audit";
import { checkReadability } from "./readability";

export * from "./context";
export { checkRegistry, checkThemes, checkRoutes, checkVersions, hostedScreens, COVERAGE_DOC } from "./catalog";
export { checkDictionary, dictionaryUse } from "./dictionary";
export { checkText, cyrillicLine } from "./text";
export { checkDead, checkDuplicates, checkStructure, cycles, sameKey } from "./audit";
export { checkReadability, measure, readabilityProblems, kebab, READABILITY } from "./readability";

/** the stored specs (specs/{organisms,parts,patterns,blocks,presets,screens}) are the output of the builder (screens/src/authoring) */
export function checkAuthored(ctx: Ctx, write = false, writeFile?: (f: string, body: string) => void): CheckResult {
  const problems: string[] = [];
  let n = 0;
  for (const [dir, list] of authoredDirs()) for (const spec of list) {
    const file = join(ctx.root, "specs", dir, `${spec.id.split(".")[1]}.json`), body = stringify(spec);
    n++;
    if (!existsSync(file) || readFileSync(file, "utf8") !== body) { if (write && writeFile) writeFile(file, body); else problems.push(`specs/${dir}/${spec.id}: differs from the builder (run bun packages/compose-gen/check.ts --write)`); }
  }
  return result("authored", `${n} authored specs equal what the builder in screens/src/authoring produces`, problems);
}

export function schemaGroup(ctx: Ctx): CheckResult {
  return result("schema", "organism, block, screen, preset, recipe, fixture, dictionary and app files match their JSON Schemas", ctx.problems);
}

export const GROUPS = [schemaGroup, checkRegistry, checkThemes, checkRoutes, checkDictionary, checkText, checkDead, checkDuplicates, checkReadability, checkStructure, checkVersions] as const;

export function runChecks(ctx = loadCtx()): CheckResult[] {
  return [checkAuthored(ctx), ...GROUPS.map((g) => g(ctx))];
}
