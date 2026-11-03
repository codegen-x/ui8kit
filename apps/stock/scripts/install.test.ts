// The install objects (content/install.v0.json, src/lib/install.ts): every registry name the index computes is a block of the ui8kit
// registry (snapshot of https://registry.buildy.tw/react/index.json in fixtures/registry-blocks.json; refresh it when the registry
// gains blocks), every docs link is the block's page on ui.buildy.tw, and the committed file is the fresh build.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { build, OUTPUTS, serialise } from "./lib/build";
import { DOCS_URL, REGISTRY_URL, RUNTIMES, install } from "../src/lib/install";

const built = build();
const names = new Set((JSON.parse(readFileSync(join(import.meta.dir, "fixtures", "registry-blocks.json"), "utf8")) as { names: string[] }).names);
const all = [...Object.values(built.install.blocks), ...Object.values(built.install.screens)];
const DOCS = /^https:\/\/ui\.buildy\.tw\/blocks\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;

describe("install", () => {
  test("the committed install.v0.json is the fresh build", () => {
    expect(readFileSync(OUTPUTS.install, "utf8")).toBe(serialise(built).install);
  });
  test("every block variant names a registry block, and has its install object", () => {
    const blocks = built.index.assets.filter((a) => a.type === "block");
    expect(blocks.length).toBe(513);
    for (const a of blocks) {
      expect(names.has(a.registry!)).toBe(true);
      expect(built.install.blocks[a.registry!]?.items.map((i) => i.name)).toEqual([a.registry!]);
    }
    // hero is drawn by HeroPrompt when the chrome is nav
    expect(built.index.assets.find((a) => a.id.startsWith("block.hero/") && a.registry === "hero-prompt")).toBeDefined();
  });
  test("every screen page has the deduplicated blocks of the page and one combined command per runtime", () => {
    const screens = built.index.assets.filter((a) => a.type === "screen");
    expect(Object.keys(built.install.screens).sort()).toEqual(screens.map((a) => a.id).sort());
    for (const i of Object.values(built.install.screens)) {
      const n = i.items.map((x) => x.name);
      expect(new Set(n).size).toBe(n.length);
      expect(n.length).toBeGreaterThan(0);
      for (const rt of RUNTIMES) expect(i.commands[rt]).toBe(`npx ui8kit add ${n.join(" ")} --framework ${rt}`);
    }
  });
  test("every item exists in the registry and links to its page on the docs site", () => {
    for (const i of all) {
      expect(i.registry).toBe(REGISTRY_URL);
      expect(Object.keys(i.commands)).toEqual([...RUNTIMES]);
      for (const it of i.items) { expect(names.has(it.name)).toBe(true); expect(it.docs).toBe(`${DOCS_URL}/blocks/${it.name}/`); expect(it.docs).toMatch(DOCS); }
    }
  });
  test("install() dedupes in first-occurrence order; nothing is null", () => {
    expect(install([])).toBeNull();
    expect(install(["a", "b", "a"])!.commands.vue).toBe("npx ui8kit add a b --framework vue");
  });
});
