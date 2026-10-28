// XSS / SSTI fuzz of the organisms on all 8 runtimes (React, Svelte, Vue, Solid, Jinja2, Twig, Latte, templ): every gallery block
// case with its string props replaced by attack payloads (markup, event handlers, obfuscated javascript: URLs, protocol-relative
// hosts, </style>, the template syntax of each engine), in rounds that move the payloads over the props, plus a round with
// a TrustedHtml marker key (__html) on every object at any depth outside a TrustedHtml prop. Each output is parsed (parse5): no script, iframe,
// object, embed or style element, no on* attribute, no URL, srcset or style the runtime check (assets/ts/safe.ts) refuses, no
// evaluated template (7*191 = 1337); every round prints the same DOM as React on every runtime.
// UI8KIT_FUZZ_ROUNDS (default 2) sets the string rounds; without a toolchain a server runtime is skipped (UI8KIT_REQUIRE_ALL_RUNTIMES=1 fails).
import { expect, test } from "bun:test";
import { parseFragment } from "parse5";
import { blockCases, normalizeHtml } from "../../compose-gen";
import { isSafeUrl, srcsetOf, styleOf } from "../../compose-gen/runtimes/core/assets/ts/safe";
import { loadOrganisms } from "../src/organisms";
import { SERVER_ORG_RT } from "../src/server-organisms";
import { norm as tokens } from "./shared";
import { JS_RT, REQUIRED, SERVER, jsRenderer, type Case } from "./render-all";

export const HTML_PAYLOADS = [
  `<script>alert(1)</script>`,
  `<img src=x onerror=alert(1)>`,
  `"><svg onload=alert(1)>`,
  `'><iframe src="javascript:alert(1)"></iframe>`,
  `</style><script>alert(1)</script>`,
  `</textarea></title><script>alert(1)</script>`,
  `<a href="javascript:alert(1)" onclick="alert(1)">x</a>`,
  `x" onmouseover="alert(1)" y="`,
  `{{7*191}}`, `{{ 7*'191' }}`, `{% if 1 %}{{ 7*191 }}{% endif %}`, `{{ _self.env.registerUndefinedFilterCallback('system') }}`,
  `{=7*191}`, `{7*191}`, `{* x *}{$x}`, `{# c #}{{ cycler.__init__.__globals__ }}`,
  `{ 7*191 }`, `@{ 7*191 }`, `\${7*191}`, `#{7*191}`, `<%= 7*191 %>`, `{@html '<script>alert(1)</script>'}`,
];
export const URL_PAYLOADS = [
  `javascript:alert(1)`, `JaVaScRiPt:alert(1)`, ` javascript:alert(1)`, `java\tscript:alert(1)`, `java\nscript:alert(1)`, `\u0001javascript:alert(1)`,
  `&#106;avascript:alert(1)`, `&#x6A;avascript:alert(1)`, `&#0000106avascript:alert(1)`, `javascript&colon;alert(1)`, `jav&#x09;ascript:alert(1)`, `&amp;#106;avascript:alert(1)`,
  `vbscript:msgbox(1)`, `data:text/html,<script>alert(1)</script>`, `data:image/svg+xml;base64,PHN2Zz4=`,
  `//evil.example/x.png`, `/\\evil.example/x`, `\\\\evil.example/x`, ` //evil.example`, `/&#47;evil.example`,
  `x.png 1x, javascript:alert(1) 2x`, `" onerror="alert(1)`, `url(javascript:alert(1))`,
];
const URL_KEY = /(href|src|url|link|image|avatar|logo|photo|cover|poster|action|srcset|picture|thumb)$/i;
/** a string that names a variant, an icon, a tone, a currency or a locale (one word): left as it is, the organism would only fall back to its default */
const WORD = /^[A-Za-z0-9]+(?:[-_:.][A-Za-z0-9]+)*$/;

type Json = unknown;
/** the case with its string leaves replaced: URL-like keys take URL payloads, others markup/SSTI ones, rotated by leaf and round */
function mutate(v: Json, round: number, key = "", at = { i: 0 }): Json {
  if (typeof v === "string") {
    if (WORD.test(v) && !URL_KEY.test(key)) return v;
    const list = URL_KEY.test(key) ? URL_PAYLOADS : HTML_PAYLOADS;
    return list[(at.i++ + round * 5) % list.length];
  }
  if (Array.isArray(v)) return v.map((x) => mutate(x, round, key, at));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "__html" ? x : mutate(x, round, k, at)]));
  return v;
}
/** TrustedHtml markers at any depth outside the TrustedHtml props (RichText content, aside.content): every object in the props (each
 *  record, each item, at any depth) also carries `__html` with a payload, so a runtime that took any object with the key as markup shows it */
function markers(v: Json, trusted: Set<string>, path = ""): Json {
  if (Array.isArray(v)) return v.map((x) => markers(x, trusted, path));
  if (v && typeof v === "object") {
    if ("__html" in v || trusted.has(path)) return v;
    const fields = Object.entries(v).map(([k, x]) => [k, markers(x, trusted, path ? `${path}.${k}` : k)]);
    // not on the props bag itself: Vue passes an undeclared prop on as an attribute of the root (escaped, but no React parity)
    return Object.fromEntries(path === "" ? fields : [...fields, ["__html", HTML_PAYLOADS[path.length % 8]!]]);
  }
  return v;
}

type Node = { nodeName: string; tagName?: string; attrs?: { name: string; value: string }[]; childNodes?: Node[]; content?: Node; value?: string };
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "cite", "background", "data", "xlink:href"]);
const BAD_TAGS = new Set(["script", "iframe", "object", "embed", "style", "base", "meta", "link", "frame", "frameset"]);
/** what the parsed output must not hold (see the file comment) */
export function domProblems(html: string): string[] {
  const out: string[] = [];
  const walk = (n: Node): void => {
    if (n.tagName && BAD_TAGS.has(n.tagName)) out.push(`<${n.tagName}> element`);
    for (const a of n.attrs ?? []) {
      const name = a.name.toLowerCase();
      // Svelte's own image load/error capture (onload="this.__e=event", the same text whatever the props) is no payload
      if (name.startsWith("on") && !((name === "onload" || name === "onerror") && a.value === "this.__e=event")) out.push(`${n.tagName} ${a.name}="${a.value}"`);
      if (URL_ATTRS.has(name) && !isSafeUrl(a.value, name === "src" || name === "poster")) out.push(`${n.tagName} ${name}="${a.value}"`);
      if ((name === "srcset" || name === "imagesrcset") && srcsetOf(a.value) !== a.value) out.push(`${n.tagName} srcset="${a.value}"`);
      if (name === "style" && styleOf(a.value) !== a.value) out.push(`${n.tagName} style="${a.value}"`);
    }
    if (n.nodeName === "#text" && /1337/.test(n.value ?? "")) out.push(`evaluated template: ${JSON.stringify(n.value)}`);
    for (const c of n.childNodes ?? []) walk(c);
    if (n.content) walk(n.content);
  };
  walk(parseFragment(html) as unknown as Node);
  return out;
}

const norm = (html: string) => normalizeHtml(tokens(html)).replace(/ style="([^"]*?);"/g, ' style="$1"');
const loaded = loadOrganisms();
const gallery = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name))).cases;
const ROUNDS = Number(process.env.UI8KIT_FUZZ_ROUNDS ?? 2);
/** the TrustedHtml props of each organism (props and record fields of type TrustedHtml), as dotted paths */
const trustedOf = (name: string): Set<string> => {
  const o = loaded.organisms.find((x) => x.name === name)!;
  const out = new Set<string>();
  for (const p of o.props) {
    if (p.type === "TrustedHtml") out.add(p.name);
    const rec = typeof p.type === "object" && "record" in p.type ? (o.records as Record<string, Array<{ name: string; type: unknown }>>)[p.type.record] : undefined;
    for (const f of rec ?? []) if (f.type === "TrustedHtml") out.add(`${p.name}.${f.name}`);
  }
  return out;
};
const strings: Array<Case & { label: string }> = [];
for (let r = 0; r < ROUNDS; r++) for (const c of gallery) strings.push({ label: `${c.label} #${r}`, organism: c.organism, props: mutate(c.props, r) });
const marked: Array<Case & { label: string }> = gallery.map((c) => ({ label: `${c.label} __html`, organism: c.organism, props: markers(c.props, trustedOf(c.organism)) }));
const all = [...strings, ...marked];
const PAYLOADS = HTML_PAYLOADS.length + URL_PAYLOADS.length;

test("the DOM check sees what it must refuse", () => {
  expect(domProblems(`<p>ok <a href="/x">x</a><img src="data:image/png;base64,AA" srcset="a.png 1x"></p>`)).toEqual([]);
  for (const bad of [`<script>x</script>`, `<img onerror=x>`, `<a href="jav&#x09;ascript:x">`, `<a href="//evil">`, `<img srcset="a.png 1x, javascript:x 2x">`, `<p style="background:url(javascript:x)">`, `<p>1337</p>`, `<style>p{}</style>`])
    expect([bad, domProblems(bad).length > 0]).toEqual([bad, true]);
});

let react: string[] = [];
test(`react, svelte, vue, solid: ${all.length} fuzz cases each (${gallery.length} gallery cases x ${ROUNDS} string rounds + 1 marker round, ${PAYLOADS} payloads), safe and the same DOM`, async () => {
  const render = await jsRenderer(loaded.organisms);
  const problems: string[] = [];
  for (const rt of JS_RT) {
    const out: string[] = [];
    for (const c of all) out.push(await render(rt, c));
    if (rt === "react") react = out;
    console.log(`fuzz ${rt}: ${out.length} cases, ${out.filter((h) => h.startsWith("ERROR:")).length} render errors`);
    out.forEach((html, i) => {
      const c = all[i]!;
      if (html.startsWith("ERROR:")) { if (i < strings.length) problems.push(`${c.label} ${rt}: ${html}`); return; }
      problems.push(...domProblems(html).map((p) => `${c.label} ${rt}: ${p}`));
      if (rt !== "react" && !react[i]!.startsWith("ERROR:") && norm(html) !== norm(react[i]!)) problems.push(`${c.label} ${rt}: differs from react`);
    });
  }
  if (problems.length) console.error(`${problems.length} problems\n` + problems.slice(0, 40).join("\n"));
  expect(problems).toEqual([]);
  expect(strings.length).toBeGreaterThan(400 * ROUNDS);
  // the payloads reach the output (as text): most string-round cases print one
  expect(react.slice(0, strings.length).filter((h) => /alert\(1\)|7\*191|7\*'191'/.test(h)).length).toBeGreaterThan(strings.length / 2);
}, 1_200_000);

for (const rt of SERVER_ORG_RT) {
  const missing = SERVER[rt].missing();
  if (missing && !REQUIRED) { test.skip(`${rt} fuzz: ${missing}`, () => {}); continue; }
  test(`${rt}: ${all.length} fuzz cases, safe and the same DOM as React`, () => {
    if (missing) throw new Error(missing);
    expect(react.length).toBe(all.length);
    const html = SERVER[rt].render(all);
    expect(html.length).toBe(all.length);
    const problems: string[] = [];
    console.log(`fuzz ${rt}: ${html.length} cases, ${html.filter((h) => h.startsWith("ERROR:")).length} render errors`);
    html.forEach((h, i) => {
      const c = all[i]!;
      if (h.startsWith("ERROR:")) { if (i < strings.length) problems.push(`${c.label}: ${h}`); return; }
      problems.push(...domProblems(h).map((p) => `${c.label}: ${p}`));
      if (!react[i]!.startsWith("ERROR:") && norm(h) !== norm(react[i]!)) problems.push(`${c.label}: differs from react`);
    });
    if (problems.length) console.error(`${rt}: ${problems.length} problems\n` + problems.slice(0, 40).join("\n"));
    expect(problems).toEqual([]);
  }, 1_200_000);
}
