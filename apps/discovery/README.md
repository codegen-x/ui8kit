# discovery

A hand-written app (not generated): a panorama of taste screens on a sphere. Svelte 5 + Vite + Three.js.

    bun run dev        # http://127.0.0.1:5183/   (#/screen/<id>[/<slot>] shows one screen live)
    bun run check      # svelte-check
    bun run build      # vite build to dist/

- `src/screens/` — the taste screens, one file per screen, built from `@ui8kit/svelte-ui`; the file name is the id.
- `src/tastes.ts` — the taste index: per screen its skin, font pairing, radius, composition, recipe and copy deck.
- `src/recipes/` — procedural media (mesh, grain, duotone, geometric, glass, flat, rings, stripes, dots, conic); colours
  come from the skin's CSS variables. Gradients, blur and grain live only here, inside media slots.
- `src/engine/grid.ts` — the card grid on the sphere (rows counted from the top for the user: 1 = +60°, 21 = −60°);
  `assign.ts` — screens and variations over the cards; `curated.ts` + `engine/curate.ts` — the rows the user has
  curated: on such a row the picked screens stay and the other cards become variations of them (another skin, maybe
  fonts and radius; no neighbour shares a screen or a skin); every other card stays as `assign.ts` lays it out
  (`engine/wall.ts` = assign, then curate);
  `snapshot.ts` / `loader.ts` / `cache.ts` — offscreen snapshots (SVG foreignObject → canvas → WebP, IndexedDB cache);
  `panorama.ts` — the Three.js view (drag, inertia, wheel zoom clamped to 75–125 % of the default scale, double-click to pick).
- `src/picks.svelte.ts` + `parts/send-button.svelte` — the Send button (bottom-right, only while cards are picked):
  POST /__discovery `{ ids, row }` (the picked taste screen ids, deduped, and the row they are on, counted from the top)
  to the :5190 preview server; picks spanning several rows go as `{ picks: [{ id, row }] }`. The server appends one
  `{ time, row, ids }` line per row to `discovery-inbox/journal.jsonl` and a row to `journal.md` at the repo root (never
  committed); the picks clear on success.
- `content/` — copy fixtures (English placeholder copy, invented names).
