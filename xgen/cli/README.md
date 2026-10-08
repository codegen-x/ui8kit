# xgen

The xgen command: build, check, list.

Part of xgen (see `../README.md`). Self-contained: depends only on other `@ui8kit/xgen-*` packages. Tests: `bun test`.

## Usage

```
xgen build   # regenerate packages and apps
xgen check   # fail on any problem, including drift
xgen e2e     # both demos, same scenario, screenshots, DOM pair test
xgen list    # counts, targets, hand-written files per app
```
