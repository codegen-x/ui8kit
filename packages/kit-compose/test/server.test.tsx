// DOM parity of every composition: React SSR = real Jinja2 = real Twig = real Latte = real templ (go run), same cases as the JS suite.
// Without a toolchain (python3 + jinja2, php + test/server/vendor, go) that runtime is skipped with a message;
// UI8KIT_REQUIRE_ALL_RUNTIMES=1 (CI) makes a missing toolchain a failure. Output is trimmed: the kit Twig templates end with a newline (the primitive alone renders it too).
import { test, expect, describe } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { BRICKS } from "../src/map";
import { RECIPES } from "../src/recipes";
import { pascal } from "../src/server";
import * as R from "../react/src/compose";
import { cases, isLeaf, names, norm } from "./shared";

const ROOT = path.resolve(import.meta.dir, "..");
const KIT = path.resolve(ROOT, "../kit");
const REQUIRED = process.env.UI8KIT_REQUIRE_ALL_RUNTIMES === "1";
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const ok = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
const TEMPL = "v0.3.1070";
/** Bugs of the installed kit (registry 3.2.0) seen through a composition; each is fixed upstream and listed in the migration report. */
const KNOWN_KIT_BUGS: Record<string, string> = {
  'Image {"variant":"logo"}': "server cn merge of registry 3.2.0 has no object-fit group (object-cover + object-contain both kept; React tailwind-merge keeps the last); fixed in ui8kit/codegen f72d2bd, registry 3.2.2 (unpublished)",
};

type Case = { name: string; c: Record<string, string>; leaf: boolean };
const all: Case[] = names.flatMap((name) => cases(name).map((c) => ({ name, c, leaf: isLeaf(name) })));
const react = all.map(({ name, c, leaf }) => norm(renderToStaticMarkup(createElement((R as Record<string, never>)[name], c as never, leaf ? undefined : "Content"))));

/** case -> server props: className -> class, aria-* / data-* -> attrs, recipe keys + tag/as as composition props */
function split({ name, c }: Case, P: (k: string) => string) {
  const keys = BRICKS[name].recipe ? RECIPES[BRICKS[name].recipe!].keys : [];
  const props: Record<string, unknown> = {}, attrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(c)) {
    if (k === "className") props[P("class")] = v;
    else if (keys.includes(k) || k === "as" || k === "tag") props[P(k)] = v;
    else attrs[k] = v;
  }
  if (Object.keys(attrs).length) props[P("attrs")] = attrs;
  return props;
}

function suite(rt: string, available: string | null, run: () => string[]) {
  if (available) {
    if (REQUIRED) test(`${rt}: toolchain (UI8KIT_REQUIRE_ALL_RUNTIMES=1)`, () => { throw new Error(available); });
    else { console.warn(`[skip] ${rt} server parity: ${available}`); test.skip(`${rt} server parity`, () => {}); }
    return;
  }
  describe(`${rt} = react`, () => {
    let html: string[] = [];
    test(`${rt}: render all ${all.length} cases`, () => { html = run(); expect(html.length).toBe(all.length); }, 600000);
    for (const name of names) test(`${rt} = react: ${name}`, () => {
      all.forEach((k, i) => {
        if (k.name !== name) return;
        const id = `${name} ${JSON.stringify(k.c)}`, got = norm((html[i] ?? "").trim());
        // a known bug of the installed kit is asserted as still present, so the test turns red the day the kit is fixed
        if (KNOWN_KIT_BUGS[id]) expect(got, `${rt} ${id}: ${KNOWN_KIT_BUGS[id]} — remove it from KNOWN_KIT_BUGS`).not.toBe(react[i]);
        else expect(got, `${rt} ${id}`).toBe(react[i]);
      });
    });
  });
}

const json = (cmd: string, args: string[], input: unknown, cwd?: string) =>
  JSON.parse(execFileSync(cmd, args, { cwd, input: JSON.stringify(input), encoding: "utf8", maxBuffer: 64 << 20, stdio: ["pipe", "pipe", "inherit"] })) as string[];

// self-provisioned like the xgen server gates: a venv with Jinja2 and composer install of Twig + Latte under test/server
const SRV = path.join(ROOT, "test/server");
const VENV_PY = path.join(SRV, ".venv/bin/python");
if (!process.env.PYTHON && !existsSync(VENV_PY) && ok("python3", ["-m", "venv", path.join(SRV, ".venv")])) ok(VENV_PY, ["-m", "pip", "install", "-q", "-r", path.join(SRV, "requirements.txt")]);
if (!existsSync(path.join(SRV, "vendor/autoload.php")) && ok("composer", ["--version"])) ok("composer", ["install", "-q", "--no-interaction", "-d", SRV]);
const PY = process.env.PYTHON ?? (existsSync(VENV_PY) ? VENV_PY : "python3");
suite("jinja2", ok(PY, ["-c", "import jinja2"]) ? null : `${PY} with Jinja2 not found (pip install jinja2)`, () =>
  json(PY, [path.join(ROOT, "test/server/render.py"), path.join(KIT, "jinja2/src"), path.join(ROOT, "jinja2/src")],
    all.map((k) => ({ template: `compose/${kebab(k.name)}.html.j2`, p: split(k, pascal), children: k.leaf ? "" : "Content" }))));

const php = ok("php", ["-v"]) && existsSync(path.join(ROOT, "test/server/vendor/autoload.php")) ? null : "php or test/server/vendor missing (composer install -d packages/kit-compose/test/server)";
for (const [rt, ext] of [["twig", ".html.twig"], ["latte", ".latte"]] as const)
  suite(rt, php, () => json("php", [path.join(ROOT, "test/server/render.php"), rt, path.join(KIT, `${rt}/src`), path.join(ROOT, `${rt}/src`)],
    all.map((k) => ({ template: `compose/${k.name}${ext}`, params: { ...split(k, (x) => x), ...(k.leaf ? {} : { children: "Content" }) } }))));

suite("templ", ok("go", ["version"]) ? null : "go not found", () => {
  // a scratch copy (templ generate writes *_templ.go next to the sources): kit module + compose module + a generated main
  const tmp = mkdtempSync(path.join(tmpdir(), "kit-compose-templ-"));
  try {
    cpSync(path.join(KIT, "templ/src/ui"), path.join(tmp, "kitmod/ui"), { recursive: true });
    cpSync(path.join(KIT, "templ/src/utils"), path.join(tmp, "kitmod/utils"), { recursive: true });
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ/kitmod", f), path.join(tmp, "kitmod", f));
    for (const f of ["go.mod", "go.sum"]) cpSync(path.join(ROOT, "templ", f), path.join(tmp, f));
    cpSync(path.join(ROOT, "templ/src"), path.join(tmp, "src"), { recursive: true });
    const imports = new Map<string, string>();
    const lit = (k: Case) => {
      const p = BRICKS[k.name].primitive;
      const src = readFileSync(path.join(ROOT, `templ/src/compose/${kebab(k.name)}.templ`), "utf8");
      const dir = src.match(/ui\/(\w+)"/)![1];
      const pkg = readFileSync(path.join(KIT, `templ/src/ui/${dir}/${dir}.templ`), "utf8").match(/^package (\w+)/m)![1];
      imports.set(pkg, dir);
      const props = split(k, pascal);
      const outer: string[] = [], inner: string[] = [];
      for (const [f, v] of Object.entries(props)) {
        if (f === "Attrs") inner.push(`Attrs: templ.Attributes{${Object.entries(v as Record<string, string>).map(([a, b]) => `${JSON.stringify(a)}: ${JSON.stringify(b)}`).join(", ")}}`);
        else if (f === "Class" || (f === "Tag" && !BRICKS[k.name].tagFrom?.heading)) inner.push(`${f}: ${JSON.stringify(v)}`);
        else outer.push(`${f}: ${JSON.stringify(v)}`);
      }
      return `compose.${k.name}(compose.${k.name}Props{${[...outer, `${p}Props: ${pkg}.${p}Props{${inner.join(", ")}}`].join(", ")}})`;
    };
    const body = all.map((k, i) => `\tcase ${i}:\n\t\tc = ${lit(k)}`).join("\n");
    mkdirSync(path.join(tmp, "cmd"));
    writeFileSync(path.join(tmp, "cmd/main.go"), `package main

import (
	"bytes"
	"context"
	"encoding/json"
	"os"

	"github.com/a-h/templ"
	"github.com/codegen-x/ui8kit/packages/kit-compose/templ/src/compose"
${[...imports].map(([pkg, dir]) => `\t${pkg} "github.com/ui8kit/codegen/generated/templ/ui/${dir}"`).join("\n")}
)

var leaf = []bool{${all.map((k) => String(k.leaf)).join(", ")}}

func main() {
	out := []string{}
	for i := range leaf {
		var c templ.Component
		switch i {
${body}
		}
		ctx := context.Background()
		if !leaf[i] {
			ctx = templ.WithChildren(ctx, templ.Raw("Content"))
		}
		var b bytes.Buffer
		if err := c.Render(ctx, &b); err != nil {
			panic(err)
		}
		out = append(out, b.String())
	}
	_ = json.NewEncoder(os.Stdout).Encode(out)
}
`);
    const env = { ...process.env, GOFLAGS: "-mod=mod" };
    execFileSync("go", ["run", `github.com/a-h/templ/cmd/templ@${TEMPL}`, "generate", "-path", tmp], { cwd: tmp, env, stdio: ["ignore", "ignore", "inherit"] });
    return JSON.parse(execFileSync("go", ["run", "./cmd"], { cwd: tmp, env, encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "inherit"] })) as string[];
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
