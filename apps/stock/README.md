# stock

A hand-written app (not generated): a stock-site storefront over the repository's blocks, sections (organisms), screens and skins.
Svelte 5 + Vite + Tailwind 4, hash router, base `/stock/`.

    bun run dev          # http://127.0.0.1:5187/stock/
    bun run build        # vite build to dist/ (preview: bun run preview, port 5188)
    bun run check        # svelte-check
    bun run test         # unit tests (also part of the root bun run test)
    bun run index        # rebuild the index: content/assets.v0.json, content/previews.v0.json, src/lib/collections.gen.ts
    bun run index:check  # fail when the committed index differs from a fresh build (deterministic: same inputs, same digest)

## Index (S1)

`scripts/build-index.ts` (logic in `scripts/lib/build.ts`) reads the facet vocabulary `content/facets.v0.json` and the specs:
`packages/compose-gen/specs/blocks` (92 blocks, axes, variants, samples), `packages/compose-gen/schema/codex/blocks.json` (data/kind/record
and label props: the slots), `specs/organisms` (sections and their runtimes), `specs/screens` (one asset per page of a composed screen) and
`packages/skins/skins`. One asset per block variant (the variants of a block share a collapse key), per organism, per screen page and per skin.

The vocabulary is data: every facet with its order, UI, scope (shared or typed), source, values, synonyms and the derivation rules of its
values (`any` / `not` clauses over block, group, theme, axes, slots, Codex records, fields and label props, skin, colour words, screen,
area and earlier facets; `fallback` when nothing matched). `draft: true` marks the facets whose labels are weak (not reviewed by a person):
role, character, mood, industry. Industry is a soft facet: it ranks, never filters. Labels: `*` means every value (a block renders in any
skin and at any radius). Each asset lists its `weak` facets and the `missing` ones (what still needs labelling); the labelling state facet
(`markup`) is derived from them.

## Search (S2)

`src/lib/search.ts`: `prepare(index)` once, then `search(engine, state)`, a pure function (the browser now, a server or an MCP tool
later) modelled on `@ui8kit/taste-data/search`: OR within a facet, AND across facets, disjunctive counts (a facet's counts ignore its
own selection), word-prefix text search with field weights (titles, block, group, slots, and the names and synonyms of the labels),
sorts (catalog, relevance, name, unlabelled first) and `relaxations()` for a zero result (which filter to drop and what it gives).
Variants of one block collapse into one card unless `variants=all`; the counts then count cards. `src/lib/query.ts` is the state
and its canonical URL (`#/search?q=…&job=hero,pricing&density=airy&spec=…&variants=all&sort=name`, facets and values in vocabulary
order, unknown keys and values dropped).

Steps of the plan: S0 the frame (header with the search, empty results); S1 the index; S2 the search engine.
