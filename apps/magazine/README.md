# magazine

A hand-written app (not generated): the journal of a visitor's taste, design in `plan/MAGAZINE.md`. Svelte 5 + Vite + Three.js, hash router, base `/magazine/`.

    bun run dev          # http://127.0.0.1:5185/magazine/   (?picks=<style keys> opens the recommendations)
    bun run check        # svelte-check
    bun run build        # vite build to dist/
    bun run test         # unit tests of the recommender (packages/taste-data/src/recommend)
    bun run css-parity   # builds both apps and compares the document CSS byte for byte (see below)

- Opened **directly** (no `?picks=`, nothing stored under `magazine:v1:picks`): the sphere of screens turns slowly (the Discovery panorama engine from `@ui8kit/panorama`, one WebGL context, picking disabled) and one hint: recommendations unlock after picking 10 styles in Discovery.
- Opened from Discovery's **Recommendations** button (`/discovery/?cards=recommend`, exactly 10 picks): `/magazine/?picks=<keys>`, each key an exact style `screen|skin|display+body|radius` written with `~` for `|` (`decodePicks` in `@ui8kit/taste-data/picks`). Fewer than `MIN_PICKS` valid keys count as no picks. Valid picks are saved in `magazine:v1:picks` (local only) and reopen the recommendations without the URL.
- Routes (hash, the query survives): `#/` recommendation rows, `#/style/<key>` (a placeholder for now: the key and its tokens; `~` stands for `|`).
- One origin with Discovery (`/discovery/`, `/magazine/` on the :5190 preview) so both share the IndexedDB snapshot cache (`s2`, `m2`). A snapshot's cache key hashes the document CSS, so **the two apps must ship the same main stylesheet**: `src/app.css` imports the same kit, skins, `frame.css` and scans the same sources (`@source not` for its own, `@source inline("blur")` for what Discovery's sources produce), and the magazine's own rules (`src/magazine.css`) are injected as `<style data-snapshot-skip>`, which `collectCss()` leaves out. Its own markup uses `mg-*` classes, no Tailwind utilities. `bun run css-parity` fails when the stylesheets differ.
- Screens, recipes and parts are shared with Discovery from `@ui8kit/taste-screens`; the engine from `@ui8kit/panorama`; the vocabulary, picks helpers, skin OKLab table and the recommender from `@ui8kit/taste-data`.

## Tuned feed (home)

The home (`#/`) is a marketplace-like feed (`src/feed`, logic in `src/lib/feed.ts`, state in `src/lib/tune.svelte.ts`). A taste profile is derived from the 10 picks: layout families (top 3), character (from the image recipe: calm, bold, technical, playful), density (from the layout family: airy, balanced, dense), skins (top 3), the most used font pair, the nearest radius, task (any) and imagery (top 3 recipes). Only overrides go into the address (`c`, `ch`, `d`, `sk`, `f`, `r`, `task`, `m`, after `picks`), so a tuned feed can be shared; "Reset to my picks" drops them.

Sections, in order: Closest to your picks (cards in the visitor's skin, font and radius, with a "why" line), Same structure, different look (one screen in three skins; "Use this skin" applies it), an insert, The opposite of your taste, an insert, then pages of Unexpected combinations, each followed by an insert (templates, design system, series, video in turn) and "Show more". The Filters button (header and taste bar) opens a side sheet (the kit's Dialog, variant sheet) with the current settings preselected; "Update feed" applies them. The previous recommender rows are at `#/rows`. Copy: `content/ui.json` (`feed.*`).

    bun run test                  # includes src/lib/feed.test.ts
    bun run e2e:feed              # against the running :5190 server; html-validate on every state; SHOTS=<dir> saves screenshots

## Theme (global layer)

The header's **Theme** button (every page) opens a narrow side sheet (`src/theme`): light/dark mode, skin, font, default radius (0/4/8/12/16, Reset) and one density for all elements. **Design system** in its footer docks a wide panel flush on its left with the per-element radius, density and shadow and the specimen (the same `parts/ds-element-tokens.svelte` and `parts/ds-specimen.svelte` as the style page's Design system tab). Below 640 px the wide panel replaces the narrow one; Back returns. Saved on this device (`magazine:v1:theme`, logic and tests in `@ui8kit/theme-model/global-theme`); the mode stays the app's `xgen-theme`.

Precedence, strongest first:

1. **A card's own design.** Every feed card (and the style page) shows a style: its frame sets its own skin, radius and fonts, and the `.mg-shot` / `.mg-own` boundary in `magazine.css` resets the global per-element tokens, so nothing global leaks into a style.
2. **The global theme**, on `.mg-root`: `data-skin`, `--radius`, `--font-sans`, the token variables and density attributes, inherited by the site chrome, the sheets and the specimen.
3. **The defaults**: the kit's own values.

The two layers are stored apart (the feed tune in the address, the theme in localStorage): changing one never rewrites the other (checked by `e2e:feed`).

## Picks persistence

`?picks=` is the source of truth (first 10 valid styles win and are saved). Without it: `magazine:v1:picks` (`{"v":1,"picks":[10 keys]}`), mirrored to sessionStorage, the `mgpicks` cookie and memory (`@ui8kit/taste-data/picks-store`; only exactly 10 valid distinct keys are accepted, anything else is skipped), then Discovery's `discovery-picked-recommend`. A direct visit with stored picks rewrites the address to `?picks=…` (replaceState, hash kept). Reset clears every mirror. Checks: `bun test packages/taste-data/src/picks-store.test.ts`, and `bun run e2e:persist` against the running :5190 server (headless Chrome, one persistent profile).

## Design system: per-element tokens

The Design system tab (`#/style/<key>/design`) has, next to skin, font and radius, a radius selector for each of badge, button, card, alert and media, a density (compact / default / comfortable) for badge, button, card and alert, and a shadow (style / none / sm / md) for card, alert and media. They only set CSS variables (`--radius-card`, `--shadow-card`) and `data-density-*` attributes on the specimen, the Overview preview and the Templates stage; the rules are in the kit CSS (plan/UI8KIT-2.0.md §11). Only changed keys are kept, as a flat `tokens` object (`{ "radius-button": 0, "density-card": "comfortable", "shadow-card": "sm" }`): "Copy preset" adds it to the preset JSON and "Save as collection item" stores it in the collection item (`Collection.tokens[styleKey]`), never in the style key (the key format is unchanged). Logic and tests: `@ui8kit/theme-model/design` (packages/theme-model/src/design.ts, design.test.ts).


## Reference catalog v0.1

[Editorial reference catalog](../../plan/reference-catalog/README.md) and its
[standalone composition viewer](../../plan/reference-catalog/index.html) cover
12 concepts, 10 layout families, 36 controlled variants, 20 explained relations,
and five planned human research scenarios. Data lives in
[reference-catalog.v0.1.json](../../packages/taste-data/content/reference-catalog.v0.1.json).

Status: source reviewed; visual review completed with findings. Full accessibility and human usability reviews remain open.
The viewer shows schematic masses, not rendered screen previews. The catalog and
neutral copy fixture are not connected to the production recommender or renderer.
Opening the entry fixture's `?picks=` URL replaces locally stored magazine picks;
use a separate browser profile for research.

From the repository root, check source hashes, style keys and references with:

    bun packages/taste-data/scripts/reference-catalog.ts --check

Regenerate the viewer and catalog documentation with `--render`.
### Real-screen research renderer

Run `bun run --cwd apps/magazine dev`, then open
`http://127.0.0.1:5185/magazine/reference.html?concept=ref-c02&mode=normalized`.
This separate dev entry renders the actual TasteFrame and screen, with local fonts,
without changing picks. It is not included in the normal production build entry.
`mode=authored|normalized|long|colour|font|radius`; `probe=narrow` overrides the fixed
frame to 390 × 844 for diagnostic reflow. Production Overview scales the desktop
frame; narrow probes do not establish a supported mobile layout.

From the repository root:

    node packages/taste-data/scripts/reference-capture.mjs --variants
    node packages/taste-data/scripts/reference-review.mjs
    node packages/taste-data/scripts/reference-contrast.mjs

Capture uses the installed Edge on Windows by default; set `REFERENCE_BROWSER`
and `REFERENCE_BASE` for another local browser/server. It records light theme,
DPR 1 and reduced motion. Binary captures stay local under the ignored
`plan/reference-catalog/captures/`; rerun capture to reproduce them.

[Real-screen comparison](../../plan/reference-catalog/visual-review.html),
[visual findings](../../plan/reference-catalog/visual-review.md) and
[research protocol for designers and art directors](../../plan/reference-catalog/research-protocol.md).