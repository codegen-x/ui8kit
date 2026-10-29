// Renders organism cases on every runtime, for the parity, fuzz and generator-safety suites: React (the reference), Svelte, Vue
// and Solid in process (the SSR loaders of ssr.ts), Jinja2, Twig, Latte and templ by their real engines (test/server harnesses,
// a scratch Go module for templ). `overrides` (generated file -> contents, as serverOrganismFiles keys them) render a changed
// generation from a scratch copy of the runtime's sources. Without a toolchain `missing` names it.
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileName, tierDir } from "../../compose-gen";
import { TEMPL_MODULE, type ServerOrgRuntime } from "../src/server-organisms";
import type { OrganismSpec } from "../../compose-gen/screens/src/index";
import { installSsrPlugin } from "./ssr";

export const ROOT = path.resolve(import.meta.dir, "..");
export const KIT = path.resolve(ROOT, "../kit");
export const REQUIRED = process.env.UI8KIT_REQUIRE_ALL_RUNTIMES === "1";
/** `children`: a plain string given as the organism's children (text: escaped on every runtime; Svelte gets it as a snippet of the
 *  escaped text, Vue as the default slot, templ as a component writing the escaped text, the server templates as the `children` variable) */
export type Case = { organism: string; props: unknown; children?: string };
export const quiet = <T,>(f: () => T): T => { const w = console.warn, e = console.error; console.warn = console.error = () => {}; try { return f(); } finally { console.warn = w; console.error = e; } };
const ok = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
const json = (cmd: string, args: string[], input: unknown, cwd?: string, env?: NodeJS.ProcessEnv) =>
  JSON.parse(execFileSync(cmd, args, { cwd, env, input: JSON.stringify(input), encoding: "utf8", maxBuffer: 1 << 30, stdio: ["pipe", "pipe", "inherit"] })) as string[];

const SRV = path.join(ROOT, "test/server");
const VENV_PY = path.join(SRV, ".venv/bin/python");
const PY = process.env.PYTHON ?? (existsSync(VENV_PY) ? VENV_PY : "python3");
const php = (): string | null => (ok("php", ["-v"]) && existsSync(path.join(SRV, "vendor/autoload.php")) ? null : "php or test/server/vendor missing (composer install -d packages/kit-compose/test/server)");
export const TEMPL = "v0.3.1070";

/** the runtime's sources (`<rt>/src` of kit-compose), or a scratch copy with the overrides written over it */
function sources<T>(rt: ServerOrgRuntime, overrides: Map<string, string> | undefined, f: (src: string, tmp: string | null) => T): T {
  if (!overrides?.size) return f(path.join(ROOT, `${rt}/src`), null);
  const tmp = mkdtempSync(path.join(tmpdir(), `kit-compose-${rt}-`));
  try {
    cpSync(path.join(ROOT, `${rt}/src`), path.join(tmp, "src"), { recursive: true });
    for (const [rel, body] of overrides) if (rel.startsWith(`${rt}/src/`)) writeFileSync(path.join(tmp, rel.slice(rt.length + 1)), body);
    return f(path.join(tmp, "src"), tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const phpRender = (rt: "twig" | "latte", ext: string, cases: Case[], overrides?: Map<string, string>) => sources(rt, overrides, (src) =>
  json("php", [path.join(SRV, "render-organisms.php"), rt, path.join(KIT, `${rt}/src`), src], cases.map((c) => ({ template: `blocks/${fileName(c.organism)}${ext}`, p: c.props, ...(c.children === undefined ? {} : { children: c.children }) }))));

/** a scratch Go module (templ generate writes *_templ.go next to the sources): kit module + kit-compose module + a main over the organisms */
function templRender(cases: Case[], overrides?: Map<string, string>): string[] {
  const tmp = mkdtempSync(path.join(tmpdir(), "kit-compose-org-templ-"));
  try {
    cpSync(path.join(KIT, "templ/src/ui"), path.join(tmp, "kitmod/ui"), { recursive: true });
    cpSync(path.join(KIT, "templ/src/utils"), path.join(tmp, "kitmod/utils"), { recursive: true });
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ/kitmod", f), path.join(tmp, "kitmod", f));
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ", f), path.join(tmp, f));
    cpSync(path.join(ROOT, "templ/src"), path.join(tmp, "src"), { recursive: true });
    for (const [rel, body] of overrides ?? []) if (rel.startsWith("templ/src/")) writeFileSync(path.join(tmp, rel.slice(6)), body);
    const names = [...new Set(cases.map((c) => c.organism))].sort();
    mkdirSync(path.join(tmp, "cmd"));
    writeFileSync(path.join(tmp, "cmd/main.go"), [`package main`, ``, `import (`, `\t"bufio"`, `\t"context"`, `\t"encoding/json"`, `\t"fmt"`, `\t"io"`, `\t"os"`, `\t"strings"`, ``, `\t"github.com/a-h/templ"`, ``, `\t"${TEMPL_MODULE}/src/blocks"`, `)`, ``,
      `type request struct {\n\tName     string          \`json:"name"\`\n\tProps    json.RawMessage \`json:"props"\`\n\tChildren *string         \`json:"children"\`\n}`, ``,
      `func component(name string, props []byte) (templ.Component, error) {`, `\tswitch name {`,
      ...names.flatMap((n) => [`\tcase ${JSON.stringify(n)}:`, `\t\tvar p blocks.${n}Props`, `\t\tif err := json.Unmarshal(props, &p); err != nil {`, `\t\t\treturn nil, err`, `\t\t}`, `\t\treturn blocks.${n}(p), nil`]),
      `\t}`, `\treturn nil, fmt.Errorf("unknown organism %s", name)`, `}`, ``,
      `func main() {`, `\tvar reqs []request`, `\tif err := json.NewDecoder(bufio.NewReader(os.Stdin)).Decode(&reqs); err != nil {`, `\t\tpanic(err)`, `\t}`,
      `\tout := make([]string, len(reqs))`, `\tfor i, r := range reqs {`, `\t\tc, err := component(r.Name, r.Props)`, `\t\tif err != nil {`, `\t\t\tout[i] = "ERROR: " + err.Error()`, `\t\t\tcontinue`, `\t\t}`,
      `\t\tctx := context.Background()`, `\t\tif r.Children != nil {`, `\t\t\ttext := *r.Children`,
      `\t\t\tctx = templ.WithChildren(ctx, templ.ComponentFunc(func(_ context.Context, w io.Writer) error {`, `\t\t\t\t_, err := io.WriteString(w, templ.EscapeString(text))`, `\t\t\t\treturn err`, `\t\t\t}))`, `\t\t}`,
      `\t\tvar b strings.Builder`, `\t\tif err := c.Render(ctx, &b); err != nil {`, `\t\t\tout[i] = "ERROR: " + err.Error()`, `\t\t\tcontinue`, `\t\t}`, `\t\tout[i] = b.String()`, `\t}`,
      `\t_ = json.NewEncoder(os.Stdout).Encode(out)`, `}`, ``].join("\n"));
    const env = { ...process.env, GOFLAGS: "-mod=mod" };
    execFileSync("go", ["run", `github.com/a-h/templ/cmd/templ@${TEMPL}`, "generate", "-path", tmp], { cwd: tmp, env, stdio: ["ignore", "ignore", "inherit"] });
    execFileSync("go", ["vet", "./..."], { cwd: tmp, env, stdio: ["ignore", "ignore", "inherit"] });
    return json("go", ["run", "./cmd"], cases.map((c) => ({ name: c.organism, props: c.props, ...(c.children === undefined ? {} : { children: c.children }) })), tmp, env);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export const SERVER: Record<ServerOrgRuntime, { missing: () => string | null; render: (cases: Case[], overrides?: Map<string, string>) => string[] }> = {
  jinja2: {
    missing: () => (ok(PY, ["-c", "import jinja2"]) ? null : `${PY} with Jinja2 not found`),
    render: (cases, overrides) => sources("jinja2", overrides, (src) =>
      json(PY, [path.join(SRV, "render-organisms.py"), path.join(KIT, "jinja2/src"), src], cases.map((c) => ({ template: `blocks/${fileName(c.organism)}.html.j2`, p: c.props, ...(c.children === undefined ? {} : { children: c.children }) })))),
  },
  twig: { missing: php, render: (cases, overrides) => phpRender("twig", ".html.twig", cases, overrides) },
  latte: { missing: php, render: (cases, overrides) => phpRender("latte", ".latte", cases, overrides) },
  templ: { missing: () => (ok("go", ["version"]) ? null : "go not found"), render: templRender },
};

export const JS_RT = ["react", "svelte", "vue", "solid"] as const;
/** a renderer of the JS runtimes over the kit-compose sources (a failure is "ERROR: <message>"); `file` renders another file of src (no extension) */
export async function jsRenderer(organisms: OrganismSpec[]): Promise<(rt: (typeof JS_RT)[number], c: Case, file?: string) => Promise<string>> {
  installSsrPlugin();
  const { render } = await import("svelte/server");
  const { createRawSnippet } = await import("svelte");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const { createSSRApp, h } = await import("vue");
  const { renderToString: vueSSR } = await import("@vue/server-renderer");
  const { createComponent } = await import("solid-js");
  const { renderToString: solidSSR } = await import("solid-js/web");
  const R = (await import("../react/src/organisms")) as Record<string, ComponentType<Record<string, unknown>>>;
  const L = (await import("../solid/src/organisms")) as Record<string, unknown>;
  const byName = Object.fromEntries(organisms.map((o) => [o.name, o]));
  return async (rt, c, file) => {
    const o = byName[c.organism]!;
    const rel = file ?? `${tierDir(o.id)}/${fileName(o.name)}`;
    const text = c.children;
    const props = { ...(c.props as Record<string, unknown>), ...(text === undefined ? {} : { children: text }) } as Record<string, unknown> & { className?: string };
    const { className, ...rest } = props;
    const other = { ...rest, ...(className ? { class: className } : {}) };
    try {
      if (rt === "react") { const C = file ? (await import(`../react/src/${rel}.tsx`))[c.organism] : R[c.organism]; return quiet(() => renderToStaticMarkup(createElement(C!, props))); }
      if (rt === "svelte") { const S = (await import(`../svelte/src/${rel}.svelte`)).default; return quiet(() => render(S, { props: text === undefined ? other : { ...other, children: createRawSnippet(() => ({ render: () => esc(text) })) } }).body); }
      if (rt === "vue") {
        const V = (await import(`../vue/src/${rel}.vue`)).default;
        const w = console.warn; console.warn = () => {};
        const { children: _text, ...attrs } = other;
        const app = createSSRApp({ render: () => (text === undefined ? h(V, other) : h(V, attrs, { default: () => text })) });
        let failed: unknown;
        app.config.errorHandler = (e) => { failed ??= e; };
        try { const html = await vueSSR(app); if (failed) throw failed; return html; } finally { console.warn = w; }
      }
      const C = file ? (await import(`../solid/src/${rel}.tsx`))[c.organism] : L[c.organism];
      return quiet(() => solidSSR(() => createComponent(C as never, other as never)).replace(/ data-hk="[^"]*"/g, ""));
    } catch (e) {
      return `ERROR: ${(e as Error).message}`;
    }
  };
}
