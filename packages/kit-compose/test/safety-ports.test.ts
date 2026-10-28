// The output safety of the PHP (Twig, Latte), Python (Jinja2) and Go (templ) runtimes held to the vectors of the TypeScript one
// (compose-gen/runtimes/core/test/safety-vectors.json, assets/ts/safe.ts): each port reads the vectors and answers them, the
// answers must be the wanted ones. Without a toolchain the port is skipped; UI8KIT_REQUIRE_ALL_RUNTIMES=1 fails instead.
import { expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const RT = path.resolve(ROOT, "../compose-gen/runtimes");
const VECTORS = path.join(RT, "core/test/safety-vectors.json");
const REQUIRED = process.env.UI8KIT_REQUIRE_ALL_RUNTIMES === "1";
const SRV = path.join(import.meta.dir, "server");
const VENV_PY = path.join(SRV, ".venv/bin/python");
const PY = process.env.PYTHON ?? (existsSync(VENV_PY) ? VENV_PY : "python3");
const ok = (cmd: string, args: string[]) => spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
const v = JSON.parse(readFileSync(VECTORS, "utf8")) as {
  url: Array<[string, boolean, boolean]>; srcset: Array<[string, boolean]>; style: Array<[string, boolean]>; css: Array<[string, boolean]>; names: Array<[string, boolean]>; attrs: Array<[string, string, string]>;
};
/** what every port must answer: [url ok, url value], srcset value, style value, css value, name ok, attr value, decoded entities */
const ENT = "&#106;&#x61;&colon;&Tab;&NewLine;&sol;&bsol;&amp;#58;&nope;&#0;";
const want = {
  url: v.url.map(([s, , ok]) => [ok, ok ? s : ""]),
  srcset: v.srcset.map(([s, ok]) => (ok ? s : "")),
  style: v.style.map(([s, ok]) => (ok ? s : "")),
  css: v.css.map(([s, ok]) => (ok ? s : "")),
  names: v.names.map(([, ok]) => ok),
  attrs: v.attrs.map(([, , w]) => w),
  entities: "ja:\t\n/\\:&nope;\ufffd",
};

const php = `<?php
require $argv[1];
use CodegenX\\Organisms\\Twig\\Runtime as R;
$v = json_decode(file_get_contents($argv[2]), true);
echo json_encode([
  'url' => array_map(fn($x) => [R::isSafeUrl($x[0], $x[1]), R::url($x[0], $x[1])], $v['url']),
  'srcset' => array_map(fn($x) => R::srcset($x[0]), $v['srcset']),
  'style' => array_map(fn($x) => R::style($x[0]), $v['style']),
  'css' => array_map(fn($x) => R::cssValue($x[0]), $v['css']),
  'names' => array_map(fn($x) => R::isSafeAttrName($x[0]), $v['names']),
  'attrs' => array_map(fn($x) => R::attrValue($x[0], $x[1]), $v['attrs']),
  'entities' => R::decodeEntities($argv[3]),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
`;
const py = `import json, sys
sys.path.insert(0, sys.argv[1])
from compose_organisms import runtime as R
v = json.load(open(sys.argv[2], encoding="utf-8"))
print(json.dumps({
  "url": [[R.is_safe_url(s, i), R.url(s, i)] for s, i, _ in v["url"]],
  "srcset": [R.srcset(s) for s, _ in v["srcset"]],
  "style": [R.style(s) for s, _ in v["style"]],
  "css": [R.css_value(s) for s, _ in v["css"]],
  "names": [R.is_safe_attr_name(n) for n, _ in v["names"]],
  "attrs": [R.attr_value(n, s) for n, s, _ in v["attrs"]],
  "entities": R.decode_entities(sys.argv[3]),
}, ensure_ascii=False))
`;
const go = `package main

import (
	"encoding/json"
	"fmt"
	"os"

	R "probe/uiutils"
)

func main() {
	b, _ := os.ReadFile(os.Args[1])
	var v map[string][][]any
	_ = json.Unmarshal(b, &v)
	out := map[string]any{"entities": R.DecodeEntities(os.Args[2])}
	var url, srcset, style, css, names, attrs []any
	for _, x := range v["url"] {
		url = append(url, []any{R.IsSafeURL(x[0].(string), x[1].(bool)), R.URL(x[0], x[1].(bool))})
	}
	for _, x := range v["srcset"] {
		srcset = append(srcset, R.Srcset(x[0]))
	}
	for _, x := range v["style"] {
		style = append(style, R.Style(x[0]))
	}
	for _, x := range v["css"] {
		css = append(css, R.CSSValue(x[0]))
	}
	for _, x := range v["names"] {
		names = append(names, R.IsSafeAttrName(x[0].(string)))
	}
	for _, x := range v["attrs"] {
		attrs = append(attrs, R.AttrValue(x[0].(string), x[1]))
	}
	out["url"], out["srcset"], out["style"], out["css"], out["names"], out["attrs"] = url, srcset, style, css, names, attrs
	j, _ := json.Marshal(out)
	fmt.Println(string(j))
}
`;

const ports: Record<string, { missing: () => string | null; run: (tmp: string) => string }> = {
  php: {
    missing: () => (ok("php", ["-v"]) ? null : "php not found"),
    run: (tmp) => {
      writeFileSync(path.join(tmp, "Runtime.php"), readFileSync(path.join(RT, "twig/assets/php-shared/Runtime.php"), "utf8").replaceAll("{{RUNTIME}}", "Twig"));
      writeFileSync(path.join(tmp, "probe.php"), php);
      return execFileSync("php", [path.join(tmp, "probe.php"), path.join(tmp, "Runtime.php"), VECTORS, ENT], { encoding: "utf8" });
    },
  },
  python: {
    missing: () => (ok(PY, ["-c", "import jinja2"]) ? null : `${PY} with jinja2 not found`),
    run: (tmp) => {
      writeFileSync(path.join(tmp, "probe.py"), py);
      return execFileSync(PY, [path.join(tmp, "probe.py"), path.join(RT, "jinja2/assets/py"), VECTORS, ENT], { encoding: "utf8" });
    },
  },
  go: {
    missing: () => (ok("go", ["version"]) ? null : "go not found"),
    run: (tmp) => {
      const src = path.join(RT, "templ/assets/go");
      mkdirSync(path.join(tmp, "uiutils"));
      for (const f of readdirSync(src).filter((f) => f.endsWith(".go") && !f.endsWith("_test.go"))) cpSync(path.join(src, f), path.join(tmp, "uiutils", f));
      const mod = readFileSync(path.join(ROOT, "templ/go.mod"), "utf8").replace(/^module .*$/m, "module probe");
      writeFileSync(path.join(tmp, "go.mod"), mod);
      cpSync(path.join(ROOT, "templ/go.sum"), path.join(tmp, "go.sum"));
      mkdirSync(path.join(tmp, "cmd"));
      writeFileSync(path.join(tmp, "cmd/main.go"), go);
      return execFileSync("go", ["run", "./cmd", VECTORS, ENT], { cwd: tmp, encoding: "utf8", env: { ...process.env, GOFLAGS: "-mod=mod" } });
    },
  },
};

for (const [name, port] of Object.entries(ports)) {
  const missing = port.missing();
  if (missing && !REQUIRED) { test.skip(`${name}: ${missing}`, () => {}); continue; }
  test(`${name}: the safety port answers the shared vectors as assets/ts/safe.ts does`, () => {
    if (missing) throw new Error(missing);
    const tmp = mkdtempSync(path.join(tmpdir(), `safety-${name}-`));
    try {
      const got = JSON.parse(port.run(tmp)) as typeof want;
      for (const k of Object.keys(want) as Array<keyof typeof want>) {
        const w = want[k], g = got[k];
        if (Array.isArray(w)) (w as unknown[]).forEach((x, i) => expect([k, i, (g as unknown[])[i]]).toEqual([k, i, x]));
        else expect([k, g]).toEqual([k, w]);
      }
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }, 120_000);
}
