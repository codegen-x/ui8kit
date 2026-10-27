# @ui8kit/layouts

The second layer of [ADR-0001](../../.project/adr/0001-three-layers-prototypes-layouts-apps.md): the structure of the apps, between
the prototypes (the kit, its blocks and organisms) and the apps (data, routes, brand theme). Svelte 5, source only (the consumer's
Vite compiles it).

- `src/stock`: the Stock storefront. `stock-frame` (a plain wrapper, not a Block), `stock-header` (brand, search, Collections, Compare,
  language, Theme), `filter-bar` (type tabs + quick filters), `facet-column` (one fieldset per facet, draft badge), `results`
  (count with `aria-live`, applied chips with reset, sort, `card-grid`, `asset-card`, `pagination`, `empty-state`); its Theme sheet is the shared one of `src/theme`.
  `text.ts`: the text shape (`StockText`) and the view types; every string comes in through props.
- `src/preview`: the live render of a block variant or a composed screen page from its recipe (`recipe.ts`, pure, tested),
  `load.ts` (the data of one preview from the sources the app hands in), `preview-frame` (16:10, the 1280 px stage scaled by a CSS
  variable, mounted when near the viewport) and `live-preview` (the organisms by name); `nav.ts`: the screen menus of
  `@ui8kit/app-shared` by package name (the `nav` source of `load.ts`).
- `src/magazine`: the Magazine's structure, moved out of `apps/magazine` file by file (ADR-0001): `taste-card` (the 4:3 frame of a
  taste screen: snapshot image or live stage scaled by `--shot-scale` from `shot.ts`, caption, why line, `fit` strip / fill /
  mini, `data-own-design` on the frame for the app's token boundary), `heart-toggle` (a checkbox in its label), `card-strip` (a
  section with a heading, a note and a scrolling strip). The Magazine keeps the data (snapshot cache, live budget, collections)
  in thin wrappers and injects these utilities as its own `<style data-snapshot-skip>` (its document CSS stays Discovery's).
- `src/theme`: the global Theme sheet both apps render (moved from `apps/magazine/src/theme`): `theme-sheet` (one modal Dialog with
  the narrow `theme-panel` and, opened from it, the wide `ds-panel`, the Design system), `theme-fields` (every field of
  `@ui8kit/theme-model/global-theme` FIELDS, selects or radio groups), `theme-io` (export/import of the config), `ds-specimen`.
  The state comes in as a `ThemeController` (`@ui8kit/theme-model/controller`: each app keeps its own, with its storage key and
  its mode), the texts as `ThemeSheetText` (`text.ts`).
- `src/styles/layouts.css`: the stage classes (`.ui8-preview-stage`, `.ui8-taste-stage`); import it next to the kit styles and add `@source` for this package.

Checked like the prototypes: the rules zone (`composition` = `src/stock`, `src/preview`, `src/magazine`; `blockRoot` = the four landmarks) and the
four style groups (corners, shadows, hardcode, spacing: 8 px steps, 4 px only inside controls) with zero baselines.
