import { test, expect } from "bun:test";
import { normalizeReactAttrs, checkHtml } from "../src/html.mjs";

test("React camelCase attribute names are lowercased on HTML elements, kept in SVG", () => {
  expect(normalizeReactAttrs('<img fetchPriority="high" alt="a" src="/a.png"><label htmlFor="x" className="c">L</label>'))
    .toBe('<img fetchpriority="high" alt="a" src="/a.png"><label for="x" class="c">L</label>');
  const svg = '<svg viewBox="0 0 24 24" preserveAspectRatio="none"><path d="M0 0"></path></svg><p tabIndex="0">x</p>';
  expect(normalizeReactAttrs(svg)).toBe('<svg viewBox="0 0 24 24" preserveAspectRatio="none"><path d="M0 0"></path></svg><p tabindex="0">x</p>');
});

test("the gate validates the normalized markup", async () => {
  const problems = await checkHtml([{ id: "img", html: '<img fetchPriority="high" alt="a" src="/a.png">' }]);
  expect(problems.filter((p) => p.tool === "html-validate").map((p) => p.rule)).toEqual([]);
}, 60000);

test("text-content: a button named by its <label for> passes, an unnamed one does not", async () => {
  const named = await checkHtml([{ id: "a", html: `<label for="s">Updates</label><button type="button" role="switch" aria-checked="false" id="s"></button>` }]);
  expect(named.filter((p) => p.rule === "text-content")).toEqual([]);
  const bare = await checkHtml([{ id: "b", html: `<label for="x">Updates</label><button type="button" role="switch" aria-checked="false" id="s"></button>` }]);
  expect(bare.some((p) => p.rule === "text-content")).toBe(true);
});

test("TrustedHtml: rich text printed as it is inside Prose (headings, lists, quote, picture, code, table, captions) passes the gate", async () => {
  const body = `<h1>Page</h1><div class="prose" data-testid="richtext-content"><p>Intro with <a href="https://example.org/">a link</a> and <code>code</code>.</p>`
    + `<h2>Section</h2><ul><li>one</li><li>two</li></ul><h3>Steps</h3><ol><li>first</li></ol><blockquote><p>A quote.</p></blockquote>`
    + `<figure class="wp-caption alignwide"><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="A picture" width="1" height="1"><figcaption class="wp-caption-text">Caption</figcaption></figure>`
    + `<pre><code>bun run build</code></pre><table><caption>Runtimes</caption><thead><tr><th scope="col">Runtime</th></tr></thead><tbody><tr><td>Latte</td></tr></tbody></table></div>`;
  expect(await checkHtml([{ id: "richtext", html: body }])).toEqual([]);
}, 60000);
