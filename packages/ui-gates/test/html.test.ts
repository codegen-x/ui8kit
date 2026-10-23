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
