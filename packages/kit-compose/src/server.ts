// Server runtimes of the thin build (jinja2, twig, latte, templ): one template per composition that calls the installed
// primitive (packages/kit/<runtime>) with props computed by one small helper per language from compose.json
// (the same src/map.ts + variants/ description as the JS runtimes). No logic in the templates.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { BrickMap } from "./map";
import { RECIPES } from "./recipes";

export const SERVER_RT = ["jinja2", "twig", "latte", "templ"] as const;
const VOID = new Set(["Input", "Checkbox", "Radio", "Switch", "Separator", "Image"]);
const DIR: Record<string, string> = { Summary: "disclosure", SelectOption: "select", SelectOptGroup: "select" };
const dirOf = (p: string) => DIR[p] ?? p.toLowerCase();
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
export const pascal = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);
/** fixed values the React composition passes as a primitive prop (not an attribute) */
const FIXED_PROPS: Record<string, string[]> = { Input: ["type"] };

/** the trail element as html (appended after the children) */
export const trailHtml = (m: BrickMap): string => !m.trail ? "" : `<${m.trail.tag}${Object.entries(m.trail.attrs).map(([k, v]) => ` ${k}="${v}"`).join("")}></${m.trail.tag}>`;

export function spec(m: BrickMap) {
  const fixed = Object.entries(m.fixed ?? {});
  const asProp = FIXED_PROPS[m.primitive] ?? [];
  return {
    primitive: m.primitive,
    recipe: m.recipe ?? null,
    keys: m.recipe ? RECIPES[m.recipe].keys : [],
    extra: m.extra ?? "",
    tag: m.tag ?? null,
    tagFrom: m.tagFrom ? { heading: !!m.tagFrom.heading, fallback: m.tagFrom.fallback } : null,
    fixedProps: Object.fromEntries(fixed.filter(([k]) => asProp.includes(k))),
    fixedAttrs: Object.fromEntries(fixed.filter(([k]) => !asProp.includes(k))),
    ...(m.trail ? { trail: trailHtml(m) } : {}),
  };
}

function composeJson(items: [string, BrickMap][]): string {
  const used = [...new Set([...items.map(([, m]) => m.recipe), "themetoggle", "sheettrigger"].filter(Boolean))].sort() as string[];
  const recipes = Object.fromEntries(used.map((id) => {
    const { base, keys, defaults, byKey, compound } = RECIPES[id];
    return [id, { base, keys, defaults, byKey, compound: compound ?? [] }];
  }));
  return JSON.stringify({ recipes, compositions: Object.fromEntries(items.map(([n, m]) => [n, spec(m)])) }, null, 2) + "\n";
}

const PY = (head: string) => `# ${head}
"""codegen-x compositions for Jinja2: environment() = the installed kit environment (packages/kit/jinja2) + the compose/
templates, and compose_props(name, p) -> the props of the primitive (recipe classes, tag, fixed props/attrs).
Templates: compose/<name>.html.j2, called like a primitive: render(p={...}, children=Markup(...))."""

import json
import os
from typing import Any

from jinja2 import ChoiceLoader, FileSystemLoader

HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(HERE, "compose.json"), encoding="utf-8") as f:
    DATA = json.load(f)


def _pascal(k: str) -> str:
    return k[:1].upper() + k[1:]


def _set(v: Any) -> bool:
    # None, "" and Jinja Undefined (p['Missing']) are unset
    return v is not None and str(v) != ""


def rc(rid: str, values: dict) -> str:
    r = DATA["recipes"][rid]

    def pick(k: str) -> str:
        v = values.get(k)
        return str(v) if _set(v) else r["defaults"].get(k, "")

    out = [r["base"]] + [r["byKey"].get(k, {}).get(pick(k), "") for k in r["keys"]]
    for c in r["compound"]:
        if all(pick(k) == v for k, v in c.items() if k != "class"):
            out.append(c["class"])
    return " ".join(x for x in out if x)


def _heading(v: Any, fallback: str) -> str:
    try:
        n = int(str(v))
    except (TypeError, ValueError):
        return fallback
    return f"h{n}" if 1 <= n <= 6 else fallback


def compose_props(name: str, p: Any) -> dict:
    s = DATA["compositions"][name]
    q = dict(p or {})
    values = {k: q.pop(_pascal(k), None) for k in s["keys"]}
    as_ = q.pop("As", None) if s["tagFrom"] and s["tagFrom"]["heading"] else None
    q["Class"] = " ".join(x for x in [rc(s["recipe"], values) if s["recipe"] else "", s["extra"], q.get("Class") or ""] if x)
    if s["tag"]:
        q["Tag"] = s["tag"]
    elif s["tagFrom"] and s["tagFrom"]["heading"]:
        q["Tag"] = _heading(as_, s["tagFrom"]["fallback"])
    elif s["tagFrom"]:
        q["Tag"] = q.get("Tag") if q.get("Tag") is not None else s["tagFrom"]["fallback"]
    for k, v in s["fixedProps"].items():
        if not _set(q.get(_pascal(k))):
            q[_pascal(k)] = v
    if s["fixedAttrs"]:
        q["Attrs"] = {**s["fixedAttrs"], **(q.get("Attrs") or {})}
    return q


def compose_trail(name: str, children: Any = None):
    from markupsafe import Markup

    t = DATA["compositions"][name].get("trail", "")
    return Markup(children if children is not None and str(children) != "" else "") + Markup(t)


def environment(kit_root: str, **options: Any):
    """kit_root: the installed kit (packages/kit/jinja2/src); its ui8kit_jinja must be importable."""
    from ui8kit_jinja import environment as kit_environment

    env = kit_environment(kit_root, **options)
    env.loader = ChoiceLoader([FileSystemLoader(kit_root), FileSystemLoader(os.path.dirname(HERE))])
    env.globals["compose_props"] = compose_props
    env.globals["compose_trail"] = compose_trail
    env.globals["compose_rc"] = rc
    env.globals["compose_join"] = lambda parts: " ".join(str(x) for x in parts if x)
    return env
`;

const PHP_CORE = (head: string, ns: string) => `<?php

// ${head}
// codegen-x compositions: props(name, params) -> the params of the installed primitive (recipe classes, tag, fixed props/attrs).

declare(strict_types=1);

namespace ${ns};

final class Compose
{
    private static ?array $data = null;

    private static function data(): array
    {
        return self::$data ??= json_decode((string) file_get_contents(__DIR__ . '/compose.json'), true, 512, JSON_THROW_ON_ERROR);
    }

    private static function isSet(mixed $v): bool
    {
        return $v !== null && $v !== '';
    }

    public static function rc(string $id, array $values): string
    {
        $r = self::data()['recipes'][$id];
        $pick = static fn (string $k): string => self::isSet($values[$k] ?? null) ? (string) $values[$k] : (string) ($r['defaults'][$k] ?? '');
        $out = [$r['base']];
        foreach ($r['keys'] as $k) {
            $out[] = $r['byKey'][$k][$pick($k)] ?? '';
        }
        foreach ($r['compound'] as $c) {
            $hit = true;
            foreach ($c as $k => $v) {
                if ($k !== 'class' && $pick($k) !== $v) {
                    $hit = false;
                }
            }
            if ($hit) {
                $out[] = $c['class'];
            }
        }
        return implode(' ', array_filter($out, static fn ($x) => $x !== ''));
    }

    /** @param list<mixed> $parts */
    public static function join(array $parts): string
    {
        return implode(' ', array_filter(array_map('strval', $parts), static fn ($x) => $x !== ''));
    }

    public static function props(string $name, array $p): array
    {
        $s = self::data()['compositions'][$name];
        $q = array_filter($p, static fn ($k) => !is_string($k) || $k === '' || $k[0] !== '_', ARRAY_FILTER_USE_KEY);
        $values = [];
        foreach ($s['keys'] as $k) {
            $values[$k] = $q[$k] ?? null;
            unset($q[$k]);
        }
        $as = $q['as'] ?? null;
        if ($s['tagFrom'] !== null && $s['tagFrom']['heading']) {
            unset($q['as']);
        }
        $q['class'] = implode(' ', array_filter([$s['recipe'] !== null ? self::rc($s['recipe'], $values) : '', $s['extra'], (string) ($q['class'] ?? '')], static fn ($x) => $x !== ''));
        if ($s['tag'] !== null) {
            $q['tag'] = $s['tag'];
        } elseif ($s['tagFrom'] !== null && $s['tagFrom']['heading']) {
            $n = is_numeric($as) ? (int) $as : 0;
            $q['tag'] = $n >= 1 && $n <= 6 ? 'h' . $n : $s['tagFrom']['fallback'];
        } elseif ($s['tagFrom'] !== null) {
            $q['tag'] = $q['tag'] ?? $s['tagFrom']['fallback'];
            if ($q['tag'] === '') {
                $q['tag'] = $s['tagFrom']['fallback'];
            }
        }
        foreach ($s['fixedProps'] as $k => $v) {
            if (!self::isSet($q[$k] ?? null)) {
                $q[$k] = $v;
            }
        }
        if ($s['fixedAttrs'] !== []) {
            $q['attrs'] = array_merge($s['fixedAttrs'], (array) ($q['attrs'] ?? []));
        }
        if (isset($s['trail'])) {
            $q['children'] = (string) ($q['children'] ?? '') . $s['trail'];
        }
        return $q;
    }
}
`;

const TWIG_EXT = (head: string) => `<?php

// ${head}

declare(strict_types=1);

namespace CodegenX\\Compose\\Twig;

use Twig\\Extension\\AbstractExtension;
use Twig\\TwigFunction;

/** compose_props(name, _context): register next to the kit's \\UI8Kit\\Twig\\TwigExtension. */
final class ComposeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('compose_props', [Compose::class, 'props']),
            new TwigFunction('compose_rc', [Compose::class, 'rc']),
            new TwigFunction('compose_join', [Compose::class, 'join']),
        ];
    }
}
`;

const GO = (head: string) => `// ${head}

// Package compose: codegen-x compositions over the installed UI8Kit 3 templ primitives (packages/kit/templ).
package compose

import (
	_ "embed"
	"encoding/json"
	"strconv"
	"strings"

	"github.com/a-h/templ"
)

//go:embed compose.json
var composeJSON []byte

type recipe struct {
	Base     string                       \`json:"base"\`
	Keys     []string                     \`json:"keys"\`
	Defaults map[string]string            \`json:"defaults"\`
	ByKey    map[string]map[string]string \`json:"byKey"\`
	Compound []map[string]string          \`json:"compound"\`
}

var recipes = func() map[string]recipe {
	var d struct {
		Recipes map[string]recipe \`json:"recipes"\`
	}
	if err := json.Unmarshal(composeJSON, &d); err != nil {
		panic(err)
	}
	return d.Recipes
}()

// Rc returns the classes of recipe id for the given values (unset = defaults), compound variants included.
func Rc(id string, values map[string]string) string {
	r := recipes[id]
	pick := func(k string) string {
		if v := values[k]; v != "" {
			return v
		}
		return r.Defaults[k]
	}
	out := []string{r.Base}
	for _, k := range r.Keys {
		out = append(out, r.ByKey[k][pick(k)])
	}
	for _, c := range r.Compound {
		hit := true
		for k, v := range c {
			if k != "class" && pick(k) != v {
				hit = false
			}
		}
		if hit {
			out = append(out, c["class"])
		}
	}
	return Join(out...)
}

// Join joins the non-empty class lists (the primitive merges them).
func Join(parts ...string) string {
	out := parts[:0:0]
	for _, p := range parts {
		if p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, " ")
}

// Heading maps a heading level ("1".."6") to h1..h6, else fallback.
func Heading(as string, fallback string) string {
	if n, err := strconv.Atoi(as); err == nil && n >= 1 && n <= 6 {
		return "h" + as
	}
	return fallback
}

// Or returns v, or d when v is empty.
func Or(v, d string) string {
	if v == "" {
		return d
	}
	return v
}

// WithAttrs puts the fixed attributes under the caller's (the caller wins, as in the JS runtimes).
func WithAttrs(user templ.Attributes, fixed map[string]string) templ.Attributes {
	out := templ.Attributes{}
	for k, v := range fixed {
		out[k] = v
	}
	for k, v := range user {
		out[k] = v
	}
	return out
}
`;

function latteParams(kit: string, p: string): string[] {
  const src = readFileSync(path.join(kit, "latte/src/ui", dirOf(p), `${p}.latte`), "utf8");
  const block = src.match(/\{parameters\n([^]*?)\n\}/);
  if (!block) throw new Error(`kit-compose: no {parameters} in latte ${p}`);
  return block[1].split("\n").map((l) => l.trim().replace(/,$/, "")).filter(Boolean);
}

function templPkg(kit: string, p: string): string {
  const f = path.join(kit, "templ/src/ui", dirOf(p), `${dirOf(p)}.templ`);
  if (!existsSync(f)) throw new Error(`kit-compose: no templ ${f}`);
  const pkg = readFileSync(f, "utf8").match(/^package (\w+)/m)?.[1];
  if (!pkg) throw new Error(`kit-compose: no package in ${f}`);
  return pkg;
}

export function serverFiles(items: [string, BrickMap][], kit: string, HEAD: string): Map<string, string> {
  const files = new Map<string, string>();
  const json = composeJson(items);
  for (const rt of SERVER_RT) files.set(`${rt}/src/compose/compose.json`, json);
  files.set("jinja2/src/compose/compose_env.py", PY(HEAD));
  files.set("twig/src/compose/Compose.php", PHP_CORE(HEAD, "CodegenX\\Compose\\Twig"));
  files.set("twig/src/compose/ComposeExtension.php", TWIG_EXT(HEAD));
  files.set("latte/src/compose/Compose.php", PHP_CORE(HEAD, "CodegenX\\Compose\\Latte"));
  files.set("templ/src/compose/compose.go", GO(HEAD));
  for (const [name, m] of items) {
    const p = m.primitive, s = spec(m), leaf = VOID.has(p);
    const j2 = `ui/${dirOf(p)}/${kebab(p)}.html.j2`, tw = `ui/${dirOf(p)}/${p}.html.twig`;
    for (const [rt, f] of [["jinja2", j2], ["twig", tw]] as const) if (!existsSync(path.join(kit, rt, "src", f))) throw new Error(`kit-compose: no ${rt} primitive ${f}`);
    const what = `${name}: ${p}${m.tag ? ` <${m.tag}>` : ""}${m.recipe ? ` + recipe ${m.recipe}` : ""}`;
    files.set(`jinja2/src/compose/${kebab(name)}.html.j2`,
      `{#- ${HEAD}\n    ${what}. Props (p): ${[...s.keys.map(pascal), ...(s.tagFrom ? [s.tagFrom.heading ? "As" : "Tag"] : []), "Class", "Attrs"].join(", ")} + the props of ${p}. -#}\n` +
      (m.trail ? `{%- with p = compose_props('${name}', p), children = compose_trail('${name}', children) %}{% include '${j2}' %}{% endwith %}` : `{%- with p = compose_props('${name}', p) %}{% include '${j2}' %}{% endwith %}`));
    files.set(`twig/src/compose/${name}.html.twig`,
      `{# ${HEAD} #}\n{# ${what}. Params: ${[...s.keys, ...(s.tagFrom ? [s.tagFrom.heading ? "as" : "tag"] : []), "class", "attrs"].join(", ")} + the params of ${p}. #}\n` +
      `{% include '${tw}' with compose_props('${name}', _context) only %}`);
    const all = latteParams(kit, p);
    const clash = (l: string) => s.keys.some((k) => l.includes(`$${k} `)) || (!!s.tagFrom?.heading && l.includes("$as "));
    const prim = all.filter((l) => !clash(l));
    // Latte includes inherit the caller's variables: a recipe key that is also a primitive param is reset to the primitive's default
    const reset = all.filter(clash).map((l) => { const [, n, d] = l.match(/\$(\w+)\s*=\s*(.+)$/)!; return `'${n}' => ${d}`; });
    const own = [...s.keys.map((k) => `$${k} = null`), ...(s.tagFrom?.heading ? ["$as = null"] : []), ...(s.tagFrom && !s.tagFrom.heading && !prim.some((l) => l.includes("$tag ")) ? ["string $tag = ''"] : [])];
    const names = [...prim, ...own].map((l) => l.match(/\$(\w+)/)![1]);
    files.set(`latte/src/compose/${name}.latte`,
      `{* ${HEAD} *}\n{* ${what}. *}\n{parameters\n${[...prim, ...own].map((l) => `  ${l},`).join("\n")}\n}\n` +
      `{include '../${`ui/${dirOf(p)}/${p}.latte`}', ...${reset.length ? "[..." : ""}\\CodegenX\\Compose\\Latte\\Compose::props('${name}', [${names.map((n) => `'${n}' => $${n}`).join(", ")}])${reset.length ? `, ${reset.join(", ")}]` : ""}}`);
    const pkg = templPkg(kit, p), PT = `${pkg}.${p}Props`;
    const fields = [...s.keys.map((k) => `\t${pascal(k)} string`), ...(s.tagFrom?.heading ? ["\t// As — heading level 1..6 (h1..h6), else " + s.tagFrom.fallback, "\tAs string"] : []), `\t${pkg}.${p}Props`];
    const set: string[] = [];
    set.push(`\tin.Class = Join(${[s.recipe ? `Rc("${s.recipe}", map[string]string{${s.keys.map((k) => `"${k}": p.${pascal(k)}`).join(", ")}})` : "", s.extra ? JSON.stringify(s.extra) : "", `p.${p}Props.Class`].filter(Boolean).join(", ")})`);
    if (s.tag) set.push(`\tin.Tag = "${s.tag}"`);
    else if (s.tagFrom?.heading) set.push(`\tin.Tag = Heading(p.As, "${s.tagFrom.fallback}")`);
    else if (s.tagFrom) set.push(`\tin.Tag = Or(in.Tag, "${s.tagFrom.fallback}")`);
    for (const [k, v] of Object.entries(s.fixedProps)) set.push(`\tin.${pascal(k)} = Or(in.${pascal(k)}, ${JSON.stringify(v)})`);
    if (Object.keys(s.fixedAttrs).length) set.push(`\tin.Attrs = WithAttrs(in.Attrs, map[string]string{${Object.entries(s.fixedAttrs).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")}})`);
    files.set(`templ/src/compose/${kebab(name)}.templ`, `// ${HEAD}

package compose

${m.trail ? `import (\n\t"github.com/ui8kit/codegen/generated/templ/ui/${dirOf(p)}"\n\t"github.com/ui8kit/codegen/generated/templ/ui/text"\n)` : `import "github.com/ui8kit/codegen/generated/templ/ui/${dirOf(p)}"`}

// ${name}Props: ${what}.
type ${name}Props struct {
${fields.join("\n")}
}

func ${name[0].toLowerCase() + name.slice(1)}Inner(p ${name}Props) ${PT} {
	in := p.${p}Props
${set.join("\n")}
	return in
}

// ${name} renders ${p} with the composition classes.
templ ${name}(p ${name}Props) {
${leaf ? `\t@${pkg}.${p}(${name[0].toLowerCase() + name.slice(1)}Inner(p))` : `\t@${pkg}.${p}(${name[0].toLowerCase() + name.slice(1)}Inner(p)) {\n\t\t{ children... }${m.trail ? `@text.Text(text.TextProps{Tag: "${m.trail.tag}", Class: ${JSON.stringify(m.trail.attrs.class ?? "")}, Attrs: templ.Attributes{${Object.entries(m.trail.attrs).filter(([k]) => k !== "class").map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(", ")}}})` : ""}\n\t}`}
}
`);
  }
  files.set("templ/go.mod", `// ${HEAD}
module github.com/codegen-x/ui8kit/packages/kit-compose/templ

go 1.26.0

require (
	github.com/a-h/templ v0.3.1070
	github.com/ui8kit/codegen/generated/templ v0.0.0
)

// the installed kit (packages/kit/templ/src) as a module: kitmod/ holds its go.mod and links ui/, utils/ to the kit
replace github.com/ui8kit/codegen/generated/templ => ./kitmod
`);
  files.set("templ/kitmod/go.mod", `// ${HEAD}
// The installed UI8Kit 3 templ kit (packages/kit/templ/src, owned by the ui8kit CLI) as a Go module; ui/ and utils/ are symlinks.
module github.com/ui8kit/codegen/generated/templ

go 1.26.0

require github.com/a-h/templ v0.3.1070
`);
  return files;
}
