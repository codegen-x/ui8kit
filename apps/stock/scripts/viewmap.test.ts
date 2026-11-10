// The view map of the registry blocks (props/v0.json viewMap, scripts/lib/viewmap.ts, alexy-os/chaosbun#149) and the data-slot
// pass of the generator it relies on (packages/compose-gen/screens/src/authoring/slots.ts): no data-testid left in a
// component spec, a data-slot on every block root and on every list row that renders an element, and every slot the map names is
// one the generated DOM carries.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { OrganismSpec, ViewNode } from "../../../packages/compose-gen/screens/src/ir";
import { intrinsicSlots } from "../../../packages/compose-gen/parts";
import type { PropsIndex } from "./lib/props";
import { OUTPUTS } from "./lib/build";

const SPECS = join(import.meta.dir, "..", "..", "..", "packages", "compose-gen", "specs");
const specs: OrganismSpec[] = ["organisms", "parts", "patterns"].flatMap((d) =>
  readdirSync(join(SPECS, d)).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(join(SPECS, d, f), "utf8")) as OrganismSpec));
const byName = new Map(specs.map((s) => [s.name, s]));
const P = JSON.parse(readFileSync(OUTPUTS.props, "utf8")) as PropsIndex;
const INTRINSIC = intrinsicSlots();

const kids = (n: ViewNode): ViewNode[][] => {
  if ("use" in n) return n.children ? [n.children] : [];
  if ("when" in n) return [n.then, ...(n.else ?? [])].length ? [n.then, n.else ?? []] : [];
  if ("each" in n) return [n.do];
  if ("organism" in n) return Object.values(n.slots ?? {}).map((s) => s.do);
  return [];
};
/** the data-slot values a spec can write: literals and the string arguments of coalesce */
const slotValues = (v: unknown): string[] => typeof v === "string" ? [v]
  : v && typeof v === "object" && (v as { op?: string }).op === "coalesce" ? (v as { args: unknown[] }).args.filter((a): a is string => typeof a === "string") : [];
/** a node renders an element that carries a data-slot (a nested component: its root) */
function slotted(n: ViewNode, seen: string[] = []): boolean {
  if ("use" in n) return INTRINSIC.has(n.use) || n.attrs?.["data-slot"] !== undefined;
  if ("when" in n) return [...n.then, ...(n.else ?? [])].every((k) => slotted(k, seen));
  if ("slot" in n) return true; // a transparent wrapper (SectionBox unboxed): the root is what the caller puts in
  if ("organism" in n) { const c = byName.get(n.organism); return !!c && !seen.includes(c.name) && c.view.every((k) => slotted(k, [...seen, c.name])); }
  return false;
}

describe("data-slot on roots and rows (generator)", () => {
  const all = new Set<string>(INTRINSIC.values());
  const walk = (nodes: ViewNode[], visit: (n: ViewNode) => void): void => { for (const n of nodes) { visit(n); for (const k of kids(n)) walk(k, visit); } };
  for (const s of specs) walk(s.view, (n) => {
    if ("use" in n) for (const v of slotValues(n.attrs?.["data-slot"])) all.add(v);
    // a component whose root slot is a prop (NavBlock, MenuEntry, ...): the names its callers pass
    if ("organism" in n && typeof n.props?.["testid"] === "string") all.add(n.props["testid"] as string);
  });

  test("no component spec writes data-testid", () => {
    const bad: string[] = [];
    for (const s of specs) walk(s.view, (n) => { if ("use" in n && n.attrs && "data-testid" in n.attrs) bad.push(s.id); });
    expect(bad).toEqual([]);
  });
  test("every root of every block renders a data-slot", () => {
    const bad = specs.filter((s) => s.id.startsWith("organism.")).filter((s) => !s.view.filter((n) => "use" in n || "organism" in n || "when" in n).every((n) => slotted(n))).map((s) => s.id);
    expect(bad).toEqual([]);
  });
  test("every list row that renders an element has a data-slot", () => {
    const bad: string[] = [];
    for (const s of specs) walk(s.view, (n) => {
      if (!("each" in n)) return;
      for (const r of n.do) if (("use" in r || "organism" in r) && !slotted(r)) bad.push(`${s.id}: ${JSON.stringify(n.each)}`);
    });
    expect(bad).toEqual([]);
  });
  test("every slot the view maps name is a slot the specs write", () => {
    const bad: string[] = [];
    for (const [name, item] of Object.entries(P.items)) {
      for (const [p, rows] of Object.entries(item.viewMap.rows)) for (const r of rows) if (!all.has(r)) bad.push(`${name} ${p} row ${r}`);
      for (const [p, places] of Object.entries(item.viewMap.fields)) for (const e of places) for (const sl of [e.in, e.s]) if (sl !== undefined && !all.has(sl)) bad.push(`${name} ${p} ${sl}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("viewMap in props/v0.json", () => {
  test("every registry block has a view map with fields", () => {
    for (const [name, item] of Object.entries(P.items)) {
      expect(typeof item.viewMap.rows, name).toBe("object");
      expect(Object.keys(item.viewMap.fields).length, name).toBeGreaterThan(0);
    }
  });
  test("a list path has its rows, a field inside a list is written with []", () => {
    const fg = P.items["feature-grid"]!.viewMap;
    expect(fg.rows["/features"]).toContain("feature-card");
    expect(fg.fields["/features/[]/title"]!.some((e) => e.k === "text")).toBe(true);
    expect(fg.fields["/title"]!.some((e) => e.k === "text")).toBe(true);
    expect(fg.fields["/action/href"]!.every((e) => e.k === "attr" && e.a === "href")).toBe(true);
    for (const item of Object.values(P.items)) for (const p of Object.keys(item.viewMap.fields)) expect(p).toMatch(/^\/[A-Za-z0-9_]+(\/([A-Za-z0-9_]+|\[\]))*$/);
  });
});
