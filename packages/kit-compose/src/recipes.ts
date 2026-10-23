// Token-only recipes: ../variants/<id>.variants.json (moved from the xgen brick specs, owned by codegen-x).
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Recipe = {
  id: string;
  base: string;
  keys: string[];
  defaults: Record<string, string>;
  byKey: Record<string, Record<string, string>>;
  compound?: Array<Record<string, string>>;
};

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../variants");
export const RECIPES: Record<string, Recipe> = Object.fromEntries(
  readdirSync(dir).filter((f) => f.endsWith(".variants.json")).sort()
    .map((f) => [f.replace(/\.variants\.json$/, ""), JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Recipe]),
);

/** Classes of a recipe for static values (unset keys take the defaults). */
export function recipeClasses(id: string, values: Record<string, string | undefined> = {}): string {
  const r = RECIPES[id];
  if (!r) throw new Error(`recipes: unknown recipe ${id}`);
  const pick = (k: string) => values[k] ?? r.defaults[k];
  const out = [r.base, ...r.keys.map((k) => r.byKey[k]?.[pick(k) ?? ""] ?? "")];
  for (const c of r.compound ?? []) {
    const { class: cls, ...when } = c;
    if (Object.entries(when).every(([k, v]) => pick(k) === v)) out.push(cls);
  }
  return out.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
