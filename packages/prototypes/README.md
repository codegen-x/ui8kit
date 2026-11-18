# packages/prototypes

The prototypes of the **simple line** (blocks with `line: "simple"` and a content `model`, see
`packages/compose-gen/specs/models`). The clean organisms of compose-gen are the source of truth (page-only, 8 runtimes,
registry); this package derives a prototype from each one and writes `out/`. It depends on compose-gen, never the reverse.

- `src/project.ts`: the projection, IR to IR. The prototype is the clean view plus a prop `mode` (`"wireframe" | "page"`,
  default wireframe). A place is a node that draws a field of the model (Title, Text, Badge, the action link, a MediaFrame).
  In the wireframe it is a shape; in page mode it is the clean node with `data-place` and `data-field` (a JSON pointer:
  `/title`, `/members/2/title`). A branch that waits for content is drawn in the wireframe; a loop over a list field draws
  three placeholders there.
- `src/shapes.ts`: the shapes (heading, text, badge, action), a Box with a token background and an 8+4 height, `aria-hidden`.
  Pictures stay a MediaFrame without a `src` (the built-in placeholder) with `data-shape`.
- `src/contract.ts`: `out/contracts/<item>/1.json` (item, model and schema URL, axes, variants, settings, modes, places) and
  `out/contracts/v0.json`.
- `src/driver.ts`: writes `out/` (`bun packages/prototypes/src/driver.ts`, part of `bun run build`); `--check` fails on any
  drift (part of `bun run check`).

## out/

| path | what |
| --- | --- |
| `svelte/blocks/<item>.svelte` | the prototypes (Svelte 5) |
| `svelte/shapes/` | the shapes and the MediaFrame copy that carries a place |
| `svelte/compose/`, `svelte/utils/` | the compositions and helpers they import, copied from kit-compose; kit imports as `@ui8kit/kit/ui/*`, `@ui8kit/kit/utils` |
| `svelte/index.ts` | the exports |
| `contracts/` | the contracts |
| `models/` | `<id>@<v>.schema.json` (JSON Schema 2020-12), `<id>@<v>.ts` (types, the model, `validate<Type>()`), `validate.ts` |
| `manifest.json` | sha256 of every file and of the inputs; no timestamps and no commit (the consumer pins the commit: ui8kit/prototypes `codegen.lock.json`) |

`test/prototypes.test.ts`: the places cover the model; page mode without `data-place`/`data-field` renders the same DOM as
the clean block on every gallery case; the wireframe has no words and three members; the clean outputs of all 8 runtimes carry
no `mode`, `data-place`, `data-field`, `data-shape` or `data-testid`; `out/` is the fresh build.
