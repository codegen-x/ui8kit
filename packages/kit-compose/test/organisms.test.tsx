// Prototype organisms (React on kit-compose): generated files up to date, HTML equal to the committed reference snapshot
// (test/organisms.react.html, the new v3 reference), html-validate + axe on every case, no raw HTML in the sources.
import { test, expect } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { files, PROTOTYPE } from "../src/organisms";
import * as O from "../react/src/organisms";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { checkSourceText } from "../../ui-gates/src/source.mjs";

const tags = [{ id: "a", name: "Svelte", icon: "tag" }, { id: "b", name: "A <b>&</b>", icon: "tag" }];
const CASES: [string, string, Record<string, unknown>][] = [
  ["ArticleBlock", "empty", {}],
  ["ArticleBlock", "content", { testid: "card", className: "mt-4", children: "Review" }],
  ["FooterSitemap", "no href", { label: "Sitemap" }],
  ["FooterSitemap", "href", { href: "/sitemap", label: "Sitemap" }],
  ["PostTags", "start", { tags }],
  ["PostTags", "center", { tags, align: "center" }],
];
const SNAP = new URL("./organisms.react.html", import.meta.url);
const render = () => CASES.map(([n, id, p]) => `<!-- ${n} · ${id} -->\n${renderToStaticMarkup(createElement((O as Record<string, never>)[n], p as never))}`).join("\n") + "\n";

test("generated organisms are up to date", () => {
  for (const [rel, body] of files()) expect(readFileSync(new URL(`../${rel}`, import.meta.url), "utf8"), rel).toBe(body);
  expect(PROTOTYPE.length).toBe(3);
});

test("HTML = the reference snapshot (UPDATE_SNAPSHOT=1 rewrites it)", () => {
  const html = render();
  if (process.env.UPDATE_SNAPSHOT === "1" || !existsSync(SNAP)) writeFileSync(SNAP, html);
  expect(html).toBe(readFileSync(SNAP, "utf8"));
});

test("html-validate + axe on every case; source gate on the generated files", async () => {
  const cases = CASES.map(([n, id, p]) => ({ id: `${n} ${id}`, html: renderToStaticMarkup(createElement((O as Record<string, never>)[n], p as never)) || "<p>empty</p>" }));
  expect((await checkHtml(cases)).map((p) => `${p.id} ${p.tool}/${p.rule} ${p.message}`)).toEqual([]);
  const src = [...files()].filter(([f]) => f.endsWith(".tsx")).flatMap(([f, body]) => checkSourceText(body, f));
  expect(src).toEqual([]);
}, 120000);
