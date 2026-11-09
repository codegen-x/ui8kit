// The variant presets (content/variants.v0.json, src/lib/variants.ts): one entry for every block variant Stock shows, under the
// registry name of the organism that draws it (in the registry snapshot fixtures/registry-blocks.json), and the props of an entry
// over the sample content are exactly the props the gallery draws the variant with (compose-kit.ts blockProps).
import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { blockProps, drawnBy } from "../../../packages/compose-gen/screens/src/compose-kit";
import type { BlockSpec, OrganismSpec } from "../../../packages/compose-gen/screens/src/ir";
import { build, OUTPUTS, ROOT, serialise } from "./lib/build";
import { kebab } from "../src/lib/install";
import { mergeProps, type VariantIndex } from "../src/lib/variants";

const built = build();
const v = built.variants;
const names = new Set((JSON.parse(readFileSync(join(import.meta.dir, "fixtures", "registry-blocks.json"), "utf8")) as { names: string[] }).names);
const specs = (dir: string): unknown[] => readdirSync(join(ROOT, "packages", "compose-gen", "specs", dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => JSON.parse(readFileSync(join(ROOT, "packages", "compose-gen", "specs", dir, f), "utf8")));
const blocks = specs("blocks") as BlockSpec[];
const orgs = Object.fromEntries((specs("organisms") as OrganismSpec[]).map((o) => [o.name, o]));

describe("variants", () => {
  test("the committed variants.v0.json is the fresh build, and its digest is the sha256 of the file without it", () => {
    expect(readFileSync(OUTPUTS.variants, "utf8")).toBe(serialise(built).variants);
    const { digest, ...body } = JSON.parse(readFileSync(OUTPUTS.variants, "utf8")) as VariantIndex;
    expect(digest).toBe("sha256:" + createHash("sha256").update(JSON.stringify(body)).digest("hex"));
  });
  test("every block variant of Stock has its entry, under its registry name, and nothing else is listed", () => {
    const assets = built.index.assets.filter((a) => a.type === "block" && a.variant);
    expect(assets.length).toBe(built.index.counts["block"]);
    const listed = Object.entries(v.items).flatMap(([name, it]) => Object.entries(it.variants).map(([id, p]) => ({ name, id, asset: p.asset })));
    expect(listed.length).toBe(assets.length);
    for (const a of assets) expect(listed.find((l) => l.asset === a.id)).toEqual({ name: a.registry!, id: a.variant!, asset: a.id });
  });
  test("every item is a block of the registry, drawn by its organism; the default variant is one of its variants", () => {
    for (const [name, it] of Object.entries(v.items)) {
      expect(names.has(name)).toBe(true);
      expect(name).toBe(kebab(it.organism));
      expect(it.variants[it.defaultVariant]).toBeDefined();
      expect(Object.keys(it.variants)[0]).toBe(it.defaultVariant);
      for (const [axis, value] of Object.entries(it.defaults)) expect(it.axes[axis]).toContain(value);
      for (const p of Object.values(it.variants)) for (const [axis, value] of Object.entries(p.set)) expect(it.axes[axis]).toContain(value);
    }
  });
  test("sample content under the props of an entry is what the gallery draws the variant with (blockProps)", () => {
    let n = 0;
    for (const b of blocks) for (const variant of b.variants) {
      const org = drawnBy(b, variant);
      const it = v.items[kebab(org)]!;
      expect(it.organism).toBe(org);
      const gallery = blockProps(b, variant, {}, orgs[org]);
      const own = new Set(Object.keys(gallery));
      const mine = Object.fromEntries(Object.entries(mergeProps(b.sample.props as never, it.variants[variant.id]!.props)).filter(([k]) => !b.alt || own.has(k)));
      expect(mine).toEqual(gallery as never);
      n++;
    }
    expect(n).toBe(built.index.counts["block"]);
  });
  test("features: the presets the gallery authors (blocks.ts) are the data", () => {
    const f = v.items["feature-grid"]!;
    expect(Object.keys(f.variants)).toEqual(["grid", "grid2", "tiles4", "cells4", "rows", "rowsStart", "rowsAlternate", "tilesMuted"]);
    expect(f.variants["cells4"]).toEqual({ asset: "block.features/cells4", set: { cols: "1-4", item: "cell", density: "compact" }, props: { layout: "grid", cols: "1-4", item: "cell", mediaSide: "end", tone: "default", density: "compact", action: { label: { $: "ui.site.home.featuresAction" }, href: "#/" } } });
    // hero draws HeroPrompt when chrome is nav: its own item, without the chrome axis
    expect(Object.keys(v.items["hero-prompt"]!.variants)).toEqual(["prompt"]);
    expect(v.items["hero-prompt"]!.axes["chrome"]).toBeUndefined();
    expect(v.items["hero-classic"]!.variants["prompt"]).toBeUndefined();
  });
});
