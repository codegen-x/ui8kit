// DOM parity of every composition between runtimes (React SSR vs Svelte SSR), and token/grid rules on the recipes.
import { test, expect } from "bun:test";
import { plugin } from "bun";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { BRICKS } from "../src/map";
import { RECIPES } from "../src/recipes";
import * as R from "../react/src/compose";
import { checkHtml } from "../../ui-gates/src/html.mjs";

const rendered: { id: string; html: string }[] = [];
// controls need an accessible name in a fixture (axe: label); the composition does not invent one
const NAMED = new Set(["Input", "Range", "Textarea", "Select", "Checkbox", "Radio", "Switch", "Meter", "Progress"]);

plugin({
  name: "svelte-ssr",
  async setup(b) {
    const { compile } = await import("svelte/compiler");
    b.onLoad({ filter: /\.svelte$/ }, ({ path }) => ({
      loader: "js",
      contents: compile(readFileSync(path, "utf8"), { generate: "server", filename: path }).js.code,
    }));
  },
});

const norm = (html: string) =>
  html.replace(/<!--[^]*?-->/g, "").replace(/<!>/g, "").replace(/ on(load|error)="this\.__e=event"/g, "").replace(/<([a-z0-9]+)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g, (_, tag, attrs: string) => {
    const list = [...attrs.matchAll(/([^\s=>]+)(?:="([^"]*)")?/g)].map(([, k, v]) => `${k}="${k === "class" ? (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").split(/\s+/).filter(Boolean).join(" ") : (v ?? "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&")}"`).filter((a) => a !== `class=""`);
    return `<${tag}${list.sort().map((a) => " " + a).join("")}>`;
  });

const names = Object.entries(BRICKS).filter(([, m]) => m.recipe || m.extra || m.tag || m.tagFrom).map(([n]) => n);
const VOID = new Set(["Input", "Checkbox", "Radio", "Switch", "Separator", "Image", "Textarea"]);  // Textarea: value, not children
// Svelte SSR artifacts dropped by norm(): hydration markers <!--[-->/<!>, img onload/onerror="this.__e=event"

const el = (n: string, p: object | null, ...ch: unknown[]) => createElement((R as Record<string, never>)[n], p as never, ...(ch as []));
const CONTEXT: Record<string, { props?: object; children?: () => unknown[]; parent?: (n: unknown) => unknown }> = {
  TableCol: { parent: (n) => el("Table", null, el("TableColGroup", null, n)) },
  TableColGroup: { parent: (n) => el("Table", null, n), children: () => [el("TableCol", null)] },
  TableCaption: { parent: (n) => el("Table", null, n) },
  TableHead: { parent: (n) => el("Table", null, n), children: () => [el("TableRow", null, el("TableHeadCell", null, "H"))] },
  TableBody: { parent: (n) => el("Table", null, n), children: () => [el("TableRow", null, el("TableCell", null, "C"))] },
  TableFoot: { parent: (n) => el("Table", null, n), children: () => [el("TableRow", null, el("TableCell", null, "F"))] },
  ListItem: { parent: (n) => el("List", null, n) },
  TableRow: { parent: (n) => el("Table", null, el("TableBody", null, n)), children: () => [el("TableCell", null, "Cell")] },
  TableCell: { parent: (n) => el("Table", null, el("TableBody", null, el("TableRow", null, n))) },
  TableHeadCell: { parent: (n) => el("Table", null, el("TableHead", null, el("TableRow", null, n))) },
  Disclosure: { children: () => [el("Summary", null, "More"), "Content"] },
  Fieldset: { children: () => [el("Legend", null, "Group"), "Content"] },
  Form: { props: { "aria-label": "Form" }, children: () => [el("Button", { type: "submit" }, "Send")] },
  Image: { props: { src: "/p.png", alt: "Picture" } },
  List: { children: () => [el("ListItem", null, "Item")] },
};

function cases(name: string): Record<string, string>[] {
  const m = BRICKS[name];
  const base: Record<string, string> = NAMED.has(name) ? { "aria-label": "Field" } : {};
  const out: Record<string, string>[] = [{ ...base }, { ...base, className: "mt-4", "data-testid": "x" }];
  if (m.recipe) for (const k of RECIPES[m.recipe].keys) for (const v of Object.keys(RECIPES[m.recipe].byKey[k] ?? {})) out.push({ ...base, [k]: v });
  if (m.tagFrom?.heading) out.push({ as: "1" }, { as: "3" });
  return out;
}

test("every composition has a Svelte twin", () => {
  for (const n of names) expect(readFileSync(new URL(`../svelte/src/compose/${n}.svelte`, import.meta.url), "utf8")).toContain(BRICKS[n].primitive);
});

for (const name of names) {
  test(`parity react = svelte: ${name}`, async () => {
    const { render } = await import("svelte/server");
    const { createRawSnippet } = await import("svelte");
    const S = (await import(`../svelte/src/compose/${name}.svelte`)).default;
    const leaf = VOID.has(BRICKS[name].primitive) || BRICKS[name].tag === "col";
    for (const c of cases(name)) {
      const { className, ...rest } = c;
      const r = renderToStaticMarkup(createElement((R as Record<string, never>)[name], { ...rest, className } as never, leaf ? undefined : "Content"));
      const s = render(S, { props: { ...rest, class: className, ...(leaf ? {} : { children: createRawSnippet(() => ({ render: () => "<span>Content</span>" })) }) } }).body;
      // the HTML gate renders the composition in a valid context (required children / attributes of the element)
      const ctx = CONTEXT[name];
      const node = createElement((R as Record<string, never>)[name], { ...rest, ...ctx?.props, className } as never, ...(ctx?.children?.() ?? (leaf ? [] : ["Content"])));
      const html = renderToStaticMarkup((ctx?.parent ? ctx.parent(node) : node) as never);
      rendered.push({ id: `${name} ${JSON.stringify(c)}`, html });
      expect(norm(s).replace("<span>Content</span>", "Content")).toBe(norm(r));
    }
  });
}

test("recipes: colors only by tokens, 8 + 4 grid without half steps", () => {
  const all = Object.values(RECIPES).flatMap((r) => [r.base, ...Object.values(r.byKey).flatMap(Object.values), ...(r.compound ?? []).map((c) => c.class)]).join(" ").split(/\s+/);
  const raw = all.filter((c) => /(^|:)(bg|text|border|ring|inset-ring|fill|stroke|from|to|via)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)/.test(c) || /#[0-9a-f]{3,8}|rgb\(|hsl\(/i.test(c));
  expect(raw).toEqual([]);
  expect(all.filter((c) => /-\d+\.5(\b|$)/.test(c))).toEqual([]);
});

test("rendered HTML of every case: html-validate + axe-core", async () => {
  expect(rendered.length).toBeGreaterThan(100);
  const problems = await checkHtml(rendered);
  expect(problems.map((p) => `${p.id} ${p.tool}/${p.rule} ${p.message}`)).toEqual([]);
}, 120000);
