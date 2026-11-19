// The `align` setting of the simple line (HeroSimple, TeamSimple; docs: ui8kit/prototypes docs/adr/0002-align-as-setting.md):
// every value draws logical classes only (items-*, text-start / text-center / text-end, self-*), never a physical side
// (text-left / text-right, ml-/mr-/pl-/pr-, left-/right-, float-left/right), so start / end follow the writing direction;
// html-validate + axe pass with dir="rtl". React is the reference: parity in organisms.test.tsx and server-organisms.test.tsx
// holds the other seven runtimes to the same DOM (the gallery has one case per align value, compose-gen blockCases).
import { describe, expect, test } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { blockCases } from "../../compose-gen";
import { loadOrganisms } from "../src/organisms";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { quiet } from "./render-all";
import * as R from "../react/src/organisms";

const loaded = loadOrganisms();
const cases = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name))).cases.filter((c) => c.organism === "HeroSimple" || c.organism === "TeamSimple");
const ALIGNS = ["start", "center", "end"] as const;
const TEXT = { start: "text-start", center: "text-center", end: "text-end" } as const;
const ITEMS = { start: "items-start", center: "items-center", end: "items-end" } as const;
const PHYSICAL = /^(?:[a-z0-9-]+:)*(?:text-(?:left|right)|-?(?:ml|mr|pl|pr)-\S+|-?(?:left|right)-\S+|float-(?:left|right)|rounded-[lr](?:-|$)\S*|border-[lr](?:-|$)\S*)$/;

const render = (organism: string, props: unknown) =>
  quiet(() => renderToStaticMarkup(createElement((R as Record<string, ComponentType<Record<string, unknown>>>)[organism]!, props as Record<string, unknown>)));
const dom = (html: string) => new JSDOM(`<!DOCTYPE html><html lang="en" dir="rtl"><body>${html}</body></html>`).window.document;
const classes = (doc: Document) => [...doc.querySelectorAll("[class]")].flatMap((e) => [...e.classList]);

describe("align setting", () => {
  test("the gallery draws every align value of both blocks", () => {
    for (const o of ["HeroSimple", "TeamSimple"]) for (const a of ["center", "end"]) expect(cases.some((c) => c.organism === o && (c.props as { align?: string }).align === a), `${o} ${a}`).toBe(true);
  });

  for (const c of cases.filter((x) => !/\.align-/.test(x.label))) {
    for (const a of ALIGNS) {
      test(`${c.label} align=${a}: logical classes on the heading, the copy and the column`, () => {
        const doc = dom(render(c.organism, { ...(c.props as object), align: a }));
        const title = doc.querySelector("h1, h2, h3")!;
        expect(title.classList.contains(TEXT[a]), title.outerHTML.slice(0, 200)).toBe(true);
        for (const other of ALIGNS) if (other !== a) expect(title.classList.contains(TEXT[other])).toBe(false);
        const column = title.closest(`.${ITEMS[a]}`);
        expect(column, `${ITEMS[a]} around the heading`).not.toBeNull();
        const physical = classes(doc).filter((t) => PHYSICAL.test(t));
        expect(physical, "physical side classes").toEqual([]);
      });
    }
  }

  test("dir=rtl: html-validate + axe pass for every align value", async () => {
    const html = cases.flatMap((c) => ALIGNS.map((a) => ({ id: `${c.label} ${a}`, html: `<div dir="rtl">${render(c.organism, { ...(c.props as object), align: a })}</div>` })));
    const problems = await checkHtml(html);
    expect(problems.map((p) => `${p.id} ${p.tool} ${p.rule}: ${p.message}`)).toEqual([]);
  }, 120_000);
});
