import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { build, deriveRules, loadVocabulary, matches, OUTPUTS, ROOT, serialise } from "./lib/build";

const vocab = loadVocabulary();
const built = build(vocab);
const { index, previews } = built;
const blockFiles = readdirSync(join(ROOT, "packages/compose-gen/specs/blocks")).filter((f) => f.endsWith(".json"));
const blockSpecs = blockFiles.map((f) => JSON.parse(readFileSync(join(ROOT, "packages/compose-gen/specs/blocks", f), "utf8")) as { id: string; variants: { id: string }[] });

describe("index", () => {
  test("every block and every variant is an asset", () => {
    expect(blockSpecs.length).toBe(92);
    const ids = new Set(index.assets.map((a) => a.id));
    let variants = 0;
    for (const b of blockSpecs) for (const v of b.variants) { variants++; expect(ids.has(`${b.id}/${v.id}`)).toBe(true); }
    expect(index.counts["block"]).toBe(variants);
    expect(index.counts["blockSpecs"]).toBe(92);
    expect(new Set(index.assets.filter((a) => a.type === "block").map((a) => a.group)).size).toBe(92);
  });
  test("ids are unique, orders are the positions", () => {
    expect(new Set(index.assets.map((a) => a.id)).size).toBe(index.assets.length);
    index.assets.forEach((a, i) => expect(a.order).toBe(i));
  });
  test("two categories: blocks and screens; no sections (every organism is drawn by a block) and no skins (a preview setting)", () => {
    expect(Object.keys(index.counts).sort()).toEqual(["block", "blockSpecs", "screen"]);
    expect(index.counts["screen"]).toBe(65);
    expect(index.facets.find((f) => f.id === "type")!.values.map((v) => v.id)).toEqual(["block", "screen"]);
    expect(index.facets.some((f) => f.id === "skin" || f.id === "radius")).toBe(false);
  });
  test("every page of a screen is made of kit blocks with existing variants", () => {
    const byId = new Map(blockSpecs.map((b) => [b.id.slice(6), new Set(b.variants.map((v) => v.id))]));
    for (const r of Object.values(previews.screens)) for (const u of [...r.before, ...r.after, ...Object.values(r.areas).flat()]) {
      expect(byId.has(u.block)).toBe(true);
      if (u.variant) expect(byId.get(u.block)!.has(u.variant)).toBe(true);
    }
  });
  test("deterministic: a second build gives the same digest and the same bytes", () => {
    const again = build(loadVocabulary());
    expect(again.index.digest).toBe(index.digest);
    expect(serialise(again)).toEqual(serialise(built));
    expect(index.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
  test("the committed outputs are up to date (bun run --cwd apps/stock index)", () => {
    const files = serialise(built);
    for (const [k, path] of Object.entries(OUTPUTS)) expect(readFileSync(path, "utf8")).toBe(files[k as keyof typeof files]);
  });
});

describe("labels", () => {
  const blocks = () => index.assets.filter((a) => a.type === "block");
  const facetOf = new Map(index.facets.map((f) => [f.id, f]));
  test("every label is a value of the vocabulary (or * where the facet allows it for the type)", () => {
    for (const a of index.assets) for (const [f, vals] of Object.entries(a.labels)) {
      const facet = facetOf.get(f)!;
      expect(facet).toBeDefined();
      const ids = new Set(facet.values.map((v) => v.id));
      for (const v of vals) {
        if (v === "*") expect(facet.wildcard ?? []).toContain(a.type);
        else expect(ids.has(v)).toBe(true);
      }
    }
  });
  test("auto facets of the plan: type, job (group), section (theme), composition/density/tone/media (axes), slots (codex), runtimes", () => {
    const blocks = index.assets.filter((a) => a.type === "block");
    for (const a of blocks) {
      expect(a.labels["type"]).toEqual(["block"]);
      for (const f of ["job", "section"]) expect(a.labels[f]!.length).toBeGreaterThan(0);
    }
    const hero = index.assets.find((a) => a.id === "block.hero/centered")!;
    expect(hero.labels["job"]).toContain("hero");
    expect(hero.labels["section"]).toEqual(["marketing"]);
    expect(hero.labels["composition"]).toContain("central");
    expect(index.assets.find((a) => a.id === "block.bento/bento")!.labels["composition"]).toContain("bento");
    expect(index.assets.find((a) => a.id === "block.pricing/" + blockSpecs.find((b) => b.id === "block.pricing")!.variants[0]!.id)!.labels["slots"]).toContain("price");
    expect(blocks.some((a) => a.labels["tone"]?.includes("inverse"))).toBe(true);
    expect(blocks.some((a) => a.labels["density"]?.includes("airy"))).toBe(true);
  });
  test("no fallback values: an asset without a matching rule has no label, and the canon ids are used", () => {
    expect(vocab.facets.some((f) => "fallback" in f)).toBe(false);
    expect(blocks().some((a) => a.labels["density"]!.length === 0)).toBe(true);
    expect(blocks().some((a) => a.labels["character"]!.length === 0)).toBe(true);
    expect(vocab.facets.find((f) => f.id === "character")!.values.map((v) => v.id)).toEqual(["calm", "bold", "technical", "playful"]);
    expect(vocab.facets.find((f) => f.id === "density")!.values.map((v) => v.id)).toEqual(["airy", "balanced", "dense"]);
    expect(vocab.quick.some((q) => q.facet === "tone")).toBe(false);
  });
  test("facets that do not discriminate and values nobody carries are hidden, and named", () => {
    const hiddenFacets = index.hidden!.facets.map((h) => h.facet);
    expect(hiddenFacets).toContain("runtime");
    for (const h of index.hidden!.facets) expect(index.facets.some((f) => f.id === h.facet)).toBe(false);
    for (const h of index.hidden!.values) expect(index.facets.find((f) => f.id === h.facet)?.values.some((v) => v.id === h.value) ?? false).toBe(false);
    for (const f of index.facets) for (const v of f.values) expect(index.assets.some((a) => a.labels[f.id]?.includes(v.id))).toBe(true);
    expect(index.hidden!.values).toContainEqual({ facet: "markup", value: "human" });
  });
  test("labels in five languages", () => {
    expect(vocab.locales).toEqual(["en", "fr", "de", "es", "ru"]);
    for (const f of vocab.facets) {
      for (const l of vocab.locales) expect(f.label[l]?.length ?? 0).toBeGreaterThan(0);
      if (!f.valuesFrom) for (const v of f.values) for (const l of vocab.locales) expect(v.label[l]?.length ?? 0).toBeGreaterThan(0);
    }
  });
  test("draft facets are marked in the data and their labels are listed as weak", () => {
    const drafts = vocab.facets.filter((f) => f.draft).map((f) => f.id).sort();
    // the hand-written mapping tables are drafts too (job, composition, media, slots), next to role, character, mood and industry
    expect(drafts).toEqual(["character", "composition", "industry", "job", "media", "mood", "role", "slots"]);
    for (const f of vocab.facets.filter((f) => f.draft)) expect(f.draftNote?.en.length).toBeGreaterThan(0);
    const hero = index.assets.find((a) => a.id === "block.hero/centered")!;
    expect(hero.weak).toContain("role");
    expect(hero.weak).toContain("job");
    expect(hero.weak).not.toContain("section");
  });
  test("at least 12 filter groups besides the type bar, 5 of them open", () => {
    const groups = index.facets.filter((f) => f.ui !== "tabs");
    expect(groups.length).toBeGreaterThanOrEqual(12);
    expect(groups.filter((f) => f.open).map((f) => f.id)).toEqual(["job", "role", "composition", "character", "density"]);
  });
  test("every block and screen has a preview recipe", () => {
    for (const a of index.assets) {
      if (a.preview?.kind === "block") expect(previews.blocks[a.preview.block]?.variants.some((v) => v.id === (a.preview as { variant: string }).variant)).toBe(true);
      if (a.preview?.kind === "screen") expect(previews.screens[a.preview.screen]?.areas[a.preview.area]).toBeDefined();
    }
    expect(index.assets.every((a) => a.preview !== null)).toBe(true);
  });
});

describe("rules", () => {
  const ctx = { axes: { layout: "split", tone: "muted" }, slots: ["MediaFrame"], records: ["Plan"], fields: [], labels: [], colours: [], facets: { job: ["hero"] }, block: "hero", group: "hero" };
  test("a clause matches on any key", () => {
    expect(matches({ block: ["hero"] }, ctx)).toBe(true);
    expect(matches({ axis: { layout: ["bento"] } }, ctx)).toBe(false);
    expect(matches({ axis: { layout: ["bento", "split"] } }, ctx)).toBe(true);
    expect(matches({ facet: { job: ["hero"] } }, ctx)).toBe(true);
    expect(matches({ record: ["Product"], slot: ["MediaFrame"] }, ctx)).toBe(true);
    expect(matches({}, ctx)).toBe(false);
  });
  test("values in vocabulary order, not-clauses, no fallback", () => {
    const f = { id: "x", label: { en: "x" }, ui: "checkbox" as const, order: 0, scope: "shared" as const, source: "auto" as const, derive: "rules",
      values: [{ id: "a", label: { en: "a" }, rules: [{ any: { block: ["hero"] }, not: { group: ["hero"] } }] }, { id: "b", label: { en: "b" }, rules: [{ any: { axis: { tone: ["muted"] } } }] }, { id: "z", label: { en: "z" } }] };
    expect(deriveRules(f, ctx)).toEqual(["b"]);
    expect(deriveRules(f, { ...ctx, axes: {} })).toEqual([]);
  });
});
