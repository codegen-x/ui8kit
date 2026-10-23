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
