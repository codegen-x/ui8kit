# stock

A hand-written app (not generated): a stock-site storefront over the repository's kit blocks (every variant) and the composed screens made of them.
Svelte 5 + Vite + Tailwind 4, hash router (`src/lib/route.ts`), base `/stock/` (`STOCK_BASE=/` on Vercel: the routes are hashes, so
both work).

    bun run dev          # http://127.0.0.1:5187/stock/
    bun run build        # vite build to dist/ (preview: bun run preview, port 5188)
    bun run check        # svelte-check
    bun run test         # unit tests (also part of the root bun run test)
    bun run index        # rebuild the index: content/assets.v0.json, content/previews.v0.json, content/install.v0.json, content/variants.v0.json, content/props.v0.json, src/lib/collections.gen.ts
    bun run index:check  # fail when the committed index differs from a fresh build (deterministic: same inputs, same digest)

## Index (S1)

`scripts/build-index.ts` (logic in `scripts/lib/build.ts`) reads the facet vocabulary `content/facets.v0.json` and the specs:
`packages/compose-gen/specs/blocks` (112 blocks, 532 variants, axes, samples), `packages/compose-gen/schema/codex/blocks.json` (data/kind/
record and label props: the slots), `specs/organisms` (runtimes) and `specs/screens` (one asset per page of a composed screen). Two
categories: **Blocks** (one asset per variant; the variants of a block share a collapse key) and **Screens** (the 80 pages of the
composed screens, each made of kit blocks only; checked by a test). An organism is shown through the block variants that draw it
(directly or nested in another organism); one no block draws would be an asset of its own (none today). Skins, the corner radius and
the light/dark theme are preview settings, not assets or facets. The 146 taste screens are not part of Stock.

The vocabulary is data: every facet with its order, UI, scope, source, values, synonyms, labels in en, fr, de, es, ru (ids stay English)
and the derivation rules of its values (`any` / `not` clauses over block, group, theme, axes, slots, Codex records, fields and label
props, screen, area and earlier facets). **No fallback values**: an asset no rule matches has no label for the facet ("no label", never
counted). `draft: true` marks the facets whose labels come from hand-written tables or are weak (not reviewed by a person): job,
composition, media, slots, role, character, mood, industry; the storefront shows a draft badge on them. Industry is soft: it ranks,
never filters. The composition pattern (`pattern`) has its vocabulary in one file, `content/terms/pattern.v0.json` (brain-term/v1: the 9
`pattern:*` nodes of the brain graph plus z-pattern, f-pattern, modular-grid, golden-canon; labels in five languages; a status per
term; definitions in five languages). "Built from block" (`blocks`, screens only) is computed: the kit blocks of the page, its frame
and its area, one value per block spec named as the catalog names the block (English, like every asset title). `modular-grid` is computed from the spec (`scripts/lib/pattern.ts`: the root Grid of the variant is one repeated module, no
span, three or more equal columns); every other value comes from the hand-written table `content/pattern-map.v0.json` and is a draft
(per-value badge). The builder hides a facet that does not discriminate (no labels: mood; the same labels everywhere: runtime) and a value
no asset carries (`index.hidden` names both). Each asset lists its `weak` facets and the `missing` ones; the labelling state facet
(`markup`) is derived from them.

## Install (code on Buildy)

Every block variant names its registry item (`registry` on the asset: the kebab name of the organism that draws it, so `hero` variants
with `chrome=nav` are `hero-prompt`). `content/install.v0.json` (built with the index by `src/lib/install.ts`, plain JSON, English keys,
meant to be served as is later, e.g. by an MCP server) holds one install object per registry block (`blocks`) and per screen page
(`screens`, by asset id: the blocks of the page, each once, in page order):

    { "registry": "https://registry.buildy.tw",
      "items": [{ "name": "dish-bento", "docs": "https://ui.buildy.tw/blocks/dish-bento/" }],
      "commands": { "svelte": "npx ui8kit add dish-bento --framework svelte", "react": "...", "...": "..." } }

The detail page shows a runtime select, the command with a copy button and the showcase page on ui.buildy.tw (new tab). The names
are checked against a snapshot of the registry's blocks (`scripts/fixtures/registry-blocks.json`, from
`https://registry.buildy.tw/react/index.json`; refresh it when the registry gains blocks) in `scripts/install.test.ts`.

## Variant presets

`content/variants.v0.json` (built with the index by `src/lib/variants.ts`, plain JSON, English keys) says how to draw each variant
Stock shows: `items` by registry name, each with the catalog block, its organism, axes, defaults, `defaultVariant` and `variants` by
id (the asset id, the axes the variant sets, the organism props). The props are the gallery's layers without the sample content:
axis defaults < variant axes < variant props; draw a variant with your content under them (`mergeProps(content, props)`). Texts are
dictionary references `{ "$": "ui.<key>" }`, `{ "$": "<as>" }` names the data collection the block reads. `digest` is the sha256 of
the file without it. The data is the block specs (`packages/compose-gen/specs/blocks`, stored from the gallery authoring), no table of
its own; `scripts/variants.test.ts` checks one entry per block variant, the names against the registry snapshot, and that sample
content under the props equals what the gallery draws (`blockProps` of compose-kit.ts).

    { "version": "0", "digest": "sha256:...", "registry": "https://registry.buildy.tw",
      "items": { "feature-grid": { "block": "features", "spec": "block.features", "organism": "FeatureGrid",
        "axes": { "layout": ["grid", "rows"], "cols": ["1-2", "1-3", "1-4"], "...": "..." },
        "defaults": { "layout": "grid", "cols": "1-3", "...": "..." }, "defaultVariant": "grid",
        "variants": { "cells4": { "asset": "block.features/cells4", "set": { "cols": "1-4", "item": "cell", "density": "compact" },
          "props": { "layout": "grid", "cols": "1-4", "item": "cell", "mediaSide": "end", "tone": "default", "density": "compact",
            "action": { "label": { "$": "ui.site.home.featuresAction" }, "href": "#/" } } } } } } }

## Props schemas

`content/props.v0.json` (built with the index by `scripts/lib/props.ts`) holds one JSON Schema (draft 2020-12) per organism of the
organism tier (117, the blocks of the registry), under its registry name, generated from the props and records of
`packages/compose-gen/specs` (the spec every runtime file comes from, so one schema serves the 8 runtimes). Each item is
`{ organism, events, slots, schema }`; the schema is self-contained (`$defs` holds the records and value kinds it uses), so
`ajv.compile(items[name].schema)` validates the props of a page-spec. Values are spec values: a text is a string, `{ "$": "ui.<key>" }`
or a field of the data; a record may also be a dictionary group (`labels`); lists, records and TrustedHtml may be the data the block
reads (`{ "$": "<as>" }` or a data operation of `OPS`). Axes are string enums; a text that reaches `LucideIcon` is one of the glyphs
the kit ships (`$defs.lucideIcon`). Closed: `additionalProperties: false` on the props and every record, like the generated
TypeScript types; required = `required: true` props and record fields without `optional`. Events and render-prop slots are listed
beside the schema, not in it. `scripts/props.test.ts` validates all 532 variants (sample content under the props, and the preset
alone without required lists), negative cases, and the prop names and required ones against the svelte, react and templ files.

## Search (S2)

The engine is the package `@ui8kit/facet-search` (`packages/facet-search`): `prepare(index)` once, then `search(engine, state)`, a
pure function: OR within a facet, AND across facets, disjunctive counts, word-prefix text search (labels in every locale included),
sorts, `relaxations()` for a zero result, `paginate()`; the canonical URL `#/search?q=…&job=hero,pricing&density=airy&spec=…&variants=all&sort=name&page=2`.
`src/lib/search.test.ts` runs it on the real index.

## Storefront (S3)

The app only assembles (ADR-0001, layer 3): the structure is `@ui8kit/layouts` (`packages/layouts/src/stock`: frame, header, type
tabs, quick filters, facet column, applied chips, sort, card grid, asset card, preview frame, pagination, Theme sheet), the engine is
`@ui8kit/facet-search`, and `src/App.svelte` wires them to the index, the route, the language and the Theme. `src/lib/view.ts` turns
the engine's outcome into the view models of the layouts (tested in `view.test.ts`).

- **Pages, not an endless feed**: 24 cards per page, `page=` in the URL; each card is keyed, so a page change unmounts every card and
  its live render. Inside a page a preview mounts when its frame comes near the viewport.
- **Live previews**: a card renders the real block variant (or the composed screen page) from `content/previews.v0.json` through
  `@ui8kit/layouts/preview` (organisms of `@codegen-x/svelte-compose` by name, props merged as compose-gen does, Codex data through
  `@ui8kit/app-shared`), drawn at desktop width (the window, when narrower) and scaled into a 16:10 frame.
- **Theme**: the global theme model `@ui8kit/theme-model/global-theme` (shared with the Magazine; stored under `stock:v1:theme`): mode, skin,
  font, radius, density, applied to the document root, so every preview follows it.
- **Languages**: en, fr, de, es, ru (`content/i18n/<locale>.json` and `locales.json`, data); the switch is in the header and is kept on
  this device. Ids and URL parameters stay English; block titles are the kit dictionary's (English).

## Detail page (S4, public)

`#/asset/<asset id>` (`block.hero/centered`, `screen.site/home`); every card title on the storefront links to it.
`src/Detail.svelte` assembles `@ui8kit/layouts/stock/detail` (named `ui8-*` classes, `styles/detail.css`) with `src/lib/detail.ts`
(pure, tested in `detail.test.ts`):

- **Preview**: the live render in a device frame, switchable between 1280, 768 and 390 px (the widest that fits the window first)
  and between light and dark (the Theme's mode: the shared Theme sheet works here too). The frame is a document of its own
  (`#/frame/<id>`, the bare render, loaded in an iframe by `@ui8kit/layouts/preview/device`), so the kit's breakpoints see the
  device's width; it reads the Theme the page keeps on this device and follows it (storage events), never writes it.
- **Passport**: a screen page's blocks and their variants, in page order (from the preview recipes); a block variant's sibling
  variants and the screen pages that use the block. Then every facet of the asset's type with its labels, read-only (labelling is
  the cabinet's): a draft badge on weak labels, `any` for a wildcard, an explicit "no label" where nothing applies (no fallback).
- **Similar**: four cards of the same type, one per block or screen, ranked by the facet values they share (a block's layout
  counts 10), then by catalog order: deterministic.

Not in the public version: the per-runtime code and the Dataset (members with a role; implemented separately later). The build
holds neither: `scripts/public-build.test.ts` builds Stock as Vercel does and fails on any source of the 8 runtimes (sampled lines of
their generated blocks, generator headers, template syntax), on files other than the page, scripts, styles and fonts, and on
`?raw`/`?url` or other-runtime imports in the app and the layouts. Stock is a static app: whatever its build holds is public.

Steps of the plan: S0 the frame; S1 the index; S2 the search engine; S3 the storefront on `@ui8kit/layouts`; S4 the public detail page.
