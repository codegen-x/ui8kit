"""Server parity harness (Jinja2): argv[1] = installed kit (packages/kit/jinja2/src), argv[2] = compose root (packages/kit-compose/jinja2/src).
stdin [{"template": "compose/stack.html.j2", "p": {...}, "children": "Content"}] -> stdout JSON list of HTML."""

import json
import sys

sys.path.insert(0, sys.argv[1])
sys.path.insert(0, sys.argv[2] + "/compose")

from markupsafe import Markup  # noqa: E402

from compose_env import environment  # noqa: E402

env = environment(sys.argv[1])
out = [env.get_template(r["template"]).render(p=r.get("p") or {}, children=Markup(r.get("children") or "")) for r in json.load(sys.stdin)]
sys.stdout.write(json.dumps(out, ensure_ascii=False) + "\n")
