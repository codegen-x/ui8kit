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

## Picks persistence

`?picks=` is the source of truth (first 10 valid styles win and are saved). Without it: `magazine:v1:picks` (`{"v":1,"picks":[10 keys]}`), mirrored to sessionStorage, the `mgpicks` cookie and memory (`@ui8kit/taste-data/picks-store`; only exactly 10 valid distinct keys are accepted, anything else is skipped), then Discovery's `discovery-picked-recommend`. A direct visit with stored picks rewrites the address to `?picks=…` (replaceState, hash kept). Reset clears every mirror. Checks: `bun test packages/taste-data/src/picks-store.test.ts`, and `bun run e2e:persist` against the running :5190 server (headless Chrome, one persistent profile).

## Design system: per-element tokens

The Design system tab (`#/style/<key>/design`) has, next to skin, font and radius, a radius selector for each of badge, button, card, alert and media, a density (compact / default / comfortable) for badge, button, card and alert, and a shadow (style / none / sm / md) for card, alert and media. They only set CSS variables (`--radius-card`, `--shadow-card`) and `data-density-*` attributes on the specimen, the Overview preview and the Templates stage; the rules are in the kit CSS (plan/UI8KIT-2.0.md §11). Only changed keys are kept, as a flat `tokens` object (`{ "radius-button": 0, "density-card": "comfortable", "shadow-card": "sm" }`): "Copy preset" adds it to the preset JSON and "Save as collection item" stores it in the collection item (`Collection.tokens[styleKey]`), never in the style key (the key format is unchanged). Logic and tests: `src/lib/design.ts`, `src/lib/design.test.ts`.

