# @ui8kit/facet-search

The faceted search engine of Stock (`apps/stock`, step S2), moved out of the app so that the Magazine, a server or an MCP tool can
run the same ranking and counts. Plain TypeScript, no UI and no dependencies, so it runs in the browser, in Bun and in a worker.

- `model.ts`: the vocabulary (facets and values as data, labels in en, fr, de, es, ru), the assets and the index. `Asset<P>` and
  `Index<P>` take the preview type of the app.
- `search.ts`: `prepare(index)` once, then `search(engine, state)`: multi-select within a facet (OR), AND across facets,
  disjunctive counts, collapsed variants, soft facets, word-prefix text search in any script, sorts; `relaxations()` for an
  empty result; `paginate()` and `pageWindow()` for pages.
- `query.ts`: the search state and its canonical URL (`q`, facets, `spec`, `variants`, `sort`, `page`); ids and params are English.

A missing label is "no label": it is never a value and never counted. Tests: `bun test src` (a synthetic index); Stock tests the
engine on its real index in `apps/stock/src/lib/search.test.ts`.
