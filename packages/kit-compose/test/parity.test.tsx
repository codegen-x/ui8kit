// DOM parity of every composition between runtimes (React SSR vs Svelte SSR), and token/grid rules on the recipes.
import { test, expect } from "bun:test";
import { plugin } from "bun";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { BRICKS, CONTROL_RECIPES } from "../src/map";
import { RECIPES } from "../src/recipes";
import * as R from "../react/src/compose";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { cases, names, norm, MANUAL_CASES } from "./shared";

const rendered: { id: string; html: string }[] = [];

plugin({
  name: "compose-ssr",
  async setup(b) {
    const { compile } = await import("svelte/compiler");
    const { parse, compileScript } = await import("@vue/compiler-sfc");
    const { transformSync } = await import("@babel/core");
    const solid = (await import("babel-preset-solid")).default;
    const ts = (await import("@babel/preset-typescript")).default;
    b.onLoad({ filter: /\.svelte$/ }, ({ path }) => ({
      loader: "js",
      contents: compile(readFileSync(path, "utf8"), { generate: "server", filename: path }).js.code,
    }));
    b.onLoad({ filter: /\.vue$/ }, ({ path }) => {
      const { descriptor } = parse(readFileSync(path, "utf8"), { filename: path });
      return { loader: "ts", contents: compileScript(descriptor, { id: path, inlineTemplate: true }).content };
    });
    b.onLoad({ filter: /\.solid\.tsx$/ }, ({ path }) => ({
      loader: "js",
      contents: transformSync(readFileSync(path, "utf8"), { filename: path, babelrc: false, configFile: false,
        presets: [[ts, { isTSX: true, allExtensions: true }], [solid, { generate: "ssr", hydratable: false }]] })!.code!,
    }));
  },
});


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


test("every composition exists in every runtime", () => {
  for (const n of names) for (const f of [`svelte/src/compose/${n}.svelte`, `vue/src/compose/${n}.vue`]) expect(readFileSync(new URL(`../${f}`, import.meta.url), "utf8")).toContain(BRICKS[n].primitive);
});

for (const name of names) {
  test(`parity react = svelte = vue = solid: ${name}`, async () => {
    const { render } = await import("svelte/server");
    const { createRawSnippet } = await import("svelte");
    const { createSSRApp, h } = await import("vue");
    const { renderToString: vueSSR } = await import("@vue/server-renderer");
    const { createComponent } = await import("solid-js");
    const { renderToString: solidSSR } = await import("solid-js/web");
    const S = (await import(`../svelte/src/compose/${name}.svelte`)).default;
    const V = (await import(`../vue/src/compose/${name}.vue`)).default;
    const L = (await import("../solid/src/compose/index.ts"))[name as never] as never;
    const leaf = VOID.has(BRICKS[name].primitive) || BRICKS[name].tag === "col";
    for (const c of cases(name)) {
      const { className, ...rest } = c;
      const r = renderToStaticMarkup(createElement((R as Record<string, never>)[name], { ...rest, className } as never, leaf ? undefined : "Content"));
      const sv = render(S, { props: { ...rest, class: className, ...(leaf ? {} : { children: createRawSnippet(() => ({ render: () => "<span>Content</span>" })) }) } }).body.replace("<span>Content</span>", "Content");
      const vu = await vueSSR(createSSRApp({ render: () => h(V, { ...rest, class: className }, leaf ? undefined : { default: () => "Content" }) }));
      const so = solidSSR(() => createComponent(L, { ...rest, class: className, ...(leaf ? {} : { children: "Content" }) } as never));
      const want = norm(r);
      expect(norm(sv), `svelte ${JSON.stringify(c)}`).toBe(want);
      expect(norm(vu), `vue ${JSON.stringify(c)}`).toBe(want);
      expect(norm(so), `solid ${JSON.stringify(c)}`).toBe(want);
      // the HTML gate renders the composition in a valid context (required children / attributes of the element)
      const ctx = CONTEXT[name];
      const node = createElement((R as Record<string, never>)[name], { ...rest, ...ctx?.props, className } as never, ...(ctx?.children?.() ?? (leaf ? [] : ["Content"])));
      const html = renderToStaticMarkup((ctx?.parent ? ctx.parent(node) : node) as never);
      rendered.push({ id: `${name} ${JSON.stringify(c)}`, html });
    }
  });
}

test("parity react = svelte = vue = solid: hand-written compositions", async () => {
  const { render } = await import("svelte/server");
  const { createSSRApp, h } = await import("vue");
  const { renderToString: vueSSR } = await import("@vue/server-renderer");
  const { createComponent } = await import("solid-js");
  const { renderToString: solidSSR } = await import("solid-js/web");
  const L = await import("../solid/src/compose/index.ts");
  for (const { name, props } of MANUAL_CASES) {
    const { className, ...rest } = props as Record<string, unknown> & { className?: string };
    const S = (await import(`../svelte/src/compose/${name}.svelte`)).default;
    const V = (await import(`../vue/src/compose/${name}.vue`)).default;
    const r = renderToStaticMarkup(createElement((R as Record<string, never>)[name], props as never));
    const want = norm(r);
    expect(norm(render(S, { props: { ...rest, class: className } }).body), `svelte ${name} ${JSON.stringify(props)}`).toBe(want);
    expect(norm(await vueSSR(createSSRApp({ render: () => h(V, { ...rest, class: className }) }))), `vue ${name} ${JSON.stringify(props)}`).toBe(want);
    expect(norm(solidSSR(() => createComponent((L as Record<string, never>)[name], { ...rest, class: className } as never))), `solid ${name} ${JSON.stringify(props)}`).toBe(want);
    // SheetTrigger aria-controls needs its target in the document
    rendered.push({ id: `${name} ${JSON.stringify(props)}`, html: props.controls ? `${r}<div id="${props.controls}">Menu</div>` : r });
  }
});

test("recipes: colors only by tokens, 8 + 4 grid without half steps", () => {
  const all = Object.values(RECIPES).flatMap((r) => [r.base, ...Object.values(r.byKey).flatMap(Object.values), ...(r.compound ?? []).map((c) => c.class)]).join(" ").split(/\s+/);
  const raw = all.filter((c) => /(^|:)(bg|text|border|ring|inset-ring|fill|stroke|from|to|via)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)/.test(c) || /#[0-9a-f]{3,8}|rgb\(|hsl\(/i.test(c));
  expect(raw).toEqual([]);
  expect(all.filter((c) => /-\d+\.5(\b|$)/.test(c))).toEqual([]);
});

test("8 + 4: odd spacing steps (4px) only inside control recipes", () => {
  const odd = /^([a-z0-9-]+:)*-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|top|bottom|left|right)-(1|3|5|7|9|11)$/;
  const bad: string[] = [];
  for (const [id, r] of Object.entries(RECIPES)) {
    if ((CONTROL_RECIPES as readonly string[]).includes(id)) continue;
    const cls = [r.base, ...Object.values(r.byKey).flatMap(Object.values), ...(r.compound ?? []).map((c) => c.class)].join(" ").split(/\s+/);
    for (const c of cls) if (odd.test(c)) bad.push(`${id}: ${c}`);
  }
  for (const [n, m] of Object.entries(BRICKS)) for (const c of (m.extra ?? "").split(/\s+/)) if (odd.test(c)) bad.push(`${n} extra: ${c}`);
  expect(bad).toEqual([]);
});

test("rendered HTML of every case: html-validate + axe-core", async () => {
  expect(rendered.length).toBeGreaterThan(100);
  const problems = await checkHtml(rendered);
  expect(problems.map((p) => `${p.id} ${p.tool}/${p.rule} ${p.message}`)).toEqual([]);
}, 120000);
