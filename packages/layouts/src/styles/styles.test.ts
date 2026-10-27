// The named classes of the layouts the Magazine loads (src/magazine, src/theme): the markup carries names only, each name has its
// one rule (an @apply list of token utilities, src/styles/{magazine,options,theme}.css), and the Magazine's layouts sheet emits no
// bare utility. A utility emitted there a second time, after the app's own stylesheet, would win by load order over the app's
// responsive variants (3af67250 .. the @apply move: the live templates of the style page drew their mobile layout at 1280 px).
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@tailwindcss/node";
import { twMerge } from "tailwind-merge";
import { BRICKS } from "../../../kit-compose/src/map";
import { RECIPES } from "../../../kit-compose/src/recipes";

const SRC = join(import.meta.dir, "..");
const REPO = join(SRC, "..", "..", "..");
const DIRS = ["magazine", "theme"];
const SHEETS = ["magazine", "options", "theme"];
/** class names that only mark an element for a variant of another (group-hover:, peer-checked:) and emit no CSS */
const MARKERS = new Set(["group", "peer"]);

const files = DIRS.flatMap((d) => readdirSync(join(SRC, d)).filter((f) => f.endsWith(".svelte")).map((f) => join(d, f)));
const read = (rel: string): string => readFileSync(join(SRC, rel), "utf8");

/** the class tokens of a Svelte file: class="..." values, the string literals of class={...}, and the string constants it names */
function classTokens(text: string): string[] {
  const lits = (code: string): string[] => [...code.replace(/[!=]==?\s*"[^"]*"/g, "").matchAll(/"([^"]*)"/g)].map((m) => m[1]!); // not the compared values
  const script = [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]!).join("\n");
  const markup = text.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const out: string[] = [...markup.matchAll(/\bclass="([^"]*)"/g)].map((m) => m[1]!);
  for (const [, expr] of markup.matchAll(/\bclass=\{([^}]*)\}/g)) {
    out.push(...lits(expr!));
    for (const [, id] of expr!.matchAll(/\b([A-Za-z_]\w*)\b/g)) {
      const def = new RegExp(`(?:const|let)\\s+${id}\\s*=\\s*([^;\\n]+)`).exec(script);
      if (def) out.push(...lits(def[1]!));
    }
  }
  return out.flatMap((s) => s.split(/\s+/)).filter(Boolean);
}

/** name -> @apply list of the layouts sheets */
const rules = new Map<string, string>();
for (const s of SHEETS) for (const [, name, list] of readFileSync(join(SRC, "styles", s + ".css"), "utf8").matchAll(/\.(ui8-[a-z0-9-]+)\s*\{\s*@apply\s+([^;]+);\s*\}/g)) {
  expect(rules.has(name!), `${name} defined twice`).toBe(false);
  rules.set(name!, list!.trim());
}

describe("layouts: named classes (src/magazine, src/theme)", () => {
  test("the markup carries named classes only (ui8-*, and the group marker)", () => {
    const bare = files.flatMap((f) => classTokens(read(f)).filter((c) => !c.startsWith("ui8-") && !MARKERS.has(c)).map((c) => `${f}: ${c}`));
    expect(bare).toEqual([]);
  });

  test("every name in the markup has its rule, and every rule is used", () => {
    const used = new Set(files.flatMap((f) => classTokens(read(f)).filter((c) => c.startsWith("ui8-"))));
    const stages = new Set(["ui8-taste-stage", "ui8-preview-stage"]); // layouts.css: plain CSS, no utility for them
    expect([...used].filter((n) => !rules.has(n) && !stages.has(n)).sort()).toEqual([]);
    expect([...rules.keys()].filter((n) => !used.has(n)).sort()).toEqual([]);
  });

  test("the Magazine's layouts sheet emits named classes only: no utility a second time next to app.css", async () => {
    const base = join(REPO, "apps", "magazine", "src");
    const compiler = await compile(readFileSync(join(base, "layouts.css"), "utf8"), { base, onDependency() {} });
    const css = compiler.build([]).replace(/\/\*[\s\S]*?\*\//g, "");
    const classes = new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w\\:/[\]-]*)/g)].map((m) => m[1]!));
    expect([...classes].filter((c) => !c.startsWith("ui8-") && !MARKERS.has(c)).sort()).toEqual([]);
    for (const n of rules.keys()) expect(css, n).toContain("." + n);
  });

  test("both apps import the sheets of the layouts they render", () => {
    const magazine = readFileSync(join(REPO, "apps", "magazine", "src", "layouts.css"), "utf8");
    const stock = readFileSync(join(REPO, "apps", "stock", "src", "app.css"), "utf8");
    for (const s of SHEETS) expect(magazine).toContain(`@import "@ui8kit/layouts/styles/${s}.css"`);
    for (const s of ["options", "theme"]) expect(stock).toContain(`@import "@ui8kit/layouts/styles/${s}.css"`);
  });

  // A named class sits after the app's utilities, so it wins over the recipe base of its primitive (as tailwind-merge let the class
  // win) and over a responsive recipe class too, which tailwind-merge would have kept (md:text-sm over text-xs). So a named class on
  // a primitive with responsive recipe classes must not set what those set.
  test("no named class overrides a responsive class of its primitive's recipe", () => {
    const responsive = (recipe: string): string[] => {
      const r = RECIPES[recipe]; if (!r) return [];
      return [r.base, ...Object.values(r.byKey).flatMap((v) => Object.values(v))].join(" ").split(/\s+/).filter((c) => /^(sm|md|lg|xl|2xl|max-[a-z0-9]+|@[a-z0-9]+):/.test(c));
    };
    const hits: string[] = [];
    for (const f of files) for (const [, tag, attrs] of read(f).matchAll(/<([A-Z]\w*)\b([^>]*)>/g)) {
      const recipe = BRICKS[tag!]?.recipe; if (!recipe) continue;
      const names = [...attrs!.matchAll(/\bui8-[a-z0-9-]+/g)].map((m) => m[0]);
      for (const c of responsive(recipe)) for (const n of names) {
        const base = c.split(":").pop()!, list = rules.get(n) ?? "";
        if (!twMerge(`${base} ${list}`).split(" ").includes(base)) hits.push(`${f}: <${tag}> ${n} (${list}) overrides ${c}`);
      }
    }
    expect([...new Set(hits)]).toEqual([]);
  });
});
