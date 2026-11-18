import { expect, test } from "bun:test";
import Ajv2020 from "ajv/dist/2020.js";
import { join } from "node:path";
import { loadModels, propsProblems, schemaOf, typesOf, validate } from "../src/index";
import { blocks } from "../../screens/src/index";
import { allOrganisms } from "../../screens/src/authoring/blocks/organisms";

const root = join(import.meta.dir, "..", "..");
const models = loadModels(root);
const hero = models.get("hero@1")!.model;
const team = models.get("team@1")!.model;
const ajv = new Ajv2020({ allErrors: true, strict: false });
const people = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `m${i}`, title: `Person ${i}` }));

const cases: Array<[string, typeof hero, unknown]> = [
  ["hero whole", hero, { badge: "New", title: "T", description: "D", image: "https://x/a.png", imageAlt: "A", imageDark: "/a-dark.png", actionLabel: "Go", actionHref: "#/go" }],
  ["hero title only", hero, { title: "T" }],
  ["hero no title", hero, { badge: "x" }],
  ["hero blank title", hero, { title: "  " }],
  ["hero unknown field", hero, { title: "T", extra: 1 }],
  ["hero javascript link", hero, { title: "T", actionHref: "javascript:alert(1)" }],
  ["hero mailto link", hero, { title: "T", actionHref: "mailto:a@b.c" }],
  ["hero data picture", hero, { title: "T", image: "data:image/png;base64,AA" }],
  ["hero long badge", hero, { title: "T", badge: "x".repeat(41) }],
  ["hero not an object", hero, []],
  ["team whole", team, { title: "T", description: "D", members: people(3) }],
  ["team none", team, { title: "T", members: [] }],
  ["team twelve", team, { title: "T", members: people(12) }],
  ["team thirteen", team, { title: "T", members: people(13) }],
  ["team member without a name", team, { title: "T", members: [{ id: "a" }] }],
  ["team member bad id", team, { title: "T", members: [{ id: "a b", title: "A" }] }],
  ["team member unknown field", team, { title: "T", members: [{ id: "a", title: "A", role: "x" }] }],
];

test("validate() agrees with the JSON Schema 2020-12 on every case", () => {
  const compiled = new Map([hero, team].map((m) => [m, ajv.compile(schemaOf(m))]));
  for (const [name, m, value] of cases) {
    const fn = compiled.get(m)!;
    expect({ name, valid: validate(m, value).length === 0 }).toEqual({ name, valid: fn(value) as boolean });
  }
});

test("issues are JSON pointers", () => {
  expect(validate(team, { title: "T", members: [{ id: "a", title: "A" }, { id: "b" }] })).toEqual([{ path: "/members/1/title", message: "required" }]);
  expect(validate(hero, { title: "T", actionHref: "javascript:x" })[0]!.path).toBe("/actionHref");
});

test("the schema is closed and published under registry.buildy.tw", () => {
  const s = schemaOf(team) as { $id: string; additionalProperties: boolean; properties: { members: { items: { additionalProperties: boolean } } } };
  expect(s.$id).toBe("https://registry.buildy.tw/models/team@1.schema.json");
  expect(s.additionalProperties).toBe(false);
  expect(s.properties.members.items.additionalProperties).toBe(false);
});

test("the types name the records and the content", () => {
  const ts = typesOf(team);
  expect(ts).toContain("export type SimpleMember = {");
  expect(ts).toContain("export type TeamContent = {");
  expect(ts).toContain("  members: SimpleMember[];");
  expect(typesOf(hero)).toContain("  imageDark?: string;");
});

test("the model blocks take exactly their model fields; a missing or extra prop is named", () => {
  const byName = new Map(allOrganisms.map((o) => [o.name, o]));
  const simple = blocks.filter((b) => b.model);
  expect(simple.map((b) => [b.id, b.model, b.line])).toEqual([["block.herosimple", "hero@1", "simple"], ["block.teamsimple", "team@1", "simple"]]);
  for (const b of simple) expect(propsProblems(b, byName.get(b.organism)!, models.get(b.model!)!.model)).toEqual([]);
  const b = simple[0]!, org = byName.get(b.organism)!;
  const broken = { ...org, props: [...org.props.filter((p) => p.name !== "badge"), { name: "extra", type: "string" as const }] };
  expect(propsProblems(b, broken, hero).join("\n")).toContain("model field badge is no prop");
  expect(propsProblems(b, broken, hero).join("\n")).toContain("prop extra is neither");
});
