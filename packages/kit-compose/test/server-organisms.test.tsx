// Organisms on kit-compose for the server runtimes (src/server-organisms.ts): generated files up to date; every gallery block
// case rendered by the real engine (Jinja2, ...) with the same DOM as React (the reference, the kit-compose React organisms);
// html-validate on the raw server output. Without a toolchain the runtime is skipped; UI8KIT_REQUIRE_ALL_RUNTIMES=1 fails instead.
import { test, expect, describe } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseFragment } from "parse5";
import { blockCases, normalizeHtml, fileName } from "../../compose-gen";
import { loadOrganisms } from "../src/organisms";
import { serverOrganismFiles, SERVER_ORG_RT, type ServerOrgRuntime } from "../src/server-organisms";
import { checkHtml } from "../../ui-gates/src/html.mjs";
import { norm as tokens } from "./shared";
import * as R from "../react/src/organisms";

const ROOT = path.resolve(import.meta.dir, "..");
const KIT = path.resolve(ROOT, "../kit");
const REQUIRED = process.env.UI8KIT_REQUIRE_ALL_RUNTIMES === "1";
const ok = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
const norm = (html: string) => normalizeHtml(tokens(html)).replace(/ style="([^"]*?);"/g, ' style="$1"');
const quiet = <T,>(f: () => T): T => { const w = console.warn, e = console.error; console.warn = console.error = () => {}; try { return f(); } finally { console.warn = w; console.error = e; } };

const loaded = loadOrganisms();
const { cases } = blockCases(loaded.inputs, new Set(loaded.organisms.map((o) => o.name)));
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
const json = (cmd: string, args: string[], input: unknown) =>
  JSON.parse(execFileSync(cmd, args, { input: JSON.stringify(input), encoding: "utf8", maxBuffer: 256 << 20, stdio: ["pipe", "pipe", "inherit"] })) as string[];

const SRV = path.join(ROOT, "test/server");
const VENV_PY = path.join(SRV, ".venv/bin/python");
const PY = process.env.PYTHON ?? (existsSync(VENV_PY) ? VENV_PY : "python3");
const RUN: Record<ServerOrgRuntime, { missing: () => string | null; render: () => string[] }> = {
  jinja2: {
    missing: () => (ok(PY, ["-c", "import jinja2"]) ? null : `${PY} with Jinja2 not found`),
    render: () => json(PY, [path.join(SRV, "render-organisms.py"), path.join(KIT, "jinja2/src"), path.join(ROOT, "jinja2/src")],
      cases.map((c) => ({ template: `blocks/${fileName(c.organism)}.html.j2`, p: c.props }))),
  },
};

for (const rt of SERVER_ORG_RT) {
  test(`${rt}: generated organisms are up to date`, () => {
    for (const [rel, body] of serverOrganismFiles(rt, loaded)) expect(readFileSync(path.join(ROOT, rel), "utf8"), rel).toBe(body);
  });
  const missing = RUN[rt].missing();
  if (missing) {
    if (REQUIRED) test(`${rt}: toolchain (UI8KIT_REQUIRE_ALL_RUNTIMES=1)`, () => { throw new Error(missing); });
    else { console.warn(`[skip] ${rt} organism parity: ${missing}`); test.skip(`${rt} organism parity`, () => {}); }
    continue;
  }
  describe(`${rt} = react`, () => {
    let html: string[] = [];
    test(`${rt}: parity with React on every gallery block case`, () => {
      html = RUN[rt].render();
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
    test(`${rt}: html-validate + axe on the raw output of every case`, async () => {
      const docs = cases.map((c, i) => ({ id: c.label, html: doc(c.label, html[i] ?? "") }));
      const problems = (await checkHtml(docs)).map((p: { id: string; tool: string; rule: string; message: string }) => `${p.id} ${p.tool}/${p.rule} ${p.message}`);
      if (problems.length) console.error(`${problems.length} html problems\n` + problems.slice(0, 30).join("\n"));
      expect(problems.length).toBe(0);
    }, 600000);
  });
}
