// Generator-level safety (item: generated comments and literals): the specs are changed in memory so that every doc (organism,
// prop, record field, slot) carries comment ends and the template syntax of every engine, and one organism (BarChart) prints a
// literal string full of template syntax as its text and as an attribute. Generated for all 8 runtimes: no doc can leave its
// comment or hold template syntax (core/src/comment.ts), and the literal renders as the same inert text on every runtime
// (React, Svelte, Vue, Solid in process from a scratch file beside the real one; Jinja2, Twig, Latte, templ from a scratch copy).
// A control character in a literal is an error at generation.
import { afterAll, expect, test } from "bun:test";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseFragment } from "parse5";
import { fileName, tierDir } from "../../compose-gen";
import { loadOrganisms, runtimeFiles, JS_RUNTIMES } from "../src/organisms";
import { serverOrganismFiles, SERVER_ORG_RT } from "../src/server-organisms";
import type { OrganismSpec } from "../../compose-gen/screens/src/index";
import { REQUIRED, ROOT, SERVER, jsRenderer } from "./render-all";

const DOC = "DOCPWN {{7*191}} {% if 1 %}x{% endif %} {=7*191} {7*191} ${7*191} */ /* --> --!> <!-- #} *} %} \u0007\u2028\r\nnext line ENDPWN";
const LIT = "L{{7*191}}{% if 1 %}J{% endif %}{=7*191}{7*191}{ 7*191 }${7*191}#{7*191}</script><!--x-->'\"&#39;&amp;\\ END";
const PROBE = "BarChart";
const PROPS = { bars: [{ id: "a", label: "Mon", value: 2 }], label: "Sales" };

type Loaded = ReturnType<typeof loadOrganisms>;
/** a deep copy of the loaded specs (inputs and the organisms that are views of them) with docs and the probe changed */
function changed(base: Loaded, lit: string): Loaded {
  const inputs = structuredClone(base.inputs);
  const byName = new Map(inputs.organisms.map((o) => [(o.value as OrganismSpec).name, o.value as OrganismSpec]));
  for (const o of byName.values()) {
    o.docs = `${o.docs} ${DOC}`;
    for (const p of o.props) p.docs = `${p.docs ?? ""} ${DOC}`;
    for (const fields of Object.values(o.records)) for (const f of fields as Array<{ docs?: string }>) f.docs = `${f.docs ?? ""} ${DOC}`;
    for (const s of o.slots as Array<{ docs?: string }>) s.docs = `${s.docs ?? ""} ${DOC}`;
  }
  const probe = byName.get(PROBE)!;
  // the probe Box first, the chart after it (its props stay read: templ refuses an unused variable)
  (probe as { view: unknown[] }).view = [{ use: "Box", attrs: { "data-probe": lit }, children: [{ text: lit }] }, ...(probe as { view: unknown[] }).view];
  return { ...base, inputs, organisms: base.organisms.map((o) => byName.get(o.name)!) };
}

const base = loadOrganisms();
const loaded = changed(base, LIT);
const js = Object.fromEntries(JS_RUNTIMES.map((r) => [r, runtimeFiles(r, loaded)]));
const server = Object.fromEntries(SERVER_ORG_RT.map((r) => [r, serverOrganismFiles(r, loaded)]));

test("a doc in any generated file can neither close its comment nor hold template syntax or a control character", () => {
  const problems: string[] = [];
  let seen = 0;
  for (const files of [...Object.values(js), ...Object.values(server)])
    for (const [rel, body] of files)
      for (let at = body.indexOf("DOCPWN"); at >= 0; at = body.indexOf("DOCPWN", at + 1)) {
        seen++;
        const end = body.indexOf("ENDPWN", at);
        const doc = body.slice(at, end < 0 ? at + 200 : end);
        // a block comment may keep the doc's line break; a line comment continues on the next line with its marker
        const bad = /[{}\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]|\*\/|\/\*|-->|--!>|<!--/.exec(doc.replace(/\n\s*(\/\/|\*|#)?\s*/g, " "));
        if (bad) problems.push(`${rel}: ${JSON.stringify(bad[0])} in ${JSON.stringify(doc.slice(0, 120))}`);
      }
  expect(problems.slice(0, 20)).toEqual([]);
  expect(seen).toBeGreaterThan(1000);
});

test("a control character in a literal is an error at generation, on every runtime", () => {
  const bad = changed(base, "a\u0007b");
  for (const r of JS_RUNTIMES) expect(() => runtimeFiles(r, bad)).toThrow(/control character/);
  for (const r of SERVER_ORG_RT) expect(() => serverOrganismFiles(r, bad)).toThrow(/control character/);
});

/** the text and the data-probe attribute of the probe element (comments dropped: Latte splits `{{` with one), any script element */
function probeOf(html: string): { text: string; attr: string | undefined; problems: string[] } {
  type N = { nodeName: string; tagName?: string; value?: string; attrs?: { name: string; value: string }[]; childNodes?: N[] };
  let text = "", attr: string | undefined;
  const problems: string[] = [];
  const walk = (n: N, inside: boolean) => {
    const own = n.attrs?.find((a) => a.name === "data-probe");
    if (own) attr = own.value;
    if (inside && n.nodeName === "#text") text += n.value ?? "";
    if (n.tagName === "script") problems.push("script element");
    for (const c of n.childNodes ?? []) walk(c, inside || !!own);
  };
  walk(parseFragment(html) as unknown as N, false);
  return { text: text.trim(), attr, problems };
}

const scratch: string[] = [];
afterAll(() => { for (const f of scratch) rmSync(f, { force: true }); });
const probeOrg = loaded.organisms.find((o) => o.name === PROBE)!;
const rel = `${tierDir(probeOrg.id)}/${fileName(probeOrg.name)}`;

test("the literal renders as the same inert text on React, Svelte, Vue and Solid", async () => {
  const render = await jsRenderer(loaded.organisms);
  const ext = { react: "tsx", svelte: "svelte", vue: "vue", solid: "tsx" } as const;
  for (const r of JS_RUNTIMES) {
    const body = js[r]!.get(`${r}/src/${rel}.${ext[r]}`)!;
    expect(body.includes("{{7*191}}") && r === "vue").toBe(false);
    // the scratch file sits beside the real one (same relative imports), named by the process
    const file = path.join(ROOT, `${r}/src/${tierDir(probeOrg.id)}/.probe-${process.pid}.${ext[r]}`);
    writeFileSync(file, body);
    scratch.push(file);
  }
  for (const r of JS_RUNTIMES) {
    const html = await render(r, { organism: PROBE, props: PROPS }, `${tierDir(probeOrg.id)}/.probe-${process.pid}`);
    expect([r, probeOf(html)]).toEqual([r, { text: LIT, attr: LIT, problems: [] }]);
  }
}, 120_000);

for (const r of SERVER_ORG_RT) {
  const missing = SERVER[r].missing();
  if (missing && !REQUIRED) { test.skip(`${r}: ${missing}`, () => {}); continue; }
  test(`${r}: the literal renders as the same inert text`, () => {
    if (missing) throw new Error(missing);
    const own = [...server[r]!].filter(([k]) => k.includes(`/${fileName(PROBE)}.`) || k.endsWith(`/${fileName(PROBE)}`));
    expect(own.length).toBeGreaterThan(0);
    const [html] = SERVER[r].render([{ organism: PROBE, props: PROPS }], new Map(own));
    expect([r, probeOf(html!)]).toEqual([r, { text: LIT, attr: LIT, problems: [] }]);
  }, 300_000);
}
