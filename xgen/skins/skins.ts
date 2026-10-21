// Skins as data: xgen/skins/<id>.json (schema: skin.schema.json, list and checksums: index.json) and the fonts they load,
// xgen/fonts/<id>.json (font.schema.json). This tool writes what the runtime reads from them:
//   xgen/runtimes/core/assets/styles/skins/<id>.css, .../skins/skins.json and packages/shared/app/src/runtime/skin-fonts.ts.
// The values are stored verbatim (colours, shadows, comments): nothing is recomputed, so the output is byte-for-byte the CSS
// the skins had before they became data. base.css, default.css and skins.css stay hand-written.
//   bun run skins build           validate, then write the files (and the checksums of index.json)
//   bun run skins build --check   validate and fail when a written file differs (run by `bun run check`)
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { SHARED_DIR, skinFontsSource } from "../runtimes/core/src/app-common";

const ROOT = join(import.meta.dir, "..", "..");
const SKINS = join(ROOT, "xgen", "skins");
const FONTS = join(ROOT, "xgen", "fonts");
const CSS_DIR = join(ROOT, "xgen", "runtimes", "core", "assets", "styles", "skins");

type Tokens = Record<string, string>;
export interface Skin {
  id: string; name: string; version: string;
  attribution: { source: string; license: string; upstream?: string; notice?: string };
  fonts: string[]; comment: string; scope: "any" | "root"; bodyTracking: boolean;
  light: Tokens; dark: Tokens; notes?: { light?: Tokens; dark?: Tokens };
}
export interface Font { id: string; family: string; provider: "google"; google: string; attribution: { source: string; license: string } }
export interface IndexEntry { id: string; name: string; version: string; file: string; sha256: string }

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;
const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex");

const block = (selector: string, tokens: Tokens, notes: Tokens = {}): string => {
  const lines = Object.entries(tokens).flatMap(([k, v]) => [...(notes[k] ? [notes[k]!] : []), `--${k}: ${v};`]);
  return `${selector} {\n${lines.map((l) => `  ${l.replace(/\n/g, "\n  ")}`).join("\n")}\n}\n`;
};

/** the CSS file of a skin */
export function skinCss(s: Skin): string {
  const sel = s.scope === "root" ? `:root[data-skin="${s.id}"]` : `[data-skin="${s.id}"]`;
  const dark = s.scope === "root" ? `${sel}:is(.dark, [data-theme="dark"])` : `:is(.dark, [data-theme="dark"]) ${sel},\n${sel}:is(.dark, [data-theme="dark"])`;
  return [
    `/*${s.comment}*/`,
    block(sel, s.light, s.notes?.light),
    block(dark, s.dark, s.notes?.dark),
    ...(s.bodyTracking ? [`:root[data-skin="${s.id}"] body { letter-spacing: var(--tracking-normal); }`] : []),
    ["shadow-xs", "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl"].map((k) => `${sel} .${k} { --tw-shadow: var(--${k}); }`).join("\n"),
    "",
  ].join("\n");
}

/** a radius in px (16px rem), or null when it is not a plain length */
const px = (v: string): number | null => { const m = v.match(/^(\d*\.?\d+)(rem|px)$/); return v === "0" ? 0 : m ? Number(m[1]) * (m[2] === "rem" ? 16 : 1) : null; };

export function build(check: boolean): { written: string[]; stale: string[]; errors: string[]; warnings: string[] } {
  const errors: string[] = [], warnings: string[] = [];
  const ajv = new Ajv2020({ allErrors: true });
  const validSkin = ajv.compile(readJson<object>(join(SKINS, "skin.schema.json")));
  const validFont = ajv.compile(readJson<object>(join(FONTS, "font.schema.json")));
  const index = readJson<{ skins: IndexEntry[] }>(join(SKINS, "index.json"));
  const outputs = new Map<string, string>();
  const registry: Record<string, { label: string; source: string; fonts: string[] }> = {};
  const fonts = new Map<string, Font>();
  const font = (id: string): Font | undefined => {
    if (!fonts.has(id)) {
      const p = join(FONTS, `${id}.json`);
      if (!existsSync(p)) return undefined;
      const f = readJson<Font>(p);
      if (!validFont(f)) errors.push(`xgen/fonts/${id}.json: ${ajv.errorsText(validFont.errors)}`);
      if (f.id !== id) errors.push(`xgen/fonts/${id}.json: id is ${f.id}`);
      fonts.set(id, f);
    }
    return fonts.get(id);
  };
  const entries: IndexEntry[] = [];
  for (const e of index.skins) {
    const file = join(SKINS, e.file);
    const text = readFileSync(file, "utf8");
    const s = JSON.parse(text) as Skin;
    if (!validSkin(s)) { errors.push(`xgen/skins/${e.file}: ${ajv.errorsText(validSkin.errors)}`); continue; }
    if (s.id !== e.id || e.file !== `${s.id}.json`) errors.push(`index.json: ${e.id} -> ${e.file} holds ${s.id}`);
    if (e.name !== s.name || e.version !== s.version) errors.push(`index.json: ${e.id}: name or version differs from ${e.file}`);
    if (check && e.sha256 !== sha256(text)) errors.push(`index.json: ${e.id}: sha256 is stale (run bun run skins build)`);
    for (const id of s.fonts) if (!font(id)) errors.push(`xgen/skins/${e.file}: no font ${id} in xgen/fonts`);
    for (const theme of ["light", "dark"] as const) {
      const r = s[theme].radius;
      if (r === undefined) continue;
      const v = px(r);
      if (v === null || v % 4 !== 0) warnings.push(`${s.id} (${theme}): --radius ${r}${v === null ? "" : ` = ${v}px`} is off the 8+4 grid (kept as is)`);
    }
    outputs.set(join(CSS_DIR, `${s.id}.css`), skinCss(s));
    registry[s.id] = { label: s.name, source: s.attribution.source, fonts: s.fonts.map((id) => font(id)?.google ?? id) };
    entries.push({ id: s.id, name: s.name, version: s.version, file: e.file, sha256: sha256(text) });
  }
  if (errors.length) return { written: [], stale: [], errors, warnings };
  outputs.set(join(CSS_DIR, "skins.json"), JSON.stringify(registry, null, 2) + "\n");
  const sf = skinFontsSource(registry);
  outputs.set(join(ROOT, SHARED_DIR, sf.path), sf.contents);
  outputs.set(join(SKINS, "index.json"), JSON.stringify({ skins: entries }, null, 2) + "\n");
  const written: string[] = [], stale: string[] = [];
  for (const [p, contents] of outputs) {
    if (existsSync(p) && lstatSync(p).isSymbolicLink()) { errors.push(`${relative(ROOT, p)} is a symlink`); continue; }
    if (existsSync(p) && readFileSync(p, "utf8") === contents) continue;
    if (check) stale.push(relative(ROOT, p));
    else { writeFileSync(p, contents); written.push(relative(ROOT, p)); }
  }
  return { written, stale, errors, warnings };
}

if (import.meta.main) {
  const [cmd, ...flags] = process.argv.slice(2);
  if (cmd !== "build") { console.error("usage: bun run skins build [--check]"); process.exit(2); }
  const check = flags.includes("--check");
  const { written, stale, errors, warnings } = build(check);
  for (const w of warnings) console.warn(`skins: warning: ${w}`);
  for (const e of errors) console.error(`skins: ${e}`);
  for (const s of stale) console.error(`skins: stale: ${s} (run bun run skins build)`);
  if (errors.length || stale.length) process.exit(1);
  const n = readJson<{ skins: unknown[] }>(join(SKINS, "index.json")).skins.length;
  console.log(check ? `skins: ${n} skins, generated files up to date, ${warnings.length} warnings` : `skins: ${n} skins, ${written.length} files written, ${warnings.length} warnings`);
}
