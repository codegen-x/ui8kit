// Organisms on kit-compose for the server runtimes (src/server-organisms.ts): generated files up to date; every gallery block
// case rendered by the real engine (Jinja2, ...) with the same DOM as React (the reference, the kit-compose React organisms);
// html-validate on the raw server output. Without a toolchain the runtime is skipped; UI8KIT_REQUIRE_ALL_RUNTIMES=1 fails instead.
import { test, expect, describe } from "bun:test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseFragment } from "parse5";
import { blockCases, normalizeHtml, fileName } from "../../compose-gen";
import { loadOrganisms } from "../src/organisms";
import { serverOrganismFiles, SERVER_ORG_RT, TEMPL_MODULE, type ServerOrgRuntime } from "../src/server-organisms";
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
const php = spawnSync("php", ["-v"], { stdio: "ignore" }).status === 0 && existsSync(path.join(SRV, "vendor/autoload.php")) ? null : "php or test/server/vendor missing (composer install -d packages/kit-compose/test/server)";
const phpRender = (rt: string, ext: string) => json("php", [path.join(SRV, "render-organisms.php"), rt, path.join(KIT, `${rt}/src`), path.join(ROOT, `${rt}/src`)],
  cases.map((c) => ({ template: `blocks/${fileName(c.organism)}${ext}`, p: c.props })));
const TEMPL = "v0.3.1070";
/** a scratch copy (templ generate writes *_templ.go next to the sources): kit module + kit-compose module + a parity main over every organism */
function templRender(): string[] {
  const tmp = mkdtempSync(path.join(tmpdir(), "kit-compose-org-templ-"));
  try {
    cpSync(path.join(KIT, "templ/src/ui"), path.join(tmp, "kitmod/ui"), { recursive: true });
    cpSync(path.join(KIT, "templ/src/utils"), path.join(tmp, "kitmod/utils"), { recursive: true });
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ/kitmod", f), path.join(tmp, "kitmod", f));
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ", f), path.join(tmp, f));
    cpSync(path.join(ROOT, "templ/src"), path.join(tmp, "src"), { recursive: true });
    const names = [...new Set(cases.map((c) => c.organism))].sort();
    mkdirSync(path.join(tmp, "cmd"));
    writeFileSync(path.join(tmp, "cmd/main.go"), [`package main`, ``, `import (`, `\t"bufio"`, `\t"context"`, `\t"encoding/json"`, `\t"fmt"`, `\t"os"`, `\t"strings"`, ``, `\t"github.com/a-h/templ"`, ``, `\t"${TEMPL_MODULE}/src/blocks"`, `)`, ``,
      `type request struct {\n\tName  string          \`json:"name"\`\n\tProps json.RawMessage \`json:"props"\`\n}`, ``,
      `func component(name string, props []byte) (templ.Component, error) {`, `\tswitch name {`,
      ...names.flatMap((n) => [`\tcase ${JSON.stringify(n)}:`, `\t\tvar p blocks.${n}Props`, `\t\tif err := json.Unmarshal(props, &p); err != nil {`, `\t\t\treturn nil, err`, `\t\t}`, `\t\treturn blocks.${n}(p), nil`]),
      `\t}`, `\treturn nil, fmt.Errorf("unknown organism %s", name)`, `}`, ``,
      `func main() {`, `\tvar reqs []request`, `\tif err := json.NewDecoder(bufio.NewReader(os.Stdin)).Decode(&reqs); err != nil {`, `\t\tpanic(err)`, `\t}`,
      `\tout := make([]string, len(reqs))`, `\tfor i, r := range reqs {`, `\t\tc, err := component(r.Name, r.Props)`, `\t\tif err != nil {`, `\t\t\tout[i] = "ERROR: " + err.Error()`, `\t\t\tcontinue`, `\t\t}`,
      `\t\tvar b strings.Builder`, `\t\tif err := c.Render(context.Background(), &b); err != nil {`, `\t\t\tout[i] = "ERROR: " + err.Error()`, `\t\t\tcontinue`, `\t\t}`, `\t\tout[i] = b.String()`, `\t}`,
      `\t_ = json.NewEncoder(os.Stdout).Encode(out)`, `}`, ``].join("\n"));
    const env = { ...process.env, GOFLAGS: "-mod=mod" };
    execFileSync("go", ["run", `github.com/a-h/templ/cmd/templ@${TEMPL}`, "generate", "-path", tmp], { cwd: tmp, env, stdio: ["ignore", "ignore", "inherit"] });
    execFileSync("go", ["vet", "./..."], { cwd: tmp, env, stdio: ["ignore", "ignore", "inherit"] });
    return JSON.parse(execFileSync("go", ["run", "./cmd"], { cwd: tmp, env, input: JSON.stringify(cases.map((c) => ({ name: c.organism, props: c.props }))), encoding: "utf8", maxBuffer: 256 << 20, stdio: ["pipe", "pipe", "inherit"] })) as string[];
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
const RUN: Record<ServerOrgRuntime, { missing: () => string | null; render: () => string[] }> = {
  jinja2: {
    missing: () => (ok(PY, ["-c", "import jinja2"]) ? null : `${PY} with Jinja2 not found`),
    render: () => json(PY, [path.join(SRV, "render-organisms.py"), path.join(KIT, "jinja2/src"), path.join(ROOT, "jinja2/src")],
      cases.map((c) => ({ template: `blocks/${fileName(c.organism)}.html.j2`, p: c.props }))),
  },
  twig: { missing: () => php, render: () => phpRender("twig", ".html.twig") },
  latte: { missing: () => php, render: () => phpRender("latte", ".latte") },
  templ: { missing: () => (ok("go", ["version"]) ? null : "go not found"), render: templRender },
};

for (const rt of SERVER_ORG_RT.filter((r) => !process.env.ORG_RT || process.env.ORG_RT.split(",").includes(r))) {
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
