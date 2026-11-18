// packages/prototypes: the places cover the model, the page mode of a prototype is the clean block (same DOM once data-place and
// data-field are stripped), the wireframe draws shapes only (three members), the clean outputs carry no builder attribute, and out/
// is what the driver writes.
import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { blockCases, loadInputs, ROOT, type OrganismSpec } from "../../compose-gen";
import { loadModels, schemaOf, validate } from "../../compose-gen/model/src/index";
import { plugin } from "bun";
import { compile } from "svelte/compiler";
import { build, drift, OUT } from "../src/driver";

const KIT = path.resolve(import.meta.dir, "../../kit/svelte/src");
// Svelte server compile, registered synchronously (the loader of packages/kit-compose/test/ssr.ts sets up asynchronously)
plugin({
  name: "prototypes-svelte-ssr",
  setup(b) {
    b.onLoad({ filter: /\.svelte$/ }, ({ path: p }) => ({ loader: "js", contents: compile(readFileSync(p, "utf8"), { generate: "server", filename: p }).js.code }));
  },
});
const { render } = await import("svelte/server");
// out/svelte imports the kit as the consumer installs it (@ui8kit/kit/*): rendered from a copy (inside the repo, for node_modules)
// whose kit imports point at packages/kit/svelte/src, the same primitives
const RENDER = path.join(import.meta.dir, ".render");
rmSync(RENDER, { recursive: true, force: true });
cpSync(path.join(OUT, "svelte"), RENDER, { recursive: true });
for (const e of readdirSync(RENDER, { recursive: true, withFileTypes: true })) if (e.isFile()) {
  const f = path.join(e.parentPath, e.name);
  const s = readFileSync(f, "utf8");
  const t = s.replaceAll('"@ui8kit/kit/ui/', `"${KIT}/ui/`).replaceAll('"@ui8kit/kit/utils"', `"${KIT}/utils/index.ts"`);
  if (t !== s) writeFileSync(f, t);
}

const built = build();
const models = loadModels(ROOT);
const inputs = loadInputs(ROOT);
const simple = built.contracts;
const BUILDER = /\s(data-place|data-field|data-shape|mode)="[^"]*"/g;
const norm = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/> </g, "><").trim();
const ssr = async (file: string, props: Record<string, unknown>): Promise<string> => {
  const C = (await import(file)).default;
  const w = console.warn; console.warn = () => {};
  try { return render(C, { props }).body; } finally { console.warn = w; }
};
const organisms = new Set(simple.map((c) => c.organism));
const cases = blockCases(inputs, organisms).cases.filter((c) => organisms.has(c.organism));
const itemOf = (name: string) => simple.find((c) => c.organism === name)!.item;

test("the simple line has its prototypes: hero-simple and team-simple", () => {
  expect(simple.map((c) => [c.item, c.model, c.defaultMode])).toEqual([["hero-simple", "hero@1", "wireframe"], ["team-simple", "team@1", "wireframe"]]);
  expect(cases.length).toBe(7);
});

test("out/ is what the driver writes (bun packages/prototypes/src/driver.ts)", () => {
  expect(drift(built)).toEqual([]);
  const manifest = JSON.parse(readFileSync(path.join(OUT, "manifest.json"), "utf8")) as { files: Record<string, string> };
  expect(Object.keys(manifest.files).length).toBe(built.files.size - 1);
});

describe("places", () => {
  for (const c of simple) test(`${c.item}: every field of ${c.model} has a place, every place field is in the model`, () => {
    const m = models.get(c.model)!.model;
    const pointers = Object.entries(m.fields).flatMap(([k, f]) => (f.type === "list" ? Object.entries(f.item!.fields).filter(([, x]) => x.type !== "id").map(([x]) => `/${k}/*/${x}`) : [`/${k}`]));
    const placed = c.places.flatMap((p) => p.fields);
    expect([...new Set(placed)].sort()).toEqual(pointers.sort());
    expect(new Set(c.places.map((p) => p.place)).size).toBe(c.places.length);
  });
});

describe("page mode = the clean block", () => {
  for (const c of cases) test(c.label, async () => {
    const item = itemOf(c.organism);
    const props = c.props as Record<string, unknown>;
    for (const p of [props, { ...props, landmarkLabel: undefined }]) {
      const clean = await ssr(path.resolve(import.meta.dir, `../../kit-compose/svelte/src/blocks/${item}.svelte`), p);
      const page = await ssr(path.join(RENDER, `blocks/${item}.svelte`), { ...p, mode: "page" });
      expect(page).toContain('data-place="title"');
      expect(norm(page.replace(BUILDER, ""))).toBe(norm(clean));
    }
  });
});

describe("wireframe mode", () => {
  for (const c of cases) test(c.label, async () => {
    const item = itemOf(c.organism);
    const html = await ssr(path.join(RENDER, `blocks/${item}.svelte`), c.props as Record<string, unknown>);
    // no words: every place is a shape; the placeholder pictures are decorative
    expect(norm(html.replace(/<[^>]+>/g, " ")).trim()).toBe("");
    expect(html).not.toContain("aria-labelledby");
    expect(html).toContain('data-shape="heading"');
    if (item === "team-simple") {
      expect(html.match(/<li\b/g)?.length).toBe(3);
      expect(html.match(/data-shape="avatar"/g)?.length).toBe(3);
    }
    if (item === "hero-simple") for (const s of ["badge", "cta", "text", "media"]) expect(html).toContain(`data-shape="${s}"`);
  });
});

test("the clean outputs (8 runtimes) carry no builder attribute", () => {
  const kc = path.resolve(import.meta.dir, "../../kit-compose");
  const files = (dir: string): string[] => existsSync(dir) ? readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => path.join(e.parentPath, e.name)) : [];
  const clean = ["react", "svelte", "vue", "solid", "jinja2", "twig", "latte", "templ"].flatMap((r) => files(path.join(kc, r))).filter((f) => /(hero|team)[-_]simple/.test(path.basename(f)));
  expect(clean.length).toBeGreaterThanOrEqual(16);
  for (const f of clean) {
    const s = readFileSync(f, "utf8");
    expect({ f, hit: /data-(place|field|shape|testid)|\bwireframe\b/.exec(s)?.[0] ?? null }).toEqual({ f, hit: null });
  }
});

test("out/models: the schemas are schemaOf(model), the emitted validate() agrees", async () => {
  for (const [key, { model }] of models) {
    expect(JSON.parse(readFileSync(path.join(OUT, `models/${key}.schema.json`), "utf8"))).toEqual(schemaOf(model));
    const mod = (await import(path.join(OUT, `models/${key}.ts`))) as Record<string, unknown>;
    const fn = Object.entries(mod).find(([k]) => k.startsWith("validate"))![1] as (v: unknown) => unknown[];
    expect(fn({})).toEqual(validate(model, {}));
    expect(fn({ title: "x", members: [{ id: "a", title: "A" }] }).length).toBe(validate(model, { title: "x", members: [{ id: "a", title: "A" }] }).length);
  }
});

test("the prototype organisms name their mode and keep every clean prop", () => {
  const byName = Object.fromEntries(inputs.organisms.map((o) => [o.value.name, o.value as OrganismSpec]));
  for (const o of built.organisms.filter((x) => organisms.has(x.name))) {
    expect(o.props.map((p) => p.name)).toEqual([...byName[o.name]!.props.map((p) => p.name), "mode"]);
  }
});
