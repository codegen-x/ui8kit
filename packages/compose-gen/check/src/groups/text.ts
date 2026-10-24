// The `text` group of compose-gen check (ported from `compose-gen check`): no Cyrillic in any tracked file (sources, generated code,
// content, docs, plans) outside CYRILLIC_ALLOW; every content key a screen reads exists; status words of badge columns exist.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { screenContentRefs, sourcesOf, type OrganismSpec } from "../../../screens/src/index";
import { result, walk, type Ctx, type CheckResult } from "./context";

const CYRILLIC = /[\u0400-\u04FF]/;
/** genuine locale resources that may hold Cyrillic (repo-relative paths). Empty: the repository is English-only. */
export const CYRILLIC_ALLOW: readonly string[] = [];

/** every tracked file (git ls-files); outside a git checkout, the source roots on disk */
export function trackedFiles(workspace: string): string[] {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: workspace, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 });
    return out.split("\0").filter(Boolean).map((f) => join(workspace, f)).filter((f) => existsSync(f) && statSync(f).isFile());
  } catch {
    return ["packages", "apps", "plan", "docs", "rules", "README.md", "AGENTS.md"].map((r) => join(workspace, r)).filter(existsSync).flatMap((r) => (statSync(r).isDirectory() ? walk(r) : [r]));
  }
}

/** the first line with Cyrillic of a text, 1-based, or 0 */
export const cyrillicLine = (text: string): number => text.split("\n").findIndex((l) => CYRILLIC.test(l)) + 1;

export function checkText(ctx: Ctx): CheckResult {
  const problems: string[] = [];
  const allow = new Set(CYRILLIC_ALLOW);
  for (const f of trackedFiles(ctx.workspace)) {
    const rel = relative(ctx.workspace, f).split("\\").join("/");
    if (allow.has(rel)) continue;
    const buf = readFileSync(f);
    if (buf.includes(0)) continue; // binary
    const line = cyrillicLine(buf.toString("utf8"));
    if (line) problems.push(`${rel}:${line}: Cyrillic text (the repository is English-only; genuine locale files go in CYRILLIC_ALLOW)`);
  }
  const dict = ctx.inputs.dictionary.value as Record<string, unknown>;
  const has = (path: string): unknown => path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), dict);
  const orgs = Object.fromEntries(ctx.inputs.organisms.map((o) => [o.value.name, o.value as OrganismSpec]));
  for (const s of ctx.inputs.screens) {
    for (const k of screenContentRefs(s.value)) if (has(k) === undefined) problems.push(`${s.value.name}: content key ui.${k} is not in content/ui/en.json`);
    for (const c of s.value.list?.columns ?? []) if (typeof has(c.label) !== "string") problems.push(`${s.value.name}: column ${c.id} label ui.${c.label} is not in content`);
    // labels handed to organisms carry every field of the labels record
    const visit = (n: unknown): void => {
      if (!n || typeof n !== "object") return;
      const o = n as Record<string, unknown>;
      if (typeof o.organism === "string") {
        const labels = (o.props as Record<string, { $?: string }> | undefined)?.labels;
        const rec = orgs[o.organism]?.records["PricingCardLabels"] ?? [];
        if (labels?.$?.startsWith("ui.")) {
          const sub = has(labels.$.slice(3)) as Record<string, unknown> | undefined;
          for (const f of rec) if (typeof sub?.[f.name] !== "string") problems.push(`${s.value.name}: ${labels.$}.${f.name} is missing (labels of ${o.organism})`);
        }
      }
      for (const v of Object.values(o)) Array.isArray(v) ? v.forEach(visit) : visit(v);
    };
    visit(s.value.layout); visit(s.value.parts ?? {}); visit(s.value.areas);
    // a badge column shows ui.status.<value>: every value in the fixture has a word
    for (const src of sourcesOf(s.value)) {
      const col = ctx.inputs.collections.find((c) => c.value.collection === src.collection);
      const statusPath = src.fields["status"];
      if (!col || !statusPath) continue;
      for (const e of col.value.entries) {
        const v = statusPath.split(".").reduce<unknown>((x, k) => (x as Record<string, unknown> | undefined)?.[k], e);
        if (typeof v === "string" && typeof has(`status.${v}`) !== "string") problems.push(`fixture ${col.value.collection}: status "${v}" has no word in ui.status`);
      }
    }
  }
  return result("text", "no Cyrillic in tracked files; every text of a view is a key that exists in content/ui/en.json", problems);
}
