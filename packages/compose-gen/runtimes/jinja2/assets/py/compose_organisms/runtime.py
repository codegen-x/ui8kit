"""The helpers of the generated templates. Values are the JSON shapes of the TypeScript props (str, int/float, bool,
None, list, dict) read with the rules of the TypeScript output: JS truthiness, strict equality, String(), clsx +
tailwind-merge. Every helper is None-safe, like `?.`. Port of the Go runtime (dyn.go, expr.go, utils.go) and of the PHP
runtime of the Twig package, so every static runtime prints the same DOM."""

from __future__ import annotations

import html
import json
import math
import os
import re
from typing import Any

from .cn_merge import merge

_ROOT = ""
_JSON: dict[str, Any] = {}


def set_root(root: str) -> None:
    global _ROOT
    _ROOT = root


def load_json(path: str) -> Any:
    if path not in _JSON:
        with open(os.path.join(_ROOT, path), encoding="utf-8") as f:
            _JSON[path] = json.load(f)
    return _JSON[path]


# ------------------------------------------------------------------ values

def _num(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def get(v: Any, path: list) -> Any:
    """a path of fields: get(plan, ['price', 'amount']); `length` of a list or a text is its size"""
    for k in path:
        k = str(k)
        if isinstance(v, list):
            if k == "length":
                v = len(v)
            elif k.isdigit() and int(k) < len(v):
                v = v[int(k)]
            else:
                return None
        elif isinstance(v, dict):
            v = v.get(k)
        elif isinstance(v, str) and k == "length":
            v = len(v)
        else:
            return None
    return v


def field(item: Any, name: str, zero: Any) -> Any:
    """a field of a brick record: the JSON key matched without regard to case, as Go json does"""
    if not isinstance(item, dict):
        return zero
    if name in item:
        return zero if item[name] is None else item[name]
    for k, v in item.items():
        if str(k).lower() == name.lower():
            return zero if v is None else v
    return zero


def fmt_num(f: Any) -> str:
    """String(n) of JavaScript for the numbers the views print"""
    if isinstance(f, int):
        return str(f)
    if math.isnan(f):
        return "NaN"
    if math.isinf(f):
        return "Infinity" if f > 0 else "-Infinity"
    if f == math.floor(f) and abs(f) < 1e21:
        return "%d" % int(f)
    return repr(f)


def s(v: Any) -> str:
    if v is None:
        return ""
    if isinstance(v, str):
        return v
    if isinstance(v, bool):
        return "true" if v else "false"
    if _num(v):
        return fmt_num(v)
    return json.dumps(v, separators=(",", ":"), ensure_ascii=False)


def text(v: Any) -> str:
    """what a text node shows: nothing for None and booleans"""
    return "" if isinstance(v, bool) else s(v)


_ENTITIES = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}


def html_(v: Any) -> str:
    """the markup an html node prints (with |safe): the trusted markup ({"__html": "..."}, a TrustedHtml prop) as it is; any other
    value is text, escaped (& < > " ' as entities, like htmlOf of the TypeScript runtimes)"""
    if isinstance(v, dict) and isinstance(v.get("__html"), str):
        return v["__html"]
    return "".join(_ENTITIES.get(c, c) for c in text(v))


def slot(v: Any) -> str:
    """a slot prop printed in place (|safe): the markup the calling template captured ({"__html": ...}, made by markup()) as it
    is; any other value (a plain string from a caller) is text, escaped"""
    return html_(v)


def markup(v: Any) -> dict:
    """captured markup (a fill of a slot) as a TrustedHtml marker, which slot() prints as it is"""
    return {"__html": "" if v is None else str(v)}


# ------------------------------------------------------------------ output safety (assets/ts/safe.ts, test/safety-vectors.json)

NAMED_ENTITIES = {
    "Tab": "\t", "NewLine": "\n", "colon": ":", "sol": "/", "bsol": "\\", "lpar": "(", "rpar": ")", "amp": "&", "lt": "<", "gt": ">",
    "quot": '"', "apos": "'", "nbsp": "\u00a0", "period": ".", "comma": ",", "excl": "!", "num": "#", "quest": "?", "equals": "=",
    "plus": "+", "semi": ";", "percnt": "%", "lowbar": "_", "ast": "*", "commat": "@", "dollar": "$", "Hat": "^", "grave": "`",
    "lsqb": "[", "rsqb": "]", "lcub": "{", "rcub": "}", "verbar": "|", "vert": "|",
}
URL_SCHEMES = ["http", "https", "mailto", "tel"]
URL_ATTRS = ["href", "src", "action", "formaction", "poster", "cite", "background", "data", "xlink:href"]
IMAGE_ATTRS = ["src", "poster", "background"]
_ENTITY = re.compile(r"&(?:#[xX]([0-9a-fA-F]{1,8});?|#([0-9]{1,10});?|([a-zA-Z][a-zA-Z0-9]{0,31});)")
_DATA_IMAGE = re.compile(r"^data:image/(png|jpeg|gif|webp|avif|svg\+xml)[;,]")


def _from_code(n: int) -> str:
    return chr(n) if 0 < n <= 0x10FFFF and not (0xD800 <= n <= 0xDFFF) else "\ufffd"


def decode_entities(v: str) -> str:
    """character references decoded as a browser would (numeric with or without ;, the named ones of NAMED_ENTITIES), up to 3 rounds"""
    def one(m: "re.Match[str]") -> str:
        if m.group(1) is not None:
            return _from_code(int(m.group(1), 16))
        if m.group(2) is not None:
            return _from_code(int(m.group(2), 10))
        return NAMED_ENTITIES.get(m.group(3), m.group(0))
    i = 0
    while i < 3 and "&" in v:
        v = _ENTITY.sub(one, v)
        i += 1
    return v


def _compact(v: str) -> str:
    return re.sub(r"[\x00-\x20\x7f]+", "", decode_entities(v))


def is_safe_url(v: str, image: bool = False) -> bool:
    """true when the URL is allowed: no scheme and not //host, or http(s), mailto, tel; an image also data:image/*"""
    k = _compact(v)
    if re.match(r"^[/\\]{2}", k):
        return False
    m = re.match(r"^([a-zA-Z][a-zA-Z0-9+.\-]*):", k)
    if not m:
        return True
    scheme = m.group(1).lower()
    if scheme == "data":
        return image and bool(_DATA_IMAGE.match(k.lower()))
    return scheme in URL_SCHEMES


def _str(v: Any) -> str:
    return v if isinstance(v, str) else fmt_num(v) if _num(v) else ""


def url(v: Any, image: bool = False) -> str:
    """a URL attribute value: the value when allowed, else ''"""
    x = _str(v)
    return x if is_safe_url(x, image) else ""


def srcset_urls(v: str) -> list:
    """the URLs of a srcset, candidate by candidate"""
    x, out, i = decode_entities(v), [], 0
    n = len(x)
    ws = lambda c: c in "\t\n\f\r "  # noqa: E731
    while i < n:
        while i < n and (ws(x[i]) or x[i] == ","):
            i += 1
        if i >= n:
            break
        j = i
        while j < n and not ws(x[j]):
            j += 1
        u = x[i:j]
        cut = re.search(r",+$", u)
        if cut:
            out.append(u[: -len(cut.group(0))])
            i = j
            continue
        out.append(u)
        depth = 0
        while j < n and (depth > 0 or x[j] != ","):
            if x[j] == "(":
                depth += 1
            elif x[j] == ")":
                depth = max(0, depth - 1)
            j += 1
        i = j + 1
    return out


def srcset(v: Any) -> str:
    """a srcset value: the value when every candidate is an allowed image URL, else ''"""
    x = _str(v)
    return x if all(is_safe_url(u, True) for u in srcset_urls(x)) else ""


def style(v: Any) -> str:
    """a style value: '' when a url(...) is not an image URL or it holds a script form or a CSS escape, else the value"""
    x = _str(v)
    d, k = decode_entities(x), _compact(x).lower()
    if "\\" in d or re.search(r"expression\(|javascript:|vbscript:|-moz-binding|behavior:", k):
        return ""
    for m in re.finditer(r"url\(([^)]*)\)?", d, re.I):
        arg = re.sub(r"^(['\"])(.*)\1$", r"\2", m.group(1).strip(" \t\n\r\f\v"), flags=re.S)
        if not is_safe_url(arg, True):
            return ""
    return x


def css_value(v: Any) -> str:
    """a value of an inline style declaration (the css op): kept when plain (numbers, words, %, #, +, -, ., commas, spaces), else ''"""
    x = _str(v)
    return x if re.fullmatch(r"[-+.%#a-zA-Z0-9 ,]*", x) else ""


def is_safe_attr_name(name: str) -> bool:
    """an attribute name that may be printed: a valid name, not an event handler (on*)"""
    return bool(re.fullmatch(r"[a-zA-Z_:][-a-zA-Z0-9_:.]*", name)) and not re.match(r"on", name, re.I)


def attr_value(name: str, v: Any) -> Any:
    """the value of attribute name as it may be printed: URL, srcset and style checked"""
    n = name.lower()
    if n in ("srcset", "imagesrcset"):
        return srcset(v)
    if n == "style":
        return style(v)
    if n in URL_ATTRS:
        return url(v, n in IMAGE_ATTRS)
    return v


def t(v: Any) -> bool:
    """JS truthiness: None, False, 0, NaN and '' are false"""
    if v is None:
        return False
    if isinstance(v, bool):
        return v
    if isinstance(v, str):
        return v != ""
    if _num(v):
        return v != 0 and not math.isnan(v)
    return True


def n(v: Any) -> float:
    if _num(v):
        return float(v)
    if isinstance(v, bool):
        return 1.0 if v else 0.0
    if isinstance(v, str):
        try:
            return float(v.strip())
        except ValueError:
            return 0.0
    return 0.0


def _round_half_away(f: float) -> float:
    return math.copysign(math.floor(abs(f) + 0.5), f)


def i(v: Any) -> int:
    return int(_round_half_away(n(v)))


def eq(a: Any, b: Any) -> bool:
    """strict equality (===)"""
    if _num(a) or _num(b):
        return _num(a) and _num(b) and float(a) == float(b)
    if a is None:
        return b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, str):
        return isinstance(b, str) and a == b
    return False


def _cmp(a: Any, b: Any) -> int | None:
    if isinstance(a, str) and isinstance(b, str):
        return (a > b) - (a < b)
    if a is None or b is None:
        return None
    x, y = n(a), n(b)
    return (x > y) - (x < y)


def lt(a, b): c = _cmp(a, b); return c is not None and c < 0
def gt(a, b): c = _cmp(a, b); return c is not None and c > 0
def le(a, b): c = _cmp(a, b); return c is not None and c <= 0
def ge(a, b): c = _cmp(a, b); return c is not None and c >= 0


def add(a: Any, b: Any) -> Any:
    if isinstance(a, str) or isinstance(b, str):
        return s(a) + s(b)
    return n(a) + n(b)


def sub(a, b): return n(a) - n(b)
def mul(a, b): return n(a) * n(b)


def div(a: Any, b: Any) -> float:
    x, y = n(a), n(b)
    if y == 0:
        return math.nan if x == 0 or math.isnan(x) else math.copysign(math.inf, x) * math.copysign(1, y)
    return x / y


def and_(vs: list) -> Any:
    last = None
    for v in vs:
        if not t(v):
            return v
        last = v
    return last


def or_(vs: list) -> Any:
    last = None
    for v in vs:
        if t(v):
            return v
        last = v
    return last


def coalesce(vs: list) -> Any:
    return next((v for v in vs if v is not None), None)


def def_(v: Any, d: Any) -> Any:
    """a prop with its default: the default when the prop is None or missing"""
    return d if v is None else v


def l(v: Any) -> list:
    return v if isinstance(v, list) else []


def len_(v: Any) -> int:
    return len(v) if isinstance(v, str) else len(l(v))


def spread(base: Any, fields: dict) -> dict:
    out = dict(base) if isinstance(base, dict) else {}
    out.update(fields)
    return out


def str_(v: Any) -> Any:
    return None if v is None else s(v)


def has(v: Any) -> bool:
    return v is not None


def cnv(vs: list) -> str:
    return merge([s(v) for v in vs if t(v)])


def tpl(tmpl: Any, vals: list) -> str:
    return re.sub(r"\{(\d+)\}", lambda m: s(vals[int(m.group(1))]) if int(m.group(1)) < len(vals) else "", s(tmpl))


def _group(f: float, decimals: int) -> str:
    whole, _, frac = f"{abs(f):.{decimals}f}".partition(".")
    out = f"{int(whole):,}"
    frac = frac.rstrip("0")
    if frac:
        out += "." + frac
    if f < 0 and out != "0":
        out = "-" + out
    return out


def num(v: Any) -> str:
    return _group(n(v), 3)


_CURRENCY = {"USD": "$", "EUR": "\u20ac", "GBP": "\u00a3", "JPY": "\u00a5", "INR": "\u20b9", "CAD": "CA$", "AUD": "A$"}


def minor_digits(c: str) -> int:
    return 0 if c in ("JPY", "KRW") else 2


def money(amount: Any, currency: Any) -> str:
    """integer minor units (Codex v0.4: 1250 = 12.50) -> "$12.50"; whole amounts without the fraction"""
    c = s(currency)
    sym = _CURRENCY.get(c, c + "\u00a0")
    minor = int(_round_half_away(n(amount)))
    sign = "-" if minor < 0 else ""
    minor = abs(minor)
    d = minor_digits(c)
    whole, rest = divmod(minor, 10 ** d)
    out = sign + sym + _group(float(whole), 0)
    if d and rest:
        out += "." + str(rest).zfill(d)
    return out


def at(d: Any, key: Any) -> str:
    v = get(d, [s(key)])
    return s(v) if v is not None else s(key)


def page_window(page_v: Any, pages_v: Any) -> list:
    page, pages = int(n(page_v)), int(n(pages_v))
    keep = {x for x in (1, pages, page - 1, page, page + 1) if 1 <= x <= pages}
    out: list = []
    prev = 0
    for x in range(1, pages + 1):
        if x not in keep:
            continue
        if x - prev > 1:
            out.append(None)
        out.append(x)
        prev = x
    return out


def fit_cols(cols_v: Any, n_v: Any) -> str:
    cols, cnt = s(cols_v), int(n(n_v))
    m = re.fullmatch(r"(-?\d+)-(-?\d+)", cols)
    if not m:
        return cols
    lo, hi = int(m.group(1)), int(m.group(2))
    if cnt >= hi:
        return cols
    known = {"1-2", "1-3", "1-4", "2-3", "2-4", "2-6", "3-6"}
    for k in range(max(lo, cnt), lo, -1):
        if f"{lo}-{k}" in known:
            return f"{lo}-{k}"
    return str(min(max(cnt, 1), lo))


def uniq(v: Any) -> str:
    parts = s(v).split(", ")
    return ", ".join(p for idx, p in enumerate(parts) if idx == 0 or p.lower() != parts[idx - 1].lower())


def words(v: Any) -> list: return s(v).split(" ")
def nbsp(v: Any) -> str: return s(v).replace(" ", "\u00a0")


def nth(lst: Any, idx: Any) -> Any:
    xs, k = l(lst), int(n(idx))
    return xs[k] if 0 <= k < len(xs) else None


def range_(c: Any) -> list: return list(range(max(0, int(n(c)))))
def max_(vs: list) -> float: return max([-math.inf] + [n(v) for v in vs])
def min_(vs: list) -> float: return min([math.inf] + [n(v) for v in vs])
def round_(v: Any) -> float: return float(math.floor(n(v) + 0.5))


def count(items: Any, f: Any) -> int:
    return sum(1 for it in l(items) if t(get(it, [s(f)])))


def where(items: Any, f: Any, value: Any) -> list:
    if not t(value):
        return l(items)
    return [it for it in l(items) if eq(get(it, [s(f)]), value)]


def match(items: Any, f: Any, query: Any) -> list:
    if not t(query):
        return l(items)
    q = s(query).lower()
    return [it for it in l(items) if q in s(get(it, [s(f)])).lower()]


def pick(items: Any, ident: Any) -> Any:
    return next((it for it in l(items) if eq(get(it, ["id"]), ident)), None)


def sum_by(items: Any, a: str, b: str) -> float:
    return sum((n(get(it, [a])) * n(get(it, [b])) for it in l(items)), 0.0)


def first_of(items: Any, f: str) -> Any:
    xs = l(items)
    if not xs:
        return ""
    v = get(xs[0], [f])
    return "" if v is None else v


def max_by(items: Any, f: str) -> float:
    return max([0.0] + [n(get(it, [f])) for it in l(items)])


def css(triples: list) -> str:
    return ";".join(s(triples[k]) + ":" + css_value(triples[k + 1]) + s(triples[k + 2]) for k in range(0, len(triples) - 2, 3))


def _compound_hits(c: dict, pick_: Any) -> bool:
    return all(pick_(k) in str(w).split("|") for k, w in c.items() if k != "class")


def recipe(path: str, sel: dict) -> str:
    """the class string of a recipe table for a selection (organisms: base, each key, the matching compounds)"""
    r = load_json(path)

    def pick_(k: str) -> str:
        v = s(sel.get(k)).strip()
        return v or str((r.get("defaults") or {}).get(k, "")).strip()

    parts = [str(r.get("base", ""))]
    parts += [str((r.get("byKey") or {}).get(k, {}).get(pick_(k), "")) for k in r.get("keys", [])]
    parts += [str(c.get("class", "")) for c in r.get("compound", []) or [] if _compound_hits(c, pick_)]
    return merge([p.strip() for p in parts if p.strip()])


def preset(path: str, keys: list) -> Any:
    return get(get(load_json(path), ["values"]), keys)


def attrs(kv: list) -> dict:
    """free DOM attributes from (name, value) pairs, as React prints them"""
    out: dict = {}
    for k in range(0, len(kv) - 1, 2):
        name, v = s(kv[k]), kv[k + 1]
        if v is None or not is_safe_attr_name(name):
            continue
        if not isinstance(v, bool):
            v = attr_value(name, v)
        if isinstance(v, bool):
            if name.startswith("data-") or name.startswith("aria-"):
                out[name] = s(v)
            elif v:
                out[name] = True
            continue
        out[name] = s(v)
    return out


def attr_html(a: Any) -> str:
    """an attribute map as markup: ` name="value"`, a bare name for True, nothing for None and False"""
    if not isinstance(a, dict):
        return ""
    out = ""
    for k, v in a.items():
        if v is None or v is False or not is_safe_attr_name(str(k)):
            continue
        name = str(k)
        out += f" {name}" if v is True else f' {name}="{html.escape(s(attr_value(name, v)), quote=True)}"'
    return out


# ------------------------------------------------------------------ bricks (expr.go, utils.go, tags.go)

def is_set_str(v: Any) -> bool: return s(v).strip() != ""


def default_if_empty(v: Any, fallback: str) -> str:
    x = s(v).strip()
    return x or fallback


def map_or(v: Any, mapping: dict, fallback: str, lower: bool = False) -> str:
    x = s(v).strip()
    if lower:
        x = x.lower()
    return str(mapping[x]) if x in mapping else fallback


def int_map_or(v: Any, mapping: dict, fallback: str) -> str:
    k = i(v)
    return str(mapping[k]) if k in mapping else fallback


def bool_str(v: Any) -> str: return "true" if t(v) else "false"
def concat_trim(parts: list) -> str: return "".join(s(p).strip() for p in parts)
def cn(parts: list) -> str: return merge([s(p) for p in parts])


def compose(path: str, selection: dict, extra: list) -> str:
    """the brick class contract: recipe base, the selected variants (defaults for empty), compounds, then the tail"""
    r = load_json(path)
    defaults = r.get("defaults") or {}

    def pick_(k: str) -> str:
        c = s(selection.get(k)).strip()
        return c or str(defaults.get(k, "")).strip()

    parts = [str(r["base"]).strip()] if str(r.get("base", "")).strip() else []
    for key in r.get("keys", []):
        choices = (r.get("byKey") or {}).get(key)
        if choices is None:
            continue
        choice = pick_(key)
        if not choice:
            if choices:
                raise ValueError(f"[compose] missing default for key {key}")
            continue
        if str(choices.get(choice, "")).strip():
            parts.append(str(choices[choice]))
    for c in r.get("compound", []) or []:
        if _compound_hits(c, pick_) and str(c.get("class", "")).strip():
            parts.append(str(c["class"]))
    return cn(parts + list(extra))


def resolve_tag(tag: Any, fallback: str, allowed: list) -> str:
    x = s(tag).strip().lower()
    return x if x and x in allowed else fallback


def title_tag(level: Any) -> str:
    k = i(level)
    return f"h{k}" if 1 <= k <= 6 else "h2"


def lucide(name: Any) -> str:
    """the inner markup of a Lucide glyph: its nodes with attributes in name order (circle for an unknown name)"""
    icons = load_json("icons/lucide-icons.json")["icons"]
    nodes = icons.get(s(name)) or icons["circle"]
    out = ""
    for tag, a in nodes:
        out += "<" + tag + "".join(f' {k}="{html.escape(str(a[k]), quote=True)}"' for k in sorted(a)) + "></" + tag + ">"
    return out
