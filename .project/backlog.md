# Backlog

Deferred by the owner ("later", roughness); one line each, newest section first. Source commit where it applies.

## 2026-10-28

### To do (next, not roughness)
- Palette contrast level as its own control (AA / AAA, or soft / sharp) for fine contrast tuning of the generated colours — 5cda873c.
- Font controls in the Fonts sheet header: on the left a live sample (a heading, body text and a quote); on the right fine controls: size scale in % (smaller / larger; many fonts look too large) and a Width slider (the Google Fonts variable axis wdth), shown only for fonts that have that axis (verify per font from the Google Fonts axis data). A theme setting: scales the type tokens, applies to the page and the preview iframes, persists, in export/import.

### Stock: catalog and detail page
- "All of these blocks" mode for "Similar by blocks" (match every block of the page, not any one) — 2d6eb757.
- Detail page polish (the owner's "finishing touches"): spacing, alignment and small visual touches of the 70/30 page — c65ce634.
- Search suggestions as a kit-wide ARIA combobox (one composition across the 8 runtimes) — 33cf9675.
- Translated block names in the facets, chips and the detail page (now the kit ids) — 2d6eb757.
- Precomputed suggestion index once the catalog nears ~10k assets (now built in the browser) — 33cf9675.

### Theme sheet
- Lucide swatch-book glyph in the kit (8 runtimes) for the fonts trigger (now "type") — fe9c0ba9.
- E2E test of the skins and fonts sheets (open, pick a card, the select and the iframe follow) — fe9c0ba9.
- Palette: e2e test (drag a marker, check --primary in the page and in a preview iframe) — 5cda873c.
- Palette: show the custom palette in the Design system specimen and in the skin cards (now the base skin) — 5cda873c.
- Palette: per-skin lightness levels for secondary/accent/charts (now fixed levels per role) — 5cda873c.
- Palette: the saturation drag at 390 px is unverified (the scripted drag left it at 100%) — 5cda873c.

### Product
- Closed version: per-runtime code through a fetch command with the code on ui.buildy.tw; the Dataset behind server-side role auth.

### Performance (deferred; the home page and the catalog route will change first)
- Prerender the catalog HTML.
- Move the asset index JSON out of the bundle.
- A light entry for the preview frame document.
- Load organisms on demand.

### Known risks (recorded, not scheduled)
- Block highlight in the preview maps 1:1 only (one block, one region).
- Composition pattern definitions are drafts (rule-based, "draft" badge).
- The preview skeleton relies on :has() (no fallback in old browsers).
- The asset-type select before the search shows from 640 px only — 187ff29d.
- Pressed/expanded state ARIA on toggle buttons is not allowed by the rules gate (reactive-aria); toggles show state visually only.
