# @ui8kit/xgen-schema

JSON Schemas of xgen (spec, variants, organism, screen, app, collection) and a validator over them.

Part of xgen (see `../README.md`). Self-contained: depends only on other `@ui8kit/xgen-*` packages. Tests: `bun test`.

## Codex v0.4 manifest of the fixtures

`codex/manifest.json` describes every entry kind of `xgen/fixtures` (one resource per kind; money fields carry the rule `fastygo.codex/money` = integer minor units next to `currency`; dates are `datetime`, RFC 3339). Regenerate with `bun run codex:manifest`; `test/codex.test.ts` fails when it is stale. `bun run codex:validate [path to ui8kit/contract]` runs the `@ui8kit/contract` v0.4 validator over all fixtures with this manifest (the 0.2.0 contract is read from a checkout until it is published). The UI formats the raw values: money through `fmtMoney(minor, currency)`, dates through field-path pipes (`metadata.date.value|date`, `|ago`, `|ago-days`, `|ago-short`) in `fromCodex`.
