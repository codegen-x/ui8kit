// The `readability` group of compose-gen check (ported from `compose-gen check`): generated organisms and host screens stay short enough
// to read in one sitting. Read from disk (kept equal to the build by `bun run compose:check`): packages/kit-compose/<runtime>/src/
// {blocks,components} and apps/host-<runtime>/gen/screens. READABILITY_ALLOW is a ratchet: a file may not get worse, and once it
// gets better its entry must be lowered (or removed).
import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { result, walk, type Ctx, type CheckResult } from "./context";

/** `props`: the limit of the counted props of an organism (blocking); `propsTarget`: the aim (owner decision t95u: limit 20, aim 15).
 *  An organism over the aim and within the limit is a note of the group (printed as `warn`, not a problem: the gate stays green). */
export const READABILITY = { fileLines: 150, screenLines: 600, fileBytes: 8000, lineChars: 160, props: 20, propsTarget: 15 } as const;
export interface Measure { lines?: number; long?: number; bytes?: number; props?: number }
export type Allowance = Measure & { why: string };
export const READABILITY_ALLOW: Record<string, Allowance> = {
  "footer-split": { lines: 152, why: "the optional picture pair (image, imageAlt) of the split layouts on top of 150 lines; split pending: the layouts into parts" },
  "screen:blocks-screen": { lines: 653, why: "one import and one route per block of the gallery (154 blocks with the simple line wave 3); split pending: the gallery index by theme" },
  "hero-classic": { lines: 151, why: "the optional picture pair (image, imageAlt) on top of 150 lines; split pending: the media kinds into a part" },
};

/** HeroSection.svelte, hero-section.tsx -> hero-section: one key for every runtime and naming style */
export const kebab = (stem: string): string => stem.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
/** props that are not counted: the landmark name, and the optional picture pair of a section (`image`, `imageAlt`; flat on purpose, ADR 0049 of the chat) */
const UNCOUNTED = ["landmarkLabel", "image", "imageAlt"];
const COMPONENT = /\.(svelte|vue|tsx)$/;
const SKIP = [/\.types\.ts$/, /\/index\.ts$/];

/** the measures over the limits, per component key (the worst of the runtimes) */
export function measure(ctx: Ctx, files?: Array<{ path: string; contents: string; screen: boolean }>): Record<string, Measure> {
  const out: Record<string, Measure> = {};
  const put = (key: string, m: Measure): void => { const o = (out[key] ??= {}); for (const [k, v] of Object.entries(m) as Array<[keyof Measure, number]>) o[k] = Math.max(o[k] ?? 0, v); };
  const list = files ?? [
    ...["react", "svelte", "vue", "solid"].flatMap((r) => ["blocks", "components"].flatMap((d) => walk(join(ctx.workspace, "packages/kit-compose", r, "src", d)))).map((p) => ({ path: p, screen: false })),
    ...ctx.apps.flatMap((a) => walk(join(a.dir, "gen", "screens"))).map((p) => ({ path: p, screen: true })),
  ].filter((f) => COMPONENT.test(f.path) && !SKIP.some((r) => r.test(f.path))).map((f) => ({ ...f, contents: readFileSync(f.path, "utf8") }));
  for (const f of list) {
    const lines = f.contents.split("\n");
    const stem = f.path.split("/").pop()!.replace(COMPONENT, "");
    const key = f.screen ? `screen:${f.path.split("/screens/")[1]!.replace(COMPONENT, "").split("/").map(kebab).join("/")}` : kebab(stem);
    const m: Measure = {};
    if (lines.length > (f.screen ? READABILITY.screenLines : READABILITY.fileLines)) m.lines = lines.length;
    const long = lines.filter((l) => l.length > READABILITY.lineChars).length;
    if (long) m.long = long;
    if (!f.screen && f.contents.length > READABILITY.fileBytes) m.bytes = f.contents.length;
    put(key, m);
  }
  for (const o of ctx.inputs.organisms) { const n = o.value.props.filter((p) => !UNCOUNTED.includes(p.name)).length; if (n > READABILITY.props) put(kebab(o.value.name), { props: n }); }
  for (const k of Object.keys(out)) if (!Object.keys(out[k]!).length) delete out[k];
  return out;
}

const WHAT: Record<keyof Measure, string> = { lines: "lines", long: `lines over ${READABILITY.lineChars} characters`, bytes: "bytes", props: "props" };

/** problems of a measure against an allowlist */
export function readabilityProblems(now: Record<string, Measure>, allow: Record<string, Measure>): string[] {
  const problems: string[] = [];
  for (const key of new Set([...Object.keys(now), ...Object.keys(allow)])) {
    const m = now[key] ?? {}, a = allow[key] ?? {};
    for (const k of Object.keys(WHAT) as Array<keyof Measure>) {
      const got = m[k] ?? 0, allowed = a[k] ?? 0;
      if (got > allowed) problems.push(`${key}: ${got} ${WHAT[k]}${allowed ? ` (allowed ${allowed})` : ""}: split it into smaller components`);
      else if (got < allowed) problems.push(`READABILITY_ALLOW ${key} ${k} is now ${got || "within the limit"}; lower the allowance from ${allowed}`);
    }
  }
  return problems;
}

/** the organisms over the props aim (READABILITY.propsTarget) and within the limit: notes, not problems */
export function propsNotes(ctx: Ctx): string[] {
  const out: string[] = [];
  for (const o of ctx.inputs.organisms) {
    const n = o.value.props.filter((p) => !UNCOUNTED.includes(p.name)).length;
    if (n > READABILITY.propsTarget && n <= READABILITY.props) out.push(`${kebab(o.value.name)}: ${n} props (aim ${READABILITY.propsTarget}, limit ${READABILITY.props})`);
  }
  return out.sort();
}

export function checkReadability(ctx: Ctx): CheckResult {
  const l = READABILITY;
  const what = `generated organisms up to ${l.fileLines} lines, ${l.fileBytes} bytes, host screens up to ${l.screenLines} lines, lines up to ${l.lineChars} characters, organisms up to ${l.props} props, aim ${l.propsTarget} (ratchet: READABILITY_ALLOW)`;
  return { ...result("readability", what, readabilityProblems(measure(ctx), READABILITY_ALLOW)), notes: propsNotes(ctx) };
}
export const relToWs = (ctx: Ctx, f: string): string => relative(ctx.workspace, f);
