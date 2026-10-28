// Organisms on kit-compose for the server runtimes (src/server-organisms.ts): generated files up to date; every gallery block
// case rendered by the real engine (Jinja2, ...) with the same DOM as React (the reference, the kit-compose React organisms);
// html-validate on the raw server output. Without a toolchain the runtime is skipped; UI8KIT_REQUIRE_ALL_RUNTIMES=1 fails instead.
import { test, expect, describe } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseFragment } from "parse5";
import { blockCases, normalizeHtml } from "../../compose-gen";
import { loadOrganisms } from "../src/organisms";
import { serverOrganismFiles, SERVER_ORG_RT } from "../src/server-organisms";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { norm as tokens, probeProblems, trustedProbes } from "./shared";
import { quiet, REQUIRED, ROOT, SERVER } from "./render-all";
import * as R from "../react/src/organisms";

const norm = (html: string) => normalizeHtml(tokens(html)).replace(/ style="([^"]*?);"/g, ' style="$1"');
const loaded = loadOrganisms();
const gallery = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name))).cases;
// the gallery cases, then the TrustedHtml probes (a plain string escaped, TrustedHtml raw, the page heading)
const cases = [...gallery, ...trustedProbes(gallery)];
const react = cases.map((c) => quiet(() => renderToStaticMarkup(createElement((R as Record<string, ComponentType<Record<string, unknown>>>)[c.organism]!, c.props))));

const LANDMARK = new Set(["main", "header", "footer", "nav"]);
const doc = (label: string, body: string) => {
  const top = (parseFragment(body) as unknown as { childNodes: { tagName?: string; nodeName: string; value?: string }[] }).childNodes
    .filter((n) => n.tagName || (n.nodeName === "#text" && (n.value ?? "").trim()));
  const own = top.length === 1 && LANDMARK.has(top[0]!.tagName ?? "");
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>${label}</title></head><body>${own ? body : `<main>${body}</main>`}</body></html>`;
};
function firstDiff(a: string, b: string, rt: string): string {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const from = Math.max(0, a.lastIndexOf("<", Math.max(0, i - 120)));
  return `  react ${a.slice(from, i + 160)}\n  ${rt.padEnd(6)} ${b.slice(from, i + 160)}`;
}
for (const rt of SERVER_ORG_RT.filter((r) => !process.env.ORG_RT || process.env.ORG_RT.split(",").includes(r))) {
  test(`${rt}: generated organisms are up to date`, () => {
    for (const [rel, body] of serverOrganismFiles(rt, loaded)) expect(readFileSync(path.join(ROOT, rel), "utf8"), rel).toBe(body);
  });
  const missing = SERVER[rt].missing();
  if (missing) {
    if (REQUIRED) test(`${rt}: toolchain (UI8KIT_REQUIRE_ALL_RUNTIMES=1)`, () => { throw new Error(missing); });
    else { console.warn(`[skip] ${rt} organism parity: ${missing}`); test.skip(`${rt} organism parity`, () => {}); }
    continue;
  }
  describe(`${rt} = react`, () => {
    let html: string[] = [];
    test(`${rt}: parity with React on every gallery block case`, () => {
      html = SERVER[rt].render(cases);
      expect(html.length).toBe(cases.length);
      const problems: string[] = [];
      cases.forEach((c, i) => {
        const got = html[i] ?? "";
        if (got.startsWith("ERROR:")) { problems.push(`${c.label}: ${got}`); return; }
        const want = norm(react[i]!), have = norm(got);
        if (have !== want) problems.push(`${c.label} differs:\n${firstDiff(want, have, rt)}`);
      });
      if (problems.length) console.error(`${rt}: ${problems.length} of ${cases.length} cases differ\n` + problems.slice(0, 30).join("\n"));
      expect(problems.length).toBe(0);
      expect(cases.length).toBeGreaterThan(400);
    }, 600000);
    test(`${rt}: TrustedHtml printed as it is (${rt === "latte" ? "|noescape" : rt === "twig" ? "|raw" : rt === "jinja2" ? "|safe" : "templ.Raw"}), a plain string escaped; one h1 only for the page heading`, () => {
      expect(html.length).toBe(cases.length);
      expect(cases.flatMap((c, i) => probeProblems(`${c.label} ${rt}`, html[i] ?? ""))).toEqual([]);
    });
    test(`${rt}: html-validate + axe on the raw output of every case`, async () => {
      const docs = cases.map((c, i) => ({ id: c.label, html: doc(c.label, html[i] ?? "") }));
      const problems = (await checkHtml(docs)).map((p: { id: string; tool: string; rule: string; message: string }) => `${p.id} ${p.tool}/${p.rule} ${p.message}`);
      if (problems.length) console.error(`${problems.length} html problems\n` + problems.slice(0, 30).join("\n"));
      expect(problems.length).toBe(0);
    }, 600000);
  });
}
