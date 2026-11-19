// packages/prototypes: the places cover the model, every place of a contract has its shape in the wireframe (data-place, data-field),
// the wireframe draws shapes only (three members) and imports only svelte and the kit, the clean outputs carry no builder attribute,
// and out/ is what the driver writes. The clean block itself (page DOM, the action link, the width of the team) is checked here on the
// kit-compose output, not through the prototype: no clean code ships with a prototype.
import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { blockCases, loadInputs, ROOT, type OrganismSpec } from "../../compose-gen";
import { loadModels, schemaOf, validate } from "../../compose-gen/model/src/index";
import { plugin } from "bun";
import { JSDOM } from "jsdom";
import { compile } from "svelte/compiler";
import { build, drift, OUT } from "../src/driver";
import { CONTAINER, PADDING } from "../src/project";
import { TEXT_ALIGN } from "../../compose-gen/screens/src/authoring/blocks/simple";
import { ROLE } from "../src/shapes";

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
const CLEAN = path.resolve(import.meta.dir, "../../kit-compose/svelte/src/blocks");
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
  // 7 variants, and each once more per non-default align value (compose-gen blockCases)
  expect(cases.length).toBe(7 * 3);
});

test("out/ is what the driver writes (bun packages/prototypes/src/driver.ts)", () => {
  expect(drift(built)).toEqual([]);
  const manifest = JSON.parse(readFileSync(path.join(OUT, "manifest.json"), "utf8")) as { files: Record<string, string> };
  expect(Object.keys(manifest.files).length).toBe(built.files.size - 1);
});

test("out/ ships wireframes, shapes, contracts, models and the manifest only (no clean block, composition or recipe)", () => {
  expect([...built.files.keys()].sort()).toEqual([
    "catalog.ts", "classes.json", "contracts/hero-simple/1.json", "contracts/team-simple/1.json", "contracts/v0.json", "manifest.json",
    "models/hero@1.schema.json", "models/hero@1.ts", "models/index.ts", "models/team@1.schema.json", "models/team@1.ts", "models/validate.ts", "registry.ts",
    "svelte/blocks/hero-simple.svelte", "svelte/blocks/team-simple.svelte", "svelte/index.ts",
    ...["avatar", "badge", "cta", "heading", "media", "text"].map((s) => `svelte/shapes/shape-${s}.svelte`),
  ]);
  for (const [f, body] of built.files) if (f.startsWith("svelte/")) {
    const ext = [...body.matchAll(/(?:from|import)\s+["']([^"'.][^"']*)["']/g)].map((m) => m[1]!);
    expect({ f, ext: ext.filter((x) => !["svelte", "@ui8kit/kit/ui/box/Box.svelte", "@ui8kit/kit/utils"].includes(x)) }).toEqual({ f, ext: [] });
    expect({ f, hit: /\b(rc|recipes|transition|shadow|ring|hover:|focus)/.exec(body.replace(/<!--[\s\S]*?-->/, ""))?.[0] ?? null }).toEqual({ f, hit: null });
  }
});

test("registry.ts and catalog.ts list every contract once, in manifest order; registry.ts imports no .svelte", async () => {
  const reg = (await import(path.join(OUT, "registry.ts"))) as { CONTRACTS: Array<{ item: string; model: string }>; CATEGORIES: Record<string, string>; MODELS: Record<string, { spec: { id: string }; validate: (v: unknown) => unknown[] }> };
  const manifest = JSON.parse(readFileSync(path.join(OUT, "manifest.json"), "utf8")) as { items: Array<{ item: string; model: string }> };
  expect(reg.CONTRACTS.map((c) => c.item)).toEqual(manifest.items.map((i) => i.item));
  expect(reg.CONTRACTS).toEqual(simple as never);
  expect(Object.keys(reg.CATEGORIES)).toEqual(manifest.items.map((i) => i.item));
  for (const c of simple) {
    expect(reg.CATEGORIES[c.item]).toBe(c.model.split("@")[0]!);
    expect(reg.MODELS[c.model]!.spec.id).toBe(c.model.split("@")[0]!);
  }
  expect(Object.keys(reg.MODELS).sort()).toEqual([...models.keys()].sort());
  expect(built.files.get("registry.ts")).not.toMatch(/\.svelte["']/);
  const catalog = built.files.get("catalog.ts")!;
  expect([...catalog.matchAll(/^  "([a-z0-9-]+)": (\w+),$/gm)].map((m) => [m[1], m[2]])).toEqual(simple.map((c) => [c.item, c.organism]));
  const types = built.files.get("models/index.ts")!;
  for (const key of models.keys()) expect(types).toContain(`from "./${key}";`);
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

describe("every place of the contract has its shape in the wireframe", () => {
  for (const c of cases) test(c.label, async () => {
    const contract = simple.find((x) => x.organism === c.organism)!;
    const html = await ssr(path.join(RENDER, `blocks/${contract.item}.svelte`), c.props as Record<string, unknown>);
    const drawn = new Set([...html.matchAll(/data-place="([^"]+)"/g)].map((m) => m[1]!));
    expect([...drawn].sort()).toEqual(contract.places.map((p) => p.place).sort());
    const pointers = new Set(contract.places.flatMap((p) => p.fields));
    for (const m of html.matchAll(/data-field="([^"]+)"/g)) for (const f of m[1]!.split(" ")) expect(pointers.has(f.replace(/^\/(\w+)\/\d+\//, "/$1/*/"))).toBe(true);
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

test("a prototype takes its layout axes and the padding and align settings, no content", () => {
  for (const c of simple) expect(built.organisms.find((o) => o.name === c.organism)!.props.map((p) => p.name).sort()).toEqual([...Object.keys(c.axes), "padding", "align"].sort());
});

describe("layout, padding and the action: the wireframe and the clean block", () => {
  const hero = c0("HeroSimple"), team = c0("TeamSimple");
  function c0(name: string) { return cases.find((c) => c.organism === name)!.props as Record<string, unknown>; }
  const fileOf = (item: string, mode: string) => (mode === "clean" ? path.join(CLEAN, `${item}.svelte`) : path.join(RENDER, `blocks/${item}.svelte`));
  const PRESETS = PADDING;

  for (const item of ["hero-simple", "team-simple"]) for (const mode of ["wireframe", "clean"]) test(`${item} (${mode}): padding presets on the section, standard by default`, async () => {
    const props = item === "hero-simple" ? hero : team;
    const cls = async (p: Record<string, unknown>) => (await ssr(fileOf(item, mode), { ...props, ...p })).match(/<section[^>]*class="([^"]*)"/)![1]!.split(/\s+/);
    expect(await cls({})).toEqual(expect.arrayContaining(PRESETS.standard.split(" ")));
    for (const [k, v] of Object.entries(PRESETS)) {
      const got = await cls({ padding: k });
      expect(got).toEqual(expect.arrayContaining(v.split(" ")));
      for (const other of Object.values(PRESETS)) if (other !== v) for (const t of other.split(" ")) if (!v.includes(t)) expect(got).not.toContain(t);
    }
  });

  test("contracts: padding is a setting (compact | standard | spacious, default standard), not a variant axis", () => {
    for (const c of simple) {
      expect(c.settings.padding).toEqual({ type: '"compact" | "standard" | "spacious"', default: "standard" });
      expect(Object.keys(c.axes)).not.toContain("padding");
    }
  });

  test("contracts: align is a setting (start | center | end, default start), not a variant axis", () => {
    for (const c of simple) {
      expect(c.settings.align).toEqual({ type: '"start" | "center" | "end"', default: "start" });
      expect(Object.keys(c.axes)).not.toContain("align");
    }
  });

  test("contracts: the variant default of align: center for the centred composition (HeroSimple mediaTop) only, start elsewhere", () => {
    const own = simple.flatMap((c) => c.variants.filter((v) => v.settings).map((v) => `${c.item}.${v.id} ${JSON.stringify(v.settings)}`));
    expect(own).toEqual(['hero-simple.mediaTop {"align":"center"}']);
    // the feed does not grow: align is never a variant of its own
    expect(simple.find((c) => c.item === "hero-simple")!.variants.map((v) => v.id)).toEqual(["mediaEnd", "mediaStart", "mediaTop"]);
  });

  // the align setting: logical classes only (ui8kit/prototypes docs/adr/0002-align-as-setting.md)
  const ITEMS = { start: "items-start", center: "items-center", end: "items-end" } as const;
  for (const item of ["hero-simple", "team-simple"]) for (const mode of ["wireframe", "clean"]) for (const align of ["start", "center", "end"] as const) test(`${item} (${mode}) align ${align}: items-${align} on the copy, logical text classes only`, async () => {
    const props = item === "hero-simple" ? hero : team;
    const html = await ssr(fileOf(item, mode), { ...props, ...(align === "start" ? {} : { align }) });
    const others = Object.values(ITEMS).filter((x) => x !== ITEMS[align]);
    // the column of the heading: the parent of the heading shape (wireframe) or of the heading (clean) has items-<align>
    const doc = new JSDOM(html).window.document;
    const column = [...doc.querySelector(mode === "wireframe" ? '[data-place="title"]' : "h1, h2, h3")!.parentElement!.classList];
    expect(column).toContain(ITEMS[align]);
    for (const o of others) expect(column).not.toContain(o);
    if (mode === "wireframe") {
      // the text bars follow it inside ShapeText
      const text = html.match(/<div[^>]*class="([^"]*)"[^>]*data-shape="text"/)![1]!.split(/\s+/);
      expect(text).toContain(ITEMS[align]);
    } else {
      expect(html.match(/<h[1-3][^>]*class="([^"]*)"/)![1]!.split(/\s+/)).toContain(TEXT_ALIGN[align]);
    }
    expect(html).not.toMatch(/\btext-(?:left|right)\b/);
  });

  for (const cols of ["2", "3", "4"]) for (const surface of ["plain", "cards"]) for (const mode of ["wireframe", "clean"]) test(`team-simple cols ${cols} ${surface} (${mode}): the list fills the container`, async () => {
    const html = await ssr(fileOf("team-simple", mode), { ...team, cols, surface });
    // the column Stack stretches its children (items-stretch, not the default items-start) and the grid is w-full
    expect(html).toMatch(/class="[^"]*\bflex flex-col\b[^"]*\bitems-stretch\b[^"]*gap-12|class="[^"]*gap-12[^"]*items-stretch/);
    expect(html).toMatch(/<ul[^>]*class="[^"]*\bgrid\b[^"]*\bw-full\b/);
    expect(html).toContain(`class="${CONTAINER}"`);
  });

  test("hero-simple: the action is a link (a[href], data-slot=button, the link-button recipe), drawn only with a label and an address", async () => {
    const file = fileOf("hero-simple", "clean");
    const page = await ssr(file, { ...hero, actionLabel: "Go", actionHref: "https://example.com/go" });
    const a = page.match(/<a\b[^>]*>/)![0];
    expect(a).toContain('href="https://example.com/go"');
    expect(a).toContain('data-slot="button"');
    expect(a).toMatch(/bg-primary/);
    expect(page).not.toMatch(/<button\b/);
    for (const p of [{ actionLabel: "Go", actionHref: "" }, { actionLabel: "", actionHref: "https://example.com/go" }])
      expect(await ssr(file, { ...hero, ...p })).not.toMatch(/<a\b/);
  });
});

test("out/classes.json: the role table, Stack align / justify, the text align, the padding presets and the container, every length on the 8px grid", () => {
  const c = JSON.parse(built.files.get("classes.json")!) as { roles: Record<string, string>; padding: Record<string, string>; container: string; textAlign: Record<string, string> };
  expect(c.roles).toEqual(ROLE);
  expect(c.textAlign).toEqual({ start: "text-start", center: "text-center", end: "text-end" });
  expect(Object.keys(c.padding)).toEqual(["compact", "standard", "spacious"]);
  for (const cls of [...Object.values(c.roles), ...Object.values(c.padding), c.container].join(" ").split(/\s+/)) {
    const step = /^(?:[a-z]+:)?(?:p[xy]?|h|w|gap)-(\d+)$/.exec(cls)?.[1];
    if (step) expect({ cls, px: (Number(step) * 4) % 8 }).toEqual({ cls, px: 0 });
  }
  // every shape draws its role
  for (const [role, cls] of Object.entries(ROLE)) if (role !== "surface") expect(built.files.get("svelte/shapes/" + ({ text: "shape-text", heading: "shape-heading", "heading-lg": "shape-heading", badge: "shape-badge", "cta-primary": "shape-cta", media: "shape-media", avatar: "shape-avatar" } as Record<string, string>)[role] + ".svelte")).toContain(cls);
});
