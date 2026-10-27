# @ui8kit/layouts

The second layer of [ADR-0001](../../.project/adr/0001-three-layers-prototypes-layouts-apps.md): the structure of the apps, between
the prototypes (the kit, its blocks and organisms) and the apps (data, routes, brand theme). Svelte 5, source only (the consumer's
Vite compiles it).

- `src/stock`: the Stock storefront. `stock-frame` (a plain wrapper, not a Block), `stock-header` (brand, search, Collections, Compare,
  language, Theme), `filter-bar` (type tabs + quick filters), `facet-column` (one fieldset per facet, draft badge), `results`
  (count with `aria-live`, applied chips with reset, sort, `card-grid`, `asset-card`, `pagination`, `empty-state`), `theme-sheet`.
  `text.ts`: the text shape (`StockText`) and the view types; every string comes in through props.
- `src/preview`: the live render of a block variant or a composed screen page from its recipe (`recipe.ts`, pure, tested),
  `load.ts` (the data of one preview from the sources the app hands in), `preview-frame` (16:10, the 1280 px stage scaled by a CSS
  variable, mounted when near the viewport) and `live-preview` (the organisms by name).
- `src/styles/layouts.css`: the stage class; import it next to the kit styles and add `@source` for this package.

Checked like the prototypes: the rules zone (`composition` = `src/stock`, `src/preview`; `blockRoot` = the four landmarks) and the
four style groups (corners, shadows, hardcode, spacing: 8 px steps, 4 px only inside controls) with zero baselines.
