// compose-gen check: every group passes on the repository, and each one finds the problem it is there for (a seeded copy of the inputs).
import { expect, test } from "bun:test";
import {
  loadCtx, runChecks, checkDictionary, checkRoutes, checkThemes, checkDead, checkDuplicates, checkVersions, checkRegistry, checkStructure,
  cycles, sameKey, cyrillicLine, readabilityProblems, kebab, leavesOf, getAt, type Ctx,
} from "../src/groups/index";

const ctx = loadCtx();
/** a deep copy of the context whose inputs a test may change */
const seeded = (f: (c: Ctx) => void): Ctx => { const c = { ...ctx, inputs: structuredClone(ctx.inputs), apps: structuredClone(ctx.apps), problems: [] }; f(c); return c; };

test("every group passes on the repository", () => {
  const results = runChecks(ctx);
  expect(results.map((r) => r.name)).toEqual(["authored", "schema", "registry", "themes", "routes", "dictionary", "text", "dead", "duplicates", "readability", "structure", "versions"]);
  expect(results.filter((r) => r.problems.length).map((r) => `${r.name}: ${r.problems.slice(0, 3).join("; ")}`)).toEqual([]);
});

test("the context: 243 organism specs, 92 blocks, 15 screens, 4 host apps", () => {
  expect(ctx.inputs.organisms.length).toBe(243);
  expect(ctx.inputs.blocks.length).toBe(92);
  expect(ctx.inputs.screens.length).toBe(15);
  expect(ctx.apps.map((a) => a.app.runtime).sort()).toEqual(["react", "solid", "svelte", "vue"]);
});

test("dictionary: a key nothing reads is named", () => {
  const c = seeded((c) => { (c.inputs.dictionary.value as Record<string, unknown>).unusedProbe = "x"; });
  expect(checkDictionary(c).problems.some((p) => p.includes("unusedProbe is read by no view"))).toBe(true);
});

test("routes: a menu entry without a route and a host screen that does not exist are named", () => {
  const c = seeded((c) => {
    const s = c.inputs.screens.find((x) => (x.value.menu ?? []).length)!;
    s.value.menu![0]!.path = "/nowhere";
    c.apps[0]!.app.screens = ["screen.missing"];
  });
  const p = checkRoutes(c).problems;
  expect(p.some((x) => x.includes('has no route "/nowhere"'))).toBe(true);
  expect(p.some((x) => x.includes("screen screen.missing does not exist"))).toBe(true);
});

test("themes: two hosts on one port", () => {
  const c = seeded((c) => { c.apps[1]!.app.port = c.apps[0]!.app.port; });
  expect(checkThemes(c).problems.some((p) => p.startsWith("port "))).toBe(true);
});

test("dead: an organism no screen draws and a status word no fixture uses", () => {
  const c = seeded((c) => {
    const o = structuredClone(c.inputs.organisms.find((x) => x.value.id.startsWith("organism."))!);
    o.value.id = "organism.probe-unused"; o.value.name = "ProbeUnused"; o.file = "probe.json";
    c.inputs.organisms.push(o);
    ((c.inputs.dictionary.value as { status: Record<string, string> }).status).probe_word = "Probe";
  });
  const p = checkDead(c).problems;
  expect(p.some((x) => x.includes("ProbeUnused is drawn by no screen"))).toBe(true);
  expect(p.some((x) => x.includes("status.probe_word"))).toBe(true);
});

test("duplicates: two fixtures with the same entries", () => {
  const c = seeded((c) => { const f = structuredClone(c.inputs.collections[0]!); f.file = "copy.json"; c.inputs.collections.push(f); });
  expect(checkDuplicates(c).problems.some((p) => p.startsWith("fixtures:"))).toBe(true);
});

test("versions: a spec without specVersion", () => {
  const c = seeded((c) => { delete (c.inputs.blocks[0]!.value as { specVersion?: number }).specVersion; });
  expect(checkVersions(c).problems.some((p) => p.includes("has no specVersion"))).toBe(true);
});

test("registry: a missing coverage document, a layout whose block is gone are named", () => {
  expect(checkRegistry({ ...ctx, root: "/nonexistent-root" }).problems.some((p) => p.includes("missing; run"))).toBe(true);
  const c = seeded((c) => { c.inputs.blocks.length = 0; });
  const p = checkRegistry(c).problems;
  expect(p.some((x) => /: no block /.test(x))).toBe(true);
  expect(p.some((x) => x.includes("differs from the registry"))).toBe(true);
});

test("structure: cycles, a seeded root with no sources passes", () => {
  expect(cycles(new Map([["a", ["b"]], ["b", ["a"]], ["c", ["a"]]]))).toEqual([["a", "b"]]);
  expect(cycles(new Map([["a", ["b"]], ["b", []]]))).toEqual([]);
  expect(checkStructure({ ...ctx, root: "/nonexistent-root" }).problems).toEqual([]);
});

test("helpers: sameKey, cyrillicLine, kebab, leavesOf, getAt", () => {
  expect(sameKey([{ key: "x", file: "a" }, { key: "x", file: "b" }, { key: "y", file: "c" }])).toEqual([["a", "b"]]);
  expect(cyrillicLine("ok\nstill ok\n\u043f\u0440\u0438\u0432\u0435\u0442")).toBe(3);
  expect(cyrillicLine("english only")).toBe(0);
  expect(kebab("HeroSection")).toBe("hero-section");
  expect(kebab("FAQList")).toBe("faq-list");
  expect(leavesOf({ a: { b: "1", c: { d: "2" } }, e: "3" })).toEqual(["a.b", "a.c.d", "e"]);
  expect(getAt({ a: { b: "1" } }, "a.b")).toBe("1");
});

test("readability ratchet: worse fails, better asks to lower the allowance", () => {
  expect(readabilityProblems({ hero: { lines: 200 } }, {})).toHaveLength(1);
  expect(readabilityProblems({ hero: { lines: 200 } }, { hero: { lines: 200 } })).toEqual([]);
  expect(readabilityProblems({ hero: { lines: 180 } }, { hero: { lines: 200 } })[0]).toContain("lower the allowance");
});
