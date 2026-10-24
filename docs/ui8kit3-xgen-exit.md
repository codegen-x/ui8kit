# Leaving xgen/: what kit-compose organisms still take from it, and where it moves

Status 2026-10-24: `packages/kit-compose/src/organisms.ts` (and its gate) imports xgen code and reads xgen specs. Before the
step that deletes `xgen/` (and `vendor/codegen`), everything below moves into codegen-x-owned code. Target: one package
`packages/compose-gen` (generator: specs, loader, view walker, emitters, case table), consumed by `packages/kit-compose`.

## Dependencies today

| Taken from | What | Size | Move to |
| --- | --- | --- | --- |
| `xgen/specs/{organisms,parts,patterns}` | 243 organism specs (224 portable) | JSON | `compose-gen/specs/organisms/...` (as is) |
| `xgen/specs/{blocks,recipes,presets,screens}` | gallery blocks (case table), organism recipes, frame presets, screens (next steps) | JSON | `compose-gen/specs/...` |
| `xgen/specs/assets/lucide-icons.json` | glyph registry (symlink into vendor/codegen) | JSON | `compose-gen/specs/assets/` (copy, ISC notice kept) |
| `xgen/specs/ui` (symlink into vendor/codegen) | v2 brick specs: only the prop tables (PartRef) the emitters use to name props | JSON | derived from `kit-compose/src/map.ts` + recipes + the v3 primitive specs (`specs/primitives.json` of @ui8kit/registry): no v2 brick spec left |
| `xgen/content`, collections, taxonomies | dictionary + data of the gallery cases | JSON | `compose-gen/content/` |
| `xgen/schema` (`@ui8kit/xgen-schema`) | JSON schemas + paths for the loader | ~500 lines | `compose-gen/src/schema` (organism/block/preset/recipe schemas only) |
| `xgen/spec`, `xgen/screens` (`loadSpecs`, `loadInputs`, `indexParts`, `tierDir`, `fileName`, printing of values/ops) | loader, op printer (32 ops), validation | ~1650 lines | `compose-gen/src/{load,print}` |
| `xgen/runtimes/core` (`walkNodes`, `emitPreset`, ts helpers in `assets/ts`) | view walker shared by all emitters, presets, expression helpers | ~1550 lines | `compose-gen/src/core`, helpers to `kit-compose/src/assets/ts` |
| `xgen/runtimes/{react,svelte,vue,solid}` (`emitOrganism`) | organism emitters (JS) | ~3000 lines | `compose-gen/src/emit/<runtime>` |
| `xgen/runtimes/{twig,templ,jinja2,latte}` (batch 2) | organism emitters (servers), server helpers | ~1650 lines + php/py/go helpers | `compose-gen/src/emit/<runtime>`, helpers to `kit-compose/<runtime>/src/organisms-runtime` |
| `xgen/check/src/templ/{blocks,normalize}` (tests) | gallery case table, DOM normalizer of the gates | ~250 lines | `compose-gen/src/cases.ts`, `kit-compose/test/normalize.ts` |

Not taken: xgen app scaffolds, hosts, drift/manifest, rules audit, legacy packages/<runtime>/ui (removed with xgen).

## Order

1. Batch 2 (server organisms) is written against the same interfaces, so it moves with the rest.
2. Copy the code into `compose-gen` unchanged (paths and imports only), switch kit-compose to it, gate: generated output
   byte-identical before/after (the organism parity gate stays 0 diffs).
3. Replace the v2 brick prop tables by the kit-compose description (PartRef from map.ts); gate: byte-identical again.
4. Drop what no step uses (app scaffolds, v2 brick emitters), then blocks, screens, hosts on compose-gen.
5. A check that fails on any import of `xgen/` or `@ui8kit/xgen-*` from `packages/kit-compose` and `packages/compose-gen`;
   only then the deletion step.

## Status (branch ui8kit3)

| Step | Commit | Gate |
|---|---|---|
| copy into `packages/compose-gen`, kit-compose switched | 655a18ea | JS organisms byte-identical (224 x 4) |
| PartRef from kit-compose (`compose-gen/parts.ts`: map.ts + recipes + v3 `specs/primitives.json`), `specs/ui` dropped | 55d104ff | byte-identical; every organism view validated against it; authored specs drift check (`compose-gen/check.ts`) |
| batch 2: Jinja2 / Twig / Latte / templ organisms (`kit-compose/src/server-organisms.ts`) | 79bc252e, c076e339, 557d132e, 5b21adcd | real engines = React on 474 block cases each, html-validate + axe |
| drop the v2-only pieces (server parity harnesses, v2 LucideIcon assets, go-harness, jinja2/latte re-export stubs); banners name compose-gen | this step | all checks + kit-compose suite green |
| `packages/tooling/bin/xgen-exit-guard.mjs` (in `bun run check`): no import / require / path into xgen from kit-compose or compose-gen; the styles copy mirrors `xgen/runtimes/core/assets/styles` until the deletion | this step | guard green, probe file with 3 kinds of reference fails it |

Organism helpers of the server runtimes are their own namespace (`og_*`; Python `compose_organisms`, PHP `CodegenX\Organisms\*`,
Go `orgutils`), so they never shadow the `ui_*` / `ui8kit_*` helpers of the installed kit.
Still on xgen (outside kit-compose / compose-gen): the skins generator (`xgen/skins`, writes the styles), the gallery/screen
hosts and the legacy `xgen check`. App scaffolds stay in compose-gen until the hosts step decides what it keeps.
