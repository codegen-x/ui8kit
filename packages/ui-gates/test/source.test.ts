import { expect, test } from "bun:test";
import { PRIMITIVE_OF, RAW_ALLOWED, checkSourceText } from "../src/source.mjs";

const rules = (src: string, file: string, allow?: string[]) => checkSourceText(src, file, { allow }).map((p: { rule: string; message: string }) => `${p.rule} ${p.message}`);

test("raw tags are found in every native syntax", () => {
  expect(rules(`const A = () => <div className="x"><Box tag="section" /></div>;\nconst t: Array<string> = [];`, "a.tsx")).toEqual(["raw-html <div>: use Box"]);
  expect(rules(`<script lang="ts">const x = "<p>";</script>\n<p>hi</p><Box tag="nav" />`, "a.svelte")).toEqual(["raw-html <p>: use Text"]);
  expect(rules(`<script setup>const s = "<a>"</script>\n<template><a href="/">x</a><Box :tag="t" /></template>`, "a.vue")).toEqual(["raw-html <a>: use Link|Button"]);
  expect(rules(`templ X() {\n\t<button>x</button>\n\t// <span>\n}`, "a.templ")).toEqual(["raw-html <button>: use Button|Switch"]);
  expect(rules(`{# <div> #}<ul><li>x</li></ul>`, "a.twig")).toEqual(["raw-html <ul>: use Box", "raw-html <li>: use Box"]);
  expect(rules(`{* <div> *}<img src="x">`, "a.latte")).toEqual(["raw-html <img>: use Image"]);
  expect(rules(`<hr>{{ ui.box(tag='aside') }}`, "a.j2")).toEqual(["raw-html <hr>: use Separator"]);
});

test("allowlist and elements without a primitive pass", () => {
  expect(rules(`const A = () => <svg><path d="M0" /></svg>;`, "a.tsx")).toEqual([]);
  expect(rules(`<span>x</span>`, "a.svelte", ["span"])).toEqual([]);
});

test("Box/Text tag only from the HTML5 allowlist (literal values)", () => {
  expect(rules(`const A = () => <Box tag="button" />;`, "a.tsx")).toEqual([`tag-allowlist tag "button" is not an HTML5 Box/Text tag`]);
  expect(rules(`@box.Box(box.BoxProps{Tag: "custom-el"})`, "a.templ")).toEqual([`tag-allowlist tag "custom-el" is not an HTML5 Box/Text tag`]);
  expect(rules(`{% include 'box.twig' with { tag: 'main' } %}`, "a.twig")).toEqual([]);
});

test("svg, br, datalist and output stay raw (allowlist, no primitive)", () => {
  expect(RAW_ALLOWED).toEqual(["svg", "br", "datalist", "output"]);
  for (const t of RAW_ALLOWED) expect(Object.keys(PRIMITIVE_OF)).not.toContain(t);
  const src = `export const X = () => (<Text>a<br />b<svg viewBox="0 0 24 24"><path d="M0 0" /></svg><datalist id="d"></datalist><output>1</output></Text>);`;
  expect(rules(src, "x.tsx")).toEqual([]);
});

test("allowTags lets a listed Box/Text tag value through, nothing else", () => {
  const src = `export const X = () => (<Text tag="del">1</Text>);`;
  expect(rules(src, "x.tsx")).toEqual(['tag-allowlist tag "del" is not an HTML5 Box/Text tag']);
  expect(checkSourceText(src, "x.tsx", { allowTags: ["del"] })).toEqual([]);
});
