"""The helpers of the codegen-x organism templates for Jinja2 (blocks/<organism>.html.j2, called with `p` and `children`):
`register(env, root)` adds them as og_* globals to the kit + compose Environment."""

from __future__ import annotations

import functools
from typing import Any

from jinja2 import Environment, pass_environment
from jinja2.runtime import Undefined
from markupsafe import Markup

from . import runtime as rt


def _plain(v: Any) -> Any:
    if isinstance(v, Undefined):
        return None
    if isinstance(v, list):
        return [_plain(x) for x in v]
    return v


def _wrap(f: Any, safe: bool = False) -> Any:
    @functools.wraps(f)
    def call(*args: Any) -> Any:
        out = f(*[_plain(a) for a in args])
        return Markup(out) if safe else out
    return call


@pass_environment
def _include(env: Environment, name: Any, vars: Any) -> Markup:
    return Markup(env.get_template(str(name)).render(_plain(vars) or {}))


def _merge(a: Any, b: Any) -> dict:
    return {**(_plain(a) or {}), **(_plain(b) or {})}


_NAMES = {
    "and": "and_", "or": "or_", "def": "def_", "len": "len_", "str": "str_", "range": "range_", "max": "max_", "min": "min_", "round": "round_", "html": "html_",
}
_PLAIN = [
    "get", "field", "s", "text", "html", "t", "n", "i", "eq", "lt", "gt", "le", "ge", "add", "sub", "mul", "div", "and", "or", "coalesce", "def", "l",
    "len", "spread", "str", "has", "cnv", "tpl", "num", "money", "at", "page_window", "fit_cols", "uniq", "words", "nbsp", "nth", "range",
    "max", "min", "round", "count", "where", "match", "pick", "sum_by", "first_of", "max_by", "css", "attrs", "is_set_str", "default_if_empty",
    "map_or", "int_map_or", "bool_str", "concat_trim", "cn", "resolve_tag", "title_tag", "compose", "recipe", "preset", "url", "srcset", "style", "slot", "markup",
]


def register(env: Environment, root: str) -> Environment:
    """registers the og_* helpers of the organism templates (blocks/*) on an Environment whose loader also finds the
    compositions (compose/*) and the kit primitives (ui/*); root holds blocks/recipes, blocks/presets and icons/"""
    rt.set_root(root)
    for name in _PLAIN:
        env.globals["og_" + name] = _wrap(getattr(rt, _NAMES.get(name, name)))
    env.globals["og_attr_html"] = _wrap(rt.attr_html, safe=True)
    env.globals["og_lucide"] = _wrap(rt.lucide, safe=True)
    env.globals["og_include"] = _include
    env.globals["og_merge"] = _merge
    return env
