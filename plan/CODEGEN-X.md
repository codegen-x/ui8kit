# codegen-x.com — structure draft

buildy.tw = future Tailwind-based site builder ("build with tw"); docs on ui.buildy.tw, registry on registry.buildy.tw, site repo ui8kit/site (github.com/ui8kit/site).

Status: discussion draft (2026-10-08). Nothing here is built yet. Goal: lay a low-start structure that scales
to thousands of design systems without a rewrite.

## 0. Two sites, two jobs

| Site | Job |
|---|---|
| fastygo + ui8kit docs (`ui.buildy.tw`) | shadcn-style docs: block pages, code tab, `npx ui8kit add` (live; iframe previews are not part of it) |
| codegen-x.com | a service: a marketplace of design systems on one light Svelte runtime; pick a taste, export a preset, pull code with `npx cgenx` |

## 1. Product flow (codegen-x.com)

1. **Discovery** — a sphere of hundreds of screens plus a pop-out skins sidebar.
   Styles the user marks "include" (`?cards=include`, see `plan/included-styles.md`) are the ones that must be in the
   marketplace showcase. Planned: the detail page of such a design shows its sibling blocks in the same design
   (hero, hero-right, features, cta, pricing, testimonials, ...) and a **Templates** tab (blog, store, portfolio, website).
   Every Discovery screen also carries a **composition pattern** (rule-of-thirds, diagonal, focal-mass, l-arrangement, radial, circular, cross, pyramid; `apps/discovery/src/compositions.ts`), shown per style in `plan/included-styles.md`. It is a tag for the future ranking index; in the wall engine it is only an opt-in soft preference (weight 0, the wall is unchanged).
2. Every click on a screen or skin is an event sent to Jev. After at least 10 picks (exact styles, `MIN_PICKS`) Jev has enough signal for intent.
3. Jev builds a **personal catalog** in marketplace form: relevant categories, collections, blocks, screens, skins, fonts.
4. **System tab** — a typical design system page (tokens, typography, radii, ...). Switching a skin re-skins the
   System page and the whole marketplace at once.
5. **Export a preset** → `npx cgenx` → pull locally what is needed: runtime + primitives, a design system, a site,
   blocks, block variants (e.g. 6 post-card views, 10 article page views).
6. Later: generated ready-made sets (dashboards, stores, promo).

Overall aim: keep a registry of commands and tie the site to the CLI, so a harness agent can build queries that
rank the right blocks.

## 2. Foundations to lay from day one

### 2.1 One vocabulary for site, CLI and Jev
Every pick is an event with the same names as the CLI flags: `screen`, `skin`, `font`, `radius`, `block`,
`variant`, `runtime`. A preset is just a set of such picks in a file. The site, `npx cgenx` and the agent speak
one language; Jev ranks by the same fields the CLI later pulls by.

### 2.2 Design-system package = the unit of the marketplace
Name form `author/package` (e.g. `ui8kit/base`, `studio/xyz`). One manifest shape for every author:

- `format` (package format version), `name`, `version`, `license`, `runtimes`
- tokens, typography, radii — this is what the System tab renders
- skins
- blocks with variants (10 article page views = one block, 10 variants)
- screens composed from blocks
- hashes (and later signatures) for every artifact

Third-party systems plug in without a rewrite only if this shape is fixed from the first package.

### 2.3 Ranking index separate from code
Each screen and block gets a light feature card: category, density, columns, media presence, tone, font,
collection membership, package, runtimes. The sphere and Jev read only this index; heavy code is fetched on
export. This is also the index a harness agent queries.

### 2.4 Skin = CSS variables, not a build
As in the preview's `/skins/` section: a skin changes only CSS variables, so one click re-skins the System tab,
the marketplace and every screen preview with no rebuild. Requirement for third-party systems: tokens live in
CSS variables.

### 2.5 Sets = recipes on top of screens
Future dashboard / store / promo sets are preset recipes: which screens, which block variants, which skin.
Generation sits on top and needs no new format.

### 2.6 Distribution
Start: CI publishes packages to GitHub Releases / npm (unpkg, jsDelivr) behind an own address: the ui8kit registry is live at
`https://registry.buildy.tw/<runtime>` (Vercel, repo ui8kit/site). Later: a CDN in front, same address, nothing changes for users. Private systems
(e.g. a private design kit) use the same format with a private registry URL and never enter the public registry.

## 3. Order

1. Package format + ranking index on one system: ui8kit 2.0 (from xgen specs).
2. Sphere + skins sidebar on that index (Svelte).
3. Preset export + `npx cgenx`.
4. Jev personalisation (10+ picks → personal catalog).
5. Third-party authors; generated sets.

## 4. Open questions

- Event and preset schema: exact field list and versioning.
- Block variants on install: whole block with all variants, or `--variant`.
- Skin/theme as its own registry item type (e.g. `registry:theme`).
- Which features Jev needs per screen beyond the list in 2.3.
- Binary (`curl -fsSL https://codegen-x.com/install | sh`) for non-Node stacks: when, and what it embeds.

## 5. Decision 2026-10-08: no iframes, previews are scaled screens

Hypothesis already proven in builddy.vercel.app: skin and dark-mode switch in the menu re-skin every block
instantly; collections are gathered and the page builder then shows only blocks from a collection.

codegen-x does the same on Svelte, with the feed replaced by the sphere and a marketplace showcase
(Ozon-style: recommendations mixed with relevant sections). Goal: search, surf, collect and save fast.

Preview tech:
- Blocks and screens render in the same DOM (one runtime, Svelte), shrunk with a CSS scale on a fixed-width
  frame (e.g. 1440 wide → card width). Skin and dark mode are CSS variables, so every preview updates at once.
- Breakpoints: not needed for previews (always desktop width).
- Performance with hundreds of screens: mount only visible cards (IntersectionObserver / virtual list),
  `content-visibility: auto`, and a static snapshot fallback for the sphere.
- Confirmed: previews always show the desktop version, even on phones (fixed desktop-width frame, scaled down).
  No mobile simulator at all: a screen opens in a new browser window and the developer checks responsiveness in DevTools.

## 6. Roadmap to the first sphere and showcase (agreed 2026-10-08)

1. [x] Move the `codegen` branch into its own repository, nothing from private kits: done 2026-10-08 as codegen-x/ui8kit
   (`main`), a history-free snapshot (`5139209`) instead of keeping history; the old branch is no longer used.
2. Generate primitives and runtime packages (Svelte, React, Vue).
3. Build the registry (index + items) and publish it to the CDN.
4. Site: start by pulling all blocks in Svelte from the registry.
5. Keep a synchronous registry of links between the site and the `cgenx` CLI (same vocabulary, same index).

## Task: Templates tab, HTML5 page layouts (noted 2026-10-09)

The Templates tab needs different semantic HTML5 page markup, one skeleton per layout. Source: the user's "10 common website layouts" reference: classic (header, nav, hero, content, footer), two-column, three-column, sidebar, dashboard, blog, e-commerce, portfolio, SaaS landing, documentation. Each skeleton uses landmarks (`header`, `nav`, `main`, `aside`, `article`, `section`, `footer`), keeps the 8px grid, and is skinned by the chosen style. Not started; comes after the registry and detail pages.

## 7. Layout references for Discovery screens t121–t146 (noted 2026-10-09)

Eleven page references from the user, kept as layout notes only: no brand names, no photos, no logos; copy is neutral English (decks 40–50 in `apps/discovery/content/copy.json`), images are procedural recipes. Screens: `apps/discovery/src/screens/t121…t146`, patterns in `compositions.ts`.

1. **Store, tinted hero** (t121–t123): a rounded tinted panel, headline and pill action at the start, a product plate at the end with a floating stats card (figure + avatar stack) and a 2×2 grid of category chips; below it three tinted category tiles (kicker, title, outline pill action) and a four-item benefit strip (icon, title, hint).
2. **Car rental, search-card hero** (t124–t126): headline and two actions over a landscape, a floating search card at the end (three fields + full-width button), a benefit card row overlapping the foot, a split feature (picture + check list + button), three stat cards with the middle one filled, and a narrow mobile column next to the desktop frame.
3. **Food, split hero** (t127–t129): headline, lead and an order action with a "process" play button at the start, a very large round plate at the end with a floating review chip (avatar, name, stars) and a delivery chip (timer, "30 min"), and a four-figure row with vertical rules at the foot.
4. **Car shop, dark full-bleed** (t130–t132): a rounded dark hero with centred headline, CTA pill and pager arrows; intro heading with an avatar stack and a rule; a two-image row with a pager; a ribbon of name tiles; filter bar and a four by two product grid; a numbered three-step stepper beside a tall picture.
5. **Real estate, glass search** (t133–t135): dark rounded full-bleed hero with pill navigation, a huge uppercase headline and a glass search bar (four labelled fields + icon button); a story split (picture + uppercase heading + two paragraphs); a 2×2 block of big figures beside a tall picture.
6. **Travel, video chip hero** (t136–t138): a landscape hero with headline plate, floating video chip (counter, label, round play) at the end and a four-figure row; three picture tiles with tag chips; four feature cards with one filled; a dark numbered package list with round arrow actions beside a picture card and an avatar row.
7. **Fashion, dark hero + benefits** (t139, t140): dark full-bleed panel, huge headline with a lighter second line, two actions and three figures; a four-item benefit strip overlapping the panel foot; three tinted collection tiles with a round arrow; a trending header with filter links and a row of five product tiles with a heart button.
8. **Car rental, collage hero** (t141, t142): huge headline at the start, three overlapping image cards (one with caption + arrow) stepping to the end, a row of pill filter chips with icons; numbered section labels ("02 —", "03 —"), three highlight cards with the accent colour on two of them, three fleet cards with a round arrow.
9. **Fashion, huge condensed headline** (t143): utility bar, search pill in the header, an enormous uppercase headline with a second line and an avatar proof row, an arch plate at the end, a row of eight round category discs, and two banner cards.
10. **Shop dashboard** (t144): a left icon rail with labels, a command bar and a primary action on top, a promo card beside a bar chart card, a row of four colourful product tiles, and two stat cards in a right column.
11. **Fintech landing** (t145, t146): centred hero with a pill kicker and two actions over a wide plate with a wallet card, a ribbon of six company names, three feature cards (middle one filled); a three-tier price table with the dark middle tier, a FAQ column of disclosures beside testimonial strips.

## 8. Magazine app (noted 2026-10-10)

A separate app `apps/magazine` (journal, warehouse and storage of collections, design packs, templates, presets): 10 picks on the Discovery panorama -> Recommendations -> collections, a header ball that re-opens the sphere, a detail page with series blocks, the 10 templates and composition patterns. Design only, not built: see `plan/MAGAZINE.md`. Decisions of 2026-10-10 (MAGAZINE.md §12): one origin with `/discovery/` (shared snapshot cache); 10 picks are exact styles and recommendations unlock strictly at 10 (`MIN_PICKS`, not 8); series blocks and templates only for the included styles (90 now), the rest derive from the nearest one; collections are local only (localStorage), a prototype of a future design store. Shared `packages/panorama` and `packages/taste-data` hold the engine and the data.
