# stock

A hand-written app (not generated): a stock-site storefront over the repository's kit blocks (every variant) and the composed screens made of them.
Svelte 5 + Vite + Tailwind 4, hash router, base `/stock/`.

    bun run dev          # http://127.0.0.1:5187/stock/
    bun run build        # vite build to dist/ (preview: bun run preview, port 5188)
    bun run check        # svelte-check
    bun run test         # unit tests (also part of the root bun run test)
    bun run index        # rebuild the index: content/assets.v0.json, content/previews.v0.json, src/lib/collections.gen.ts
    bun run index:check  # fail when the committed index differs from a fresh build (deterministic: same inputs, same digest)

## Index (S1)

`scripts/build-index.ts` (logic in `scripts/lib/build.ts`) reads the facet vocabulary `content/facets.v0.json` and the specs:
`packages/compose-gen/specs/blocks` (92 blocks, 474 variants, axes, samples), `packages/compose-gen/schema/codex/blocks.json` (data/kind/
record and label props: the slots), `specs/organisms` (runtimes) and `specs/screens` (one asset per page of a composed screen). Two
categories: **Blocks** (one asset per variant; the variants of a block share a collapse key) and **Screens** (the 65 pages of the
composed screens, each made of kit blocks only; checked by a test). An organism is shown through the block variants that draw it
(directly or nested in another organism); one no block draws would be an asset of its own (none today). Skins, the corner radius and
the light/dark theme are preview settings, not assets or facets. The 146 taste screens are not part of Stock.

The vocabulary is data: every facet with its order, UI, scope, source, values, synonyms, labels in en, fr, de, es, ru (ids stay English)
and the derivation rules of its values (`any` / `not` clauses over block, group, theme, axes, slots, Codex records, fields and label
props, screen, area and earlier facets). **No fallback values**: an asset no rule matches has no label for the facet ("no label", never
counted). `draft: true` marks the facets whose labels come from hand-written tables or are weak (not reviewed by a person): job,
composition, media, slots, role, character, mood, industry; the storefront shows a draft badge on them. Industry is soft: it ranks,
never filters. The builder hides a facet that does not discriminate (no labels: mood; the same labels everywhere: runtime) and a value
no asset carries (`index.hidden` names both). Each asset lists its `weak` facets and the `missing` ones; the labelling state facet
(`markup`) is derived from them.

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
- **Theme**: the Magazine's model (`apps/magazine/src/lib/global-theme.ts`, imported as is, stored under `stock:v1:theme`): mode, skin,
  font, radius, density, applied to the document root, so every preview follows it.
- **Languages**: en, fr, de, es, ru (`content/i18n/<locale>.json` and `locales.json`, data); the switch is in the header and is kept on
  this device. Ids and URL parameters stay English; block titles are the kit dictionary's (English).

Steps of the plan: S0 the frame; S1 the index; S2 the search engine; S3 the storefront on `@ui8kit/layouts`.
