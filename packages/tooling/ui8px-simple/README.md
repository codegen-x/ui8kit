# ui8px gate of the simple line

`bun run lint:px:simple` lints the simple line (blocks with `"line": "simple"`: HeroSimple, TeamSimple) under the shared
`ui8kit` preset of [ui8kit/ui8px-cli](https://github.com/ui8kit/ui8px-cli) (the root devDependency `ui8px@^0.3.0` from
npm, as ui8kit/prototypes; the workspace gate runs the same version). The rest of the workspace keeps its own policy and gate
(`bun run lint:px`, `.ui8px/policy` at the root); this gate does not change it.

What it lints: the React DOM of every gallery variant of the line × every `align` value (`start`, `center`, `end`), as
the builder gets it, primitives included (React is the reference; the parity suites hold the other seven runtimes to the
same DOM). Blocking: UI8PX001 (off the 8+4 grid), UI8PX002 (unknown utility), UI8PX003 (denied: `text-left` /
`text-right` under any modifier, raw palette colours), UI8PX005 (unknown `ui-*`). UI8PX004 (conflicts) is not blocking.

## Local deltas (`.ui8px/policy`)

Every file is `"extends": "ui8kit"`. The only local delta:

| File | Delta | Why |
| --- | --- | --- |
| `scopes.json` | `extract/controls/**` is the control scope (4px steps), the rest `extract/**` layout (8px) | ui8px scopes by file; the gate writes the own classes of the kit's control primitives (`data-slot` button, badge, …) to `extract/controls/`, as the workspace gate scopes `specs/ui/button.*`. The preset's scopes are a generic `src/**` layout. |

Anything else a simple block needs belongs in the preset (ui8kit/ui8px-cli `src/policy/presets/ui8kit.ts`), not here.
