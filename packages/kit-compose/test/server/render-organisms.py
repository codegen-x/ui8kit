"""Organism parity harness (Jinja2): argv[1] = installed kit (packages/kit/jinja2/src), argv[2] = kit-compose root (packages/kit-compose/jinja2/src).
stdin [{"template": "blocks/hero.html.j2", "p": {...}, "children"?: "a plain string"}] -> stdout JSON list of HTML (a failure is "ERROR: <message>")."""

import json
import sys

sys.path.insert(0, sys.argv[1])
sys.path.insert(0, sys.argv[2] + "/compose")
sys.path.insert(0, sys.argv[2])

from compose_env import environment  # noqa: E402
from compose_organisms import register  # noqa: E402

env = register(environment(sys.argv[1]), sys.argv[2])
out = []
for r in json.load(sys.stdin):
    try:
        out.append(env.get_template(r["template"]).render(p=r.get("p") or {}, **({"children": r["children"]} if "children" in r else {})))
    except Exception as e:  # noqa: BLE001
        out.append(f"ERROR: {type(e).__name__}: {e}")
sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
