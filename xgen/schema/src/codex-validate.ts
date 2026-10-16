// Validates every fixture entry with the @ui8kit/contract v0.4 validator against xgen/schema/codex/manifest.json, and the
// manifest itself against https://schema.buildy.tw/manifest.schema.json (from the contract checkout).
// @ui8kit/contract 0.2.0 (Codex v0.4) is not on npm yet, so the contract is read from a checkout:
//   bun xgen/schema/src/codex-validate.ts [path to ui8kit/contract, default ../contract or $CODEX_CONTRACT]
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { MANIFEST_PATH, loadFixtures } from "./codex";

const dir = resolve(process.argv[2] ?? process.env.CODEX_CONTRACT ?? join(import.meta.dir, "..", "..", "..", "..", "contract"));
if (!existsSync(join(dir, "src", "validate-v04.ts"))) { console.error(`no ui8kit/contract checkout at ${dir}`); process.exit(2); }
const { validateCollectionV04 } = await import(join(dir, "src", "validate-v04.ts"));
const Ajv2020 = (await import(join(dir, "node_modules", "ajv", "dist", "2020.js"))).default;
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const schema = JSON.parse(readFileSync(join(dir, "schemas", "manifest.schema.json"), "utf8"));
const ajv = new Ajv2020({ strict: false });
const okManifest = ajv.validate(schema, manifest);
const entries = loadFixtures().flatMap((c) => c.entries.map((data, i) => ({ file: `${c.collection}.json#${i}`, data })));
const issues = validateCollectionV04({ entries }, { manifest }) as { code: string; path: string; message: string; severity?: string }[];
for (const i of issues) console.log(`${i.severity ?? "error"} ${i.code} ${i.path}: ${i.message}`);
const errors = issues.filter((i) => !i.severity).length, warnings = issues.length - errors;
console.log(`manifest schema: ${okManifest ? "ok" : JSON.stringify(ajv.errors)}; ${entries.length} entries, ${manifest.resources.length} kinds: ${errors} errors, ${warnings} warnings`);
process.exit(okManifest && errors === 0 ? 0 : 1);
