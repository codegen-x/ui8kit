// Organisms on kit-compose (src/organisms.ts): generated files up to date; every gallery block case (xgen/specs/blocks, the
// case table of the xgen template gates) rendered by React (the reference), Svelte, Vue and Solid on the server with the same
// DOM; html-validate + axe on the React output; no raw HTML in the generated organism sources.
import { test, expect } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { parseFragment } from "parse5";
import { tierDir, fileName } from "@ui8kit/xgen-screens";
import { blockCases } from "../../../xgen/check/src/templ/blocks";
import { files, loadOrganisms, JS_RUNTIMES } from "../src/organisms";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { checkSourceText } from "../../ui-gates/src/source.mjs";
import { installSsrPlugin } from "./ssr";
import { norm as tokens } from "./shared";
import { normalizeHtml } from "../../../xgen/check/src/templ/normalize";

// the DOM tree contract of the xgen gates (attributes by name, class tokens sorted, text trimmed) after the SSR artifacts
// Vue serializes style="height:1px;" where React writes style="height:1px": the same declarations
const norm = (html: string) => normalizeHtml(tokens(html)).replace(/ style="([^"]*?);"/g, ' style="$1"');

installSsrPlugin();
const loaded = loadOrganisms();
const generated = files();
const { cases } = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name)));
const byName = Object.fromEntries(loaded.organisms.map((o) => [o.name, o]));
const quiet = <T,>(f: () => T): T => { const w = console.warn, e = console.error; console.warn = console.error = () => {}; try { return f(); } finally { console.warn = w; console.error = e; } };

test("generated organisms are up to date", () => {
  for (const [rel, body] of generated) expect(readFileSync(new URL(`../${rel}`, import.meta.url), "utf8"), rel).toBe(body);
  expect(loaded.organisms.length).toBeGreaterThanOrEqual(224);
});

/**
 * Known gaps of the installed kit (UI8Kit 3.2.0), reported, not hidden: the v3 Text tag allowlist has no <del>, so the
 * compare-at price of ProductPrice / ProductCard (spec Tag "del") renders the Text fallback <p> (line-through class kept).
 * Fix upstream: del/ins in the Text tags of ui8kit/codegen, then a kit update.
 */
const KNOWN_KIT_GAPS: Record<string, RegExp> = { 'tag "del" is not an HTML5 Box/Text tag': /\/(product-card|product-price)\.(tsx|svelte|vue)$/ };

test("no raw HTML where a primitive exists in the organism sources", () => {
  const src = [...generated].filter(([f]) => /\/src\/(blocks|components)\/[^/]+\.(tsx|svelte|vue)$/.test(f)).flatMap(([f, body]) => checkSourceText(body, f));
  const known = src.filter((p) => Object.entries(KNOWN_KIT_GAPS).some(([m, f]) => p.message.includes(m) && f.test(p.file)));
  expect(src.filter((p) => !known.includes(p)).map((p) => `${p.file}:${p.line} ${p.rule} ${p.message}`)).toEqual([]);
  expect(known.length).toBe(8); // 2 organisms x 4 runtimes: a fixed kit makes this fail, then drop the entry
});

const rendered: { id: string; html: string }[] = [];
/** the two HTML strings around their first difference */
function firstDiff(a: string, b: string, rt: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const from = Math.max(0, a.lastIndexOf("<", Math.max(0, i - 120)));
  return `  react ${a.slice(from, i + 160)}\n  ${rt.padEnd(5)} ${b.slice(from, i + 160)}`;
}
/** a block case as the document the xgen gates validate: in <main> unless the whole case is one landmark (a header with a panel after it is not) */
const LANDMARK = new Set(["main", "header", "footer", "nav"]);
const doc = (label: string, body: string) => {
  const top = (parseFragment(body) as unknown as { childNodes: { tagName?: string; nodeName: string; value?: string }[] }).childNodes
    .filter((n) => n.tagName || (n.nodeName === "#text" && (n.value ?? "").trim()));
  const own = top.length === 1 && LANDMARK.has(top[0]!.tagName ?? "");
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>${label}</title></head><body>${own ? body : `<main>${body}</main>`}</body></html>`;
};

test(`parity react = svelte = vue = solid: every gallery block case`, async () => {
  const { render } = await import("svelte/server");
  const { createSSRApp, h } = await import("vue");
  const { renderToString: vueSSR } = await import("@vue/server-renderer");
  const { createComponent } = await import("solid-js");
  const { renderToString: solidSSR } = await import("solid-js/web");
  const R = (await import("../react/src/organisms")) as Record<string, ComponentType<Record<string, unknown>>>;
  const L = (await import("../solid/src/organisms")) as Record<string, unknown>;
  const problems: string[] = [];
  for (const c of cases) {
    const o = byName[c.organism]!;
    const rel = `${tierDir(o.id)}/${fileName(o.name)}`;
    const { className, ...rest } = c.props as Record<string, unknown> & { className?: string };
    const S = (await import(`../svelte/src/${rel}.svelte`)).default;
    const V = (await import(`../vue/src/${rel}.vue`)).default;
    let raw: string, want: string;
    try { raw = quiet(() => renderToStaticMarkup(createElement(R[c.organism]!, c.props))); want = norm(raw); } catch (e) { problems.push(`${c.label} react: ${(e as Error).message}`); continue; }
    const other = { ...rest, ...(className ? { class: className } : {}) };
    const got: Record<string, () => Promise<string> | string> = {
      svelte: () => quiet(() => render(S, { props: other }).body),
      vue: () => vueSSR(createSSRApp({ render: () => h(V, other) })),
      solid: () => quiet(() => solidSSR(() => createComponent(L[c.organism] as never, other as never)).replace(/ data-hk="[^"]*"/g, "")),
    };
    for (const [rt, f] of Object.entries(got)) {
      try { const html = norm(await f()); if (html !== want) problems.push(`${c.label} ${rt} differs:\n${firstDiff(want, html, rt)}`); }
      catch (e) { problems.push(`${c.label} ${rt}: ${(e as Error).message}`); }
    }
    rendered.push({ id: c.label, html: doc(c.label, raw) });
  }
  if (problems.length) console.error(`${problems.length} problems\n` + problems.slice(0, 40).join("\n"));
  expect(problems.length).toBe(0);
  expect(cases.length).toBeGreaterThan(400);
}, 600000);

test("html-validate + axe on the React output of every case", async () => {
  expect(rendered.length).toBe(cases.length);
  const problems = (await checkHtml(rendered)).map((p: { id: string; tool: string; rule: string; message: string }) => `${p.id} ${p.tool}/${p.rule} ${p.message}`);
  if (problems.length) console.error(`${problems.length} html problems\n` + problems.slice(0, 40).join("\n"));
  expect(problems.length).toBe(0);
}, 600000);

test("runtimes", () => expect([...JS_RUNTIMES]).toEqual(["react", "svelte", "vue", "solid"]));
