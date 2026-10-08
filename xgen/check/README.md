# @ui8kit/xgen-check

Checks: schema, props, variants, a11y, drift (packages and apps), coverage, portability contract, text and Cyrillic.

Part of xgen (see `../README.md`). Self-contained: depends only on other `@ui8kit/xgen-*` packages. Tests: `bun test`.

## API

`runChecks(workspace)` runs: `schema`, `props`, `a11y`, `authored`, `coverage`, `recipes`, `nonportable`, `text`, `blocks`, `registry` (the 92 layouts of the reference catalog), `themes`, `structure` (file and line limits, import cycles, package order, the core names no app), `hardcode` (no arbitrary size, hex or palette color in organisms), `dead` (fixtures, organisms, dictionary keys, untested blocks), `duplicates`, `versions`, `tests`, `drift`; each returns `{ name, what, problems }`. The limits are in `src/audit-rules.ts`.
`runE2e(workspace)` serves both built demos, runs one scenario in Chrome (playwright-core, `CHROME` env or `/usr/bin/google-chrome`), writes screenshots to `shots/` and compares the DOM. `XGEN_E2E_ONLY=<prefix>,<prefix>` limits it to the apps whose names start with one.
