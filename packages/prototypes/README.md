# packages/prototypes

The prototypes of the **simple line** (blocks with `line: "simple"` and a content `model`, see
`packages/compose-gen/specs/models`). The clean organisms of compose-gen are the source of truth (page-only, 8 runtimes,
registry); this package derives a **wireframe** from each one (rectangles only) and writes `out/`. It depends on compose-gen,
never the reverse. No clean block, composition or recipe ships with a prototype: a builder that needs the real block takes it
from the registry.

- `src/project.ts`: the projection, IR to IR. A place is a node that draws a field of the model (Title, Text, Badge, the action
  link, a MediaFrame); it becomes its shape with `data-place` and `data-field` (a JSON pointer: `/title`, `/members/2/title`)
  for the builder's inspector. A branch that waits for content is drawn; a loop over a list field is unrolled into one
  placeholder per column of the variant (the members past the smallest count sit in a `when` on the axis; no column axis: three). The layout compositions (Block, Container, Box, Stack, List, ListItem, Card, and Link: a plain `div` whose address joins the fields of the places inside it) are lowered onto the kit `Box`
  with plain layout classes (a Stack also gets `w-full`: a wireframe has no intrinsic width, so a column the clean block lets shrink to its content would draw its fraction-wide bars at 0); anything else fails the build. The props are the layout axes of the block and the `padding`
  and `align` settings (align: `start` | `center` | `end`, logical items-* / text-*, `ShapeText align`); a wireframe takes
  no content and names no landmark. Derived values of the clean organism are inlined. A picture of a list member is an avatar only when the clean MediaFrame is a disc (`rounded-full` or `size-*`); else a media rectangle. The alt text of a picture read from a `title` field joins the picture place only when no other place draws that field (logos-simple).
- `src/shapes.ts`: the shapes (heading, text, badge, action, media, avatar; the action in two tones: `cta-primary` for the first action, `cta-secondary` for the second, from the button variant of the clean block); the media shape fills its half of a split (`fill: half`: no rounding, `md:aspect-auto md:h-full`) when the clean MediaFrame is `rounded-none md:h-full`: a kit `Box` with a token background and an 8+4
  height, `aria-hidden`, with `data-shape` / `data-role` / `data-slot` hooks for per-element theme tokens.
- `src/contract.ts`: `out/contracts/<item>/1.json` (item, model and schema URL, axes, variants, settings, modes, places) and
  `out/contracts/v0.json`.
- `src/driver.ts`: writes `out/` (`bun packages/prototypes/src/driver.ts`, part of `bun run build`); `--check` fails on any
  drift (part of `bun run check`). It fails if an emitted file imports anything but `svelte`, `@ui8kit/kit/ui/box/Box.svelte`
  and `cn` from `@ui8kit/kit/utils`.

The simple line today: hero-simple (hero@1), split-simple (split@1), team-simple (team@1), intro-simple (intro@1),
gallery-hero (gallery@1), features-simple (features@1), stats-simple (stats@1), stories-simple (stories@1), photos-simple
(photos@1), testimonials-simple (testimonials@1), logos-simple (logos@1), faq-simple (faq@1), steps-simple (steps@1).

## out/

| path | what |
| --- | --- |
| `svelte/blocks/<item>.svelte` | the wireframes (Svelte 5) |
| `svelte/shapes/shape-*.svelte` | the shapes |
| `svelte/index.ts` | the exports |
| `registry.ts` | `CONTRACTS` (every contract, manifest order), `CATEGORIES` (item -> catalog category = the model id: `hero@1` -> `hero`), `MODELS` (`id@version` -> spec + `validate()`); no `.svelte` import, so node loads it |
| `catalog.ts` | `CATALOG`: item -> wireframe component, and each wireframe exported by its organism name (`HeroSimple`, …) |
| `models/index.ts` | the content types of every model |
| `classes.json` | the shared class strings: the role table (`ROLE`, shapes.ts), Stack `align` / `justify`, `textAlign` (the `align` setting on text: `text-start` / `text-center` / `text-end`), the `padding` presets and the container; ui8kit/prototypes builds its hand-written `classes.ts` from it (one source) |
| `contracts/` | the contracts |
| `models/` | `<id>@<v>.schema.json` (JSON Schema 2020-12), `<id>@<v>.ts` (types, the model, `validate<Type>()`), `validate.ts` |
| `manifest.json` | sha256 of every file and of the inputs; no timestamps and no commit (the consumer pins the commit: ui8kit/prototypes `codegen.lock.json`) |

`test/prototypes.test.ts`: the places cover the model; every place of a contract has its shape in the wireframe (and every
`data-field` is a pointer of the contract) on every gallery case; the wireframe has no words and one member per column of the variant (`countAxis`: the one whole-number axis, team-simple `cols`, gallery-hero `count`; else `WIRE_ITEMS` = 3), each member picture drawn once per member; `out/` is
exactly the files above and imports only svelte and the kit; the clean outputs of all 8 runtimes carry no `data-place`,
`data-field`, `data-shape` or `data-testid`; the padding presets, every `align` value, the width of the team list and the action link are checked
on the wireframe and on the clean kit-compose block; `out/` is the fresh build.
