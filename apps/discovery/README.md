# discovery

A hand-written app (not generated): a panorama of taste screens on a sphere. Svelte 5 + Vite + Three.js.

    bun run dev        # http://127.0.0.1:5183/   (#/screen/<id>[/<slot>] shows one screen live)
    bun run check      # svelte-check
    bun run build      # vite build to dist/

- **Shared packages** (moved verbatim from here, 2026-10-10, step 1 of `plan/MAGAZINE.md`): `packages/panorama` (`@ui8kit/panorama`: the engine — `grid`, `assign`, `curate`, `wave`, `wall`, `colors`, `panorama`, `profile`, `snapshot`, `loader`, `cache`, `taste-frame.svelte`) and `packages/taste-data` (`@ui8kit/taste-data`: `taste`, `tastes`, `compositions`, `curated`, `included` + `included.json`, `fonts`, `copy` + `content/copy.json`, `wave-contrast.json`). Discovery imports them by package name; the code, the wall and the snapshot cache keys (`s2`/`m2`) are unchanged. `app.css` adds `@source` lines for both so Tailwind scans them as before. Paths below that say `src/engine/…`, `src/tastes.ts`, `src/curated.ts`, `src/included.*` now live in those packages.
- `src/screens/` (now `packages/taste-screens/src/screens`, moved verbatim 2026-10-11 so the magazine renders the same markup; also `recipes/`, `parts/{top-bar,avatars,field}.svelte`, `kit-data.ts` and `frame.css`, the app rules every snapshot hashes) — the taste screens, one file per screen, built from `@ui8kit/svelte-ui`; the file name is the id.
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
  Every card of a row listed in `curated.ts` gets a small dot in the top-right corner (shader, not the snapshot), including its variations.
- `src/included.ts` + `scripts/included.ts` — the catalog of included styles (see below).
- `src/picks.svelte.ts` + `parts/send-button.svelte` — the Send button (bottom-right, only while cards are picked):
  POST /__discovery `{ ids, row }` (the picked taste screen ids, deduped, and the row they are on, counted from the top)
  to the :5190 preview server; picks spanning several rows go as `{ picks: [{ id, row }] }`. The server appends one
  `{ time, row, ids }` line per row to `discovery-inbox/journal.jsonl` and a row to `journal.md` at the repo root (never
  committed); the picks clear on success.
- `content/` — copy fixtures (English placeholder copy, invented names).

## The `cards` URL parameter (five modes)

| URL | picks mean | Send | POST /__discovery | localStorage |
|---|---|---|---|---|
| no `cards` (or unknown) | nothing: double-click only toggles the outline | none | none | `discovery-picked` |
| `?cards=all` | KEEP | yes | `{ ids, row }` (mode defaults to `"keep"`); dots on curated rows | `discovery-picked` |
| `?cards=exclude` | EXCLUDE | yes | `{ ids, row, mode: "exclude" }` | `discovery-picked-exclude` |
| `?cards=include` | INCLUDE the card's exact style in the future marketplace showcase | yes | `{ ids, row, mode: "include", cards: [{ id, skin, font, radius, row, col }] }` | `discovery-picked-include` |
| `?cards=recommend` | the visitor's taste: exactly 10 exact styles (`MIN_PICKS`) for the magazine | none: counter `n/10`, a Clear link, and a **Recommendations** link at exactly 10 picks (an eleventh is not taken) | none | `discovery-picked-recommend` (array of style keys) |

`recommend` is the entry to `apps/magazine` (`plan/MAGAZINE.md`): the Recommendations button is a same-origin link to `/magazine/?picks=<keys>`, each key an exact style `screen|skin|display+body|radius` written with `~` for `|` (`encodePicks` / `decodePicks` / `MIN_PICKS` in `packages/taste-data/src/picks.ts`). Nothing is posted to the preview server.

The server records `mode` in `discovery-inbox/journal.jsonl` and `journal.md`. Include never touches the wall: no refill, no curated dots.

Include needs more than ids: a screen id says nothing about the skin, fonts and radius the card was showing (variations share the
screen). So the client sends one descriptor per outlined card: `id` (taste screen), `skin`, `font` (`"display+body"`), `radius` (px),
`row` (from the top, 1 = +60°) and `col` (index in the row). `ids` is the deduped list of screen ids; `cards` is not deduped
(two cards of one style are two descriptors). A post whose cards span several rows is `{ picks, mode, cards }`.
The server rejects mode include without valid descriptors (400) and writes one journal line per row:

    {"time":"…Z","mode":"include","row":3,"ids":["t001-poster-mesh"],"cards":[{"id":"t001-poster-mesh","skin":"cosmic-night","font":"montserrat+inter","radius":12,"row":3,"col":4}]}

and a `journal.md` row whose ids cell lists each card as `id (skin, font, rRADIUS, col N)`.

### Included styles catalog

    bun run included          # journal (include entries) -> src/included.json + ../../plan/included-styles.md
    bun run included --dry    # print only, write nothing   (--journal <path> reads another journal)

`included.json` (typed by `included.ts`, in `packages/taste-data/src/`) is the committed catalog, deduped by full style `screen|skin|display+body|radius`
(it grows with every run; the journal itself is never committed). `plan/included-styles.md` is generated from it: per style the screen id,
layout, image recipe, skin, fonts, radius, light/dark primary/background/foreground read from the skin css, a plain-English taste
derived from measured contrast, hue/saturation, radius, density of the layout and the fonts, and the planned companion blocks and templates.

### Composition patterns

`src/compositions.ts` tags each of the 146 screens with one primary (optionally a secondary) composition pattern from the beginner's
guide to composition, restricted to those meaningful for web screens: rule-of-thirds, diagonal, focal-mass, l-arrangement, radial,
circular, cross, pyramid (v-arrangement is defined but unused). Tags are assigned by hand from the layout markup, each with a one-line
note; `weak: true` marks screens that only loosely fit. Golden spiral, golden triangles and compound curve are not screen patterns.
`bun run included` prints the pattern per style in `plan/included-styles.md`, `compositionOf()` in `src/included.ts` returns it, and
`engine/assign.ts` can use it as a soft preference (`PATTERN_WEIGHT`, default 0, so the wall is byte-for-byte unchanged).

In-app links are hash-only (`#/screen/...`, `#/`), so the query survives navigation.
