# ui8kit 2.0 (codegen-x/ui8kit, `main`)

ui8kit 2.0 is the brand-neutral, freely distributable block generator (xgen): specs in, readable static
Svelte / React / Vue blocks out. Nothing from any private design kit lands here. Kit work stays in private
repositories and branches; `main` of codegen-x/ui8kit only receives generic generator changes.

Repository: since 2026-10-08 all work happens in codegen-x/ui8kit on `main`. It started as a history-free snapshot
(`5139209`, "ui8kit 2.0: initial import") of the old `codegen` branch, which is no longer used. The sections below that
say "on `codegen`" and list commit SHAs are history of that branch; those commits are not in this repository.

Safety tag (history, old repository only): `codegen-pre-2.0` = the old `codegen` branch before this work (`5f74f85`).
The tag is not in codegen-x/ui8kit.

## 1. Clean-up of kit ties

Before this work, `codegen` carried a few references to a private design kit in docs, code comments, cursor rules, the
pre-push audit comment and the theme. Each was neutralized (the generic thing kept, the kit name and kit numbers
dropped) or replaced by the shadcn neutral theme (section 6). No kit screens, photos, gradients, frame data or presets
were on `codegen` before this work.

## 2. Kit content that is not ported

Kit-only presets, screens, texts, tools, docs and the e2e / visual special cases for kit screens stay on the private
branch. In their place:

- the neutral `defaults` preset (`preset.defaults`, authoring `presets/default-preset.ts`, helper `layoutOf()`; text keys
  `micro / tiny / caption / small`; Tailwind-scale values, no arbitrary sizes) replaces the kit preset;
- every screen uses the default skin (`mono` removed with the shadcn neutral theme, section 6);
- fixtures and texts are the neutral versions; templates and hero copy are written generic;
- `private/`, `shots/`, `.manual/` are never tracked (gitignored, the audit fails on them).

## 3. Generic improvements ported from the private branch (52 commits)

Ported as one file-level port (tree of the private branch, then the kit content stripped before the first commit), so
no kit commit entered `codegen` history (nor enters `main` of codegen-x/ui8kit).

- Screens as data: `xgen/specs/screens/*.json`, one host per runtime (`apps/host-svelte` :5180, `host-react` :5181, `host-vue` :5182), shared `packages/shared/app`.
- Guard rails in `xgen check`: exact-count hardcode ratchet (every allowance has a `why`), readability (150 lines/file, 600/screen, 8000 bytes, 160 chars/line, 12 props), drift, tier test, Cyrillic.
- Pixel gate (`xgen visual`) and `xgen shot`.
- Tiers `primitives/ components/ blocks/`, variant tables at the top of each file, `DO NOT EDIT` + `Source:` lines, grouped props, `forward()` slot pass-through, React per-part primitive files.
- Authoring split `xgen/screens/src/authoring/{components,blocks,gallery,screens}`.
- Vue 3 runtime (`xgen/runtimes/vue`, `packages/vue/ui`, `apps/host-vue`, vue-tsc in typecheck).
- Presets as the only home of layout geometry (`specs/presets/*`, the `preset` op); here only neutral presets.

## 4. ui8px

`ui8px` 0.2.4 (root dev dependency) lints utility classes. It reads only `.html`, `.css`, `.templ`, `.go`, so
`bun run lint:px` (`packages/tooling/bin/ui8px-gate.mjs`):

1. `ui8px-extract.mjs` mirrors every class set of `xgen/specs` (variant tables, recipes, presets, view classes) into
   `.ui8px/extract/specs/<dir>/<spec>.html`, one `<i data-src="$.json.path" class="...">` per set (the folder carries its
   own `.gitignore`: ui8px skips paths of the root `.gitignore`);
2. runs `ui8px lint .ui8px/extract/specs --json` into `.ui8px/reports/lint.json` (a file: a pipe cuts the report);
3. blocks on UI8PX001 / 003 / 005 and GRID (off-scale `size-*`, `space-*`, negative spacing) above the ratchet in
   `.ui8px/gate.json`; UI8PX002 (class not in the allowed list) and UI8PX004 (conflicts; `inset-ring` +
   `inset-ring-<color>` are false positives) are report only. `check:all` runs it.

Policy (`.ui8px/policy/`, only `allowed.json` and `scopes.json` differ from `ui8px init`): layout scope allows even
units 0..160 (8 px step); the control scope (34 exact globs: button, badge, input, select, checkbox, radio, switch,
textarea, range, label, meter, progress, summary, switcher, nav-item, dropdown-item, file-tree-item, search-field,
pill, ...) allows 0..16 (4 px step up to 64 px), then even units. `.5` and `[Npx]` are never on a scale. `w-px` / `h-px` allowed.

### Counts (blocking = UI8PX001 + GRID)

| state | UI8PX001 | GRID | blocking |
|---|---|---|---|
| neutral tree after the cleanup, before fixes (`ad48781`) | 223 | 34 | 257 |
| after the fixes (ratchet in `.ui8px/gate.json`) | 46 | 34 | **80** |

Report only now: UI8PX002 495, UI8PX004 59.

### Value changes that shift pixels (all made in specs / authoring, then regenerated)

- Layout scope, odd 4 px steps up to the next 8 px step: `gap-1/3/5 -> gap-2/4/6`, `p-3/5 -> p-4/6`, `px-3 -> px-4`,
  `py-1/3 -> py-2/4`, `pt/pb/pr/pl-3/5 -> 4/6`, `gap-x-3 -> gap-x-4` (about 130 class sets in 80 specs, commit `d0eacfc`).
- Layout scope, half steps to the nearest 8 px step: `gap-0.5 -> gap-0`, `gap-1.5 -> gap-2`, `gap-2.5 / px-2.5 -> 2`, `py-0.5 -> py-0`, `py-1.5 -> py-2`.
- Control scope, half steps to the next 4 px step: badge `px-1.5 -> px-2`, `px-3.5 -> px-4`; button-label `px-1.5 -> px-2`;
  textarea `py-2.5 -> py-3`, `py-3.5 -> py-4`; switcher-item `px-1.5 -> px-2`, `gap-1.5 -> gap-2`; badge-square `px-[5px] -> px-1`.
- Icon buttons round down so the icon keeps its size (no visible change): `p-0.5 -> p-0`, `p-1.5 -> p-1`, `p-2.5 -> p-2`; icon-tab `p-1.5 -> p-1`.
- Separator `spaced` `my-5 -> my-6`; pager `gap-3 -> gap-4`; search field `min-w-45 -> min-w-44`; defaults preset hero band `min-h-160`.
- Stats panel lays its figures out in the `cols` columns (was one flex row); the figure is `text-4xl` on phones, `text-6xl` from `md`.

### Breaking changes (ui8kit 2.0)

- `Stack` / `Group` `Gap`: options are now `0, 8, 16, 24, 32, 40, 48, auto`. Removed `2, 4, 6, 10, 12, 20, 36`;
  migration used in authoring: `2 -> 0`, `4 / 6 / 10 -> 8`, `12 -> 16`, `20 -> 24`, `36 -> 40` (new `40` = `gap-10`).
  Superseded in 8.7: the keys are now Tailwind steps `0, 2, 4, 6, 8, 10, 12, auto` (same classes).
- Preset: the kit preset is gone; blocks read `defaults` (`presets/defaults.ts`), text keys `micro / tiny / caption / small`.

### Remaining 80 blocking hits (deferred, with reasons)

Superseded: the polish round brought the count to 25; the current list is in 8.5.

| group | hits | why not changed now |
|---|---|---|
| false positives: `inset-ring-background/30`, `/20` (ring colour), `inset-x-12`, hairline grid `gap-px p-px` (feature cells) | 6 | not spacing / 1 px hairlines by design |
| size options named in pixels: button/input/select/switcher `h-15` (size "60"), switcher `h-[76px]` ("76"), avatar `size-3/5/15` (12/20/60), image `size-15`, icon `size-3/3.5/5/7` (xs/sm/md/xl), button `[&>svg]:size-3.5`, range thumb/track `size-3.5`/`h-1.5` | ~40 | public size API; needs a renamed scale (breaking) and a visual review of every control size; proposal: icon xs/sm/md/xl -> 16/16/24/32 or move icon/avatar specs into the control scope |
| position offsets that align icons and dots: search-palette `top-1.5/2.5 left-3 right-3`, product-card badge `left-3 top-3`, notice `right-5 bottom-5`, timeline `mt-1.5 w-3 size-2.5`, before-after `mt-1`, signup-wizard / code-window dots `size-2.5`, nav-item-row `size-5`, pager `w-5` | ~16 | rounding moves the icon off its text line; needs a person with the screenshots |
| compact chips inside layout specs: prompt-composer (`h-7 gap-1 gap-1.5 py-1 pl-1 px-3 size-5`), topic-chips `px-3`, hero-badge mark `h-5 min-w-9 px-1`, template-grid filter pills `h-7` | ~13 | they are controls; split them into control specs (or list them in the control scope) instead of bending the numbers |
| thin bars and placeholders: meter / progress `h-0.5`, skeleton `h-3`; nav-item level 4 `pl-[84px]` (20 px indent steps); section-head `h-9 h-11`; plans screen `-mx-3` | ~7 | visual weight / indent rhythm would change |

## 5. Checklist

- [x] Tag `codegen-pre-2.0` pushed (old repository; not carried into codegen-x/ui8kit)
- [x] Inventory (this file)
- [x] Port generic improvements from the private branch, kit content stripped (`daa2e8e`)
- [x] Neutral `defaults` preset replaces the kit preset
- [x] Neutralize kit names in docs, comments, rules (section 1)
- [x] Gates: build, check, test, typecheck, build:hosts on svelte / react / vue
- [x] `ui8px` dev dependency, `.ui8px/` policy, `lint:px` script (in `check:all`)
- [x] ui8px report; mechanical fixes through specs / authoring (257 -> 80); deferred hits listed above
- [x] A search for the kit names returns nothing
- [x] Theme tokens and recipe tables: shadcn neutral theme (section 6)
- [x] Simplification of section 7 applied: one corner token, decoration-only options removed (7.6)
- [ ] Open: icon / avatar / control size scale (breaking), with the kit type scale `text-[8..11px]`, `h-[76px]`, `pl-[84px]`; chips as control specs

## 6. shadcn neutral theme

Source: <https://ui.shadcn.com/docs/theming> ("Default Theme CSS", base color neutral, Tailwind v4 / oklch), checked on 2026-10-06.

- `xgen/runtimes/core/assets/styles/theme.css` is the shadcn neutral theme as published: `:root` and dark values in
  oklch, `--radius: 0.625rem`, the `@theme inline` colour map and the radius scale (`sm` 0.6x, `md` 0.8x, `lg` 1x,
  `xl` 1.4x, `2xl` 1.8x, `3xl` 2.2x, `4xl` 2.6x), and the base layer (`border-border outline-ring/50`,
  `bg-background text-foreground`). Only change: the dark block and the `dark` variant also match
  `[data-theme="dark"]`, because the hosts toggle that attribute.
- Dropped from the canary theme: the custom primary colour and every HSL value, `--destructive-foreground`, the custom
  fonts (the stock Tailwind font stacks apply), the custom shadow set, the tracking scale,
  `--radius: 1rem` and its `- 4px` radius steps.
- `kit.css`: the kit shadow tokens (`shadow-base-1`, `-1-4`, `primary-1`, `dialog`, `knob`) are gone. The switch knob
  and the smartbox focus ring use the stock Tailwind `shadow-sm` / `shadow-xs` values.
- `mono` skin removed: neutral is already black, white and gray, so the skin was redundant. `skins.css` and
  `data-skin` stay as the hook for future skins; `screenSkin()` returns `"default"` only.

Tokens and classes that shadcn does not have, mapped to the closest shadcn token or stock Tailwind class:

| was | now | where |
|---|---|---|
| `text-destructive-foreground` (`--destructive-foreground`) | `text-white` plus `dark:bg-destructive/60`, as in shadcn's own button / badge (see below) | ui badge, button, iconbadge `destructive` |
| `shadow-base-1` | `shadow-xs` | recipes badge-square, icon-tab, nav-item-content, smartbox, switcher-item; ui card `raised`; part search-field |
| `shadow-primary-1` | `shadow-sm` | ui button `dark` |
| `shadow-dialog` | `shadow-lg` | ui dialog; part notice |
| `rounded-[20px]` (kit card radius) | `rounded-2xl` (1.8 x radius = 18px) | recipes icon-tab, media-frame; ui card, dialog, disclosure, fieldset |
| `fill-amber-400 text-amber-400` (rating star) | `fill-foreground text-foreground` | part rating |

The 15 recipe tables now use only shadcn semantic colours (`background`, `foreground`, `card`, `muted`,
`muted-foreground`, `primary`, `border`) plus stock Tailwind radius and shadow classes. Every radius class now follows
the shadcn scale: `sm` 12 -> 6px, `md` 14 -> 8px, `lg` 16 -> 10px, `xl` 20 -> 14px, `2xl` 16 -> 18px, `3xl` 24 -> 22px,
`4xl` 32 -> 26px. All 402 visual states changed and were
re-baselined on purpose. Hardcode allowlist lowered for 7 specs. ui8px: 80 blocking (ratchet 80, unchanged).

Destructive variants follow shadcn's components (new-york-v4 registry,
`apps/v4/registry/new-york-v4/ui/button.tsx` and `badge.tsx` on shadcn-ui/ui main, read 2026-10-06):

- button: `bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40`
- badge: `bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40`
  (`[a&]:hover:bg-destructive/90` left out: our Badge never renders as a link)
- iconbadge (no shadcn twin, not focusable): `bg-destructive text-white dark:bg-destructive/60`
- our primitives draw their edge with `inset-ring`; the destructive edge is `inset-ring-transparent` (shadcn: no border)
  so the 60% dark fill shows no solid red rim.
- focus: the kit focus rule in `kit.css` keeps its 4px halo (shadcn: 3px `ring-[3px]`); the halo takes
  `--tw-ring-color` when an element sets one, so shadcn's `focus-visible:ring-destructive/20` (dark `/40`) tints it.
  `--tw-ring-color` does not inherit, so every other element keeps the gray halo.
- newer shadcn styles (`registry/styles/style-*.css`, e.g. vega) use a tinted destructive instead
  (`bg-destructive/10 text-destructive`); not taken.

Owner decisions (2026-10-06):

- status palettes in `parts/pill` (8 tones) and `parts/timeline` (4 dots) stay: data colours on purpose.
- `tw-animate-css` and `shadcn/tailwind.css` are not added.
- deferred to the icon / control size visual review (section 4): the type scale inside recipe and primitive tables
  (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`), switcher `h-[76px]`, nav-item `pl-[84px]`.

## 7. Simplicity audit (audit at `554c466`; applied, see 7.6)

State: `967bc02`, rebuilt from the specs, `xgen check` drift ok (packages and apps equal the specs).
Target of the owner: a universal, maximally simple kit. Plain `rounded` only, no gradients, no colour dividers,
no decoration that does not carry meaning.

### 7.1 The most complex blocks

There are 62 block specs (not 67). Metric: a composite score, the mean of six measures, each divided by its maximum
over all blocks:

- depth: composition depth, the longest chain of organism / pattern / part references (a ui primitive counts as one
  level);
- comps: distinct components reached transitively;
- nodes: component nodes in the organism view;
- props: props of the organism;
- lines: lines of the generated Svelte block;
- variants: variants in the block spec.

| # | block (organism) | depth | comps | nodes | props | lines | variants | score |
|---|---|---|---|---|---|---|---|---|
| 1 | `hero` (HeroClassic) | 4 | 27 | 18 | 12 | 136 | 17 | 89.4 |
| 2 | `product` (ProductDetail) | 4 | 23 | 25 | 11 | 149 | 5 | 80.1 |
| 3 | `authpage` (AuthLayout) | 5 | 21 | 13 | 12 | 131 | 9 | 77.5 |
| 4 | `shell` (AppShell) | 5 | 29 | 17 | 10 | 131 | 4 | 77.1 |
| 5 | `cta` (CtaBand) | 4 | 27 | 15 | 10 | 111 | 12 | 76.9 |
| 6 | `auth` (AuthCard) | 4 | 15 | 25 | 12 | 121 | 8 | 76.7 |
| 7 | `templates` (TemplateGrid) | 4 | 18 | 24 | 12 | 142 | 4 | 76.2 |
| 8 | `contact` (ContactForm) | 4 | 22 | 21 | 11 | 119 | 6 | 74.4 |
| 9 | `sitemap` (SitemapFooter) | 3 | 20 | 23 | 11 | 136 | 7 | 74.2 |
| 10 | `navbar` (NavBar) | 4 | 17 | 19 | 10 | 142 | 7 | 72.4 |

Screenshots (local only, `shots/` is never committed): `shots/complex-blocks/<block>.png` for ranks 1-8. Each shot
is the default variant, svelte, viewport 1600, light mode, cropped to the variant body of the gallery (1120 px wide).
Dark versions: `hero-dark.png`, `product-dark.png`, `authpage-dark.png`.

### 7.2 Counts

Source = what a change edits: `specs/ui/*.variants.json`, `specs/recipes/*.variants.json` and
`xgen/screens/src/authoring/**`. Mirrors = the generated organism / part / pattern / preset JSON (they follow the
source after `xgen build`).

| category | source hits (files) | mirrors | tokens in the source |
|---|---|---|---|
| A1 corners: radius scale, `-full`, arbitrary | 163 (55): ui 60, recipes 24, authoring 79 | 90 in 54 files | `rounded-full` 36, `rounded-xl` 36, `rounded-lg` 25, `rounded-2xl` 21, `rounded-md` 19, `rounded-sm` 9, `rounded-4xl` 8, range track / thumb `rounded-full` 4, `rounded-t-md`, `rounded-b-xl`, `rounded-3xl`, `rounded-b-3xl` |
| A2 `rounded-none` | 4 (4) | 2 | media-frame `square`, dialog `sheet`, backdrop images in frames.ts / nav.ts |
| A3 plain `rounded` (target) | 31 (10) | 7 | button / badge / input / select size compounds, avatar, switcher |
| B gradients | 0 | 0 | none; already blocked by 4 checks (blocks, recipes, spec test, e2e computed style) |
| C1 `divide-*` | 0 | 0 | none |
| C2 coloured border accents | 2 (2) + 3 thick widths | 3 | `border-y-2 border-primary` (section-frame `tone: accent`), `border-b-2` + `border-primary` on the current link (commerce.ts categories `layout: bar`), `border-l-4 border-border` (guide.ts article quote: neutral colour, accent width) |
| C3 coloured inset-ring | 14 (11) | 19 (16 are the `parts/pill` status palette, kept) | `inset-ring-primary` 6 (button / badge / card fill-matched edge, checked checkbox / radio / switch), `focus-visible:inset-ring-ring` 3 (input, select, textarea), `inset-ring-background/30 /20` 3 (hero on dark bands), `inset-ring-destructive` (alert), `inset-ring-foreground` (button dark) |
| C5 colour separators | 2 options | - | Separator `variant: muted` (`bg-muted`) and `strong` (`bg-foreground`); no spec uses them |
| N neutral borders (kept) | 171 (48) | 118 | `inset-ring` 57 + `inset-ring-border` 56, `border-border` 19, `border-t` 11, `border-b` 8, `inset-ring-transparent` 11, `bg-border` 3 (Separator, hairlines) |
| D1 outer ring accents | 10 (4) | 6 | `ring-2 ring-primary ring-offset-2 ring-offset-background` (tour target, guide.ts), `ring-2 ring-primary` (feature-sticky active card, showcase.ts), destructive focus tint (button / badge, functional) |
| D2 shadows | 16 (13) | 8 | `shadow-xs` 7 (active icon-tab, nav-item, switcher-item, badge-square, smartbox, card `raised`, search-field), `shadow-lg` 3 (dialog, notice toast, video modal), `shadow-sm` 2 (button `dark`, navbar `pill`), `shadow-md` (tour callout), `focus:shadow` 3 (skip links) |
| D3 opacity | 14 (12) | 6 | `disabled:opacity-50` 8 (functional, kept), product thumbs `opacity-100/80/60`, chart muted bars `opacity-30`, backdrop images `opacity-30/40` |
| D4 colour alpha `/NN` | 23 (13) | 19 | `bg-muted-foreground/40` 5 (pager / step / code-window dots), `bg-background/10 /15 /20 /90` 8 (buttons on inverse hero / nav bands, before-after label), `text-background/70 /80` 3 (inverse bands), `bg-destructive/60 /90` 4 (shadcn destructive), `backdrop:bg-foreground/20` (dialog scrim, functional) |
| D5 blur / backdrop filter / blend | 0 | 0 | none |
| D6 motion | 9 (6) | 6 | centring `-translate-*-1/2` 5 (functional), hero media `-translate-y-4`, `transition-colors` (button), skeleton `animate-pulse` |
| D7 decorative dots | 7 strings | 3 | testimonials carousel dots, wizard step dots, code-window traffic lights (visuals.ts, patterns/code-window), timeline status dots (parts.ts) |
| CSS assets | - | - | `kit.css`: radius `9999px` (radio dot, switch knob), `4px` (progress value), knob `box-shadow`, unused utilities `edge-over` and `spin-once`; `theme.css`: radius scale `--radius-sm..4xl` |

Source files per category:

- A1: ui alert, badge, button, card, checkbox, dialog, disclosure, fieldset, iconbadge, image, input, meter, progress,
  radio, range, select, skeleton, switch, textarea (19); recipes avatar, badge-square, dropdown-menu, icon-tab,
  media-frame, nav-item-content, nav-item, smartbox, switcher-item, switcher (10); authoring blocks/account, commerce,
  content, dashboard, guide, landing, marketing, navigation, pricing-more, promo, showcase, signup, site, templates,
  workspace; components/features, footer, frames, hero-components, marketing, nav, parts, patterns, visuals;
  presets/default-preset; ux (26).
- A2: recipes/media-frame, ui/dialog, authoring components/frames, components/nav.
- C2 / C4: recipes/section-frame, authoring blocks/commerce, blocks/guide.
- C3: ui alert, badge, button, card, checkbox, input, radio, select, switch, textarea; authoring components/hero-components.
- C5: ui/separator.
- D1: ui badge, button; authoring blocks/guide, blocks/showcase.
- D2: recipes badge-square, icon-tab, nav-item-content, smartbox, switcher-item; ui button, card, dialog; authoring
  blocks/guide, navigation, site; components/hero-components, parts.
- D3: ui button, checkbox, input, radio, range, select, switch, textarea; authoring blocks/commerce, components/frames,
  nav, parts.
- D4: recipes/section-frame; ui badge, button, dialog, iconbadge; authoring blocks/landing-hero, marketing, showcase,
  signup; components/hero-components, nav, parts, visuals.
- D7: authoring blocks/marketing, signup; components/visuals, parts; patterns/code-window (mirror).

### 7.3 Public options that would go (breaking)

Corners:

- Button `shape` (pilled, rounded), Badge `shape` (pilled, rounded), Input `shape`, Select `shape` (pilled, rounded),
  Textarea and ButtonLabel `shape` (already empty): drop the prop, plus the per-size radius compounds.
- Avatar `corner` (circle, rounded); Skeleton `shape: circle`; Image `variant` avatar / rounded / thumbnail (collapse
  to one, keep the border as `bordered` if wanted).
- MediaFrame `shape` (card, square, circle); Switcher, SwitcherItem, NavItem `shape` (pilled, rounded).
- Disclosure `variant` default / card (radius `4xl` closed, `2xl` open), Fieldset `variant: card`, Checkbox and
  IconBadge size radii (classes only, no option goes).

Decoration only:

- Card `variant: raised` (only a shadow); the shadow of Button `variant: dark`.
- Separator `variant: muted` and `strong` (colour separators).
- SectionFrame `tone: accent` (`border-y-2 border-primary`). Block variants that use it: announcement accent / agency,
  cta band / saas, faq, features, hero accent / agency, logos, newsletter, pricing accentRoomy, products showcase,
  stats, steps columnIcons, templates, testimonials accent.
- CtaBand `backdrop: pattern` (PatternLayer, dotted SVG texture) and the PatternLayer pattern itself.
- NavBar `layout: pill` (floating pill: `rounded-full`, `shadow-sm`).
- Testimonials `dots: show`, Wizard `progress: dots`, the code-window traffic-light dots.
- Possibly Sitemap `wordmark: giant` (big decorative wordmark) and the product thumbnails' falling opacity.

### 7.4 Risky cases

Plain `rounded` in Tailwind v4 is the theme key `--radius`. Our theme puts the shadcn `--radius` in `:root`, not in
`@theme`, so `rounded` resolves to the Tailwind default 0.25rem (4 px). The 10 px of the theme does not apply. A radius
of 4 px keeps anything 8 px or smaller round (timeline and pager dots stay circles); larger discs become rounded squares.

| case | today | with plain `rounded` | proposal |
|---|---|---|---|
| avatar (Avatar `corner: circle` default, Image `avatar`, templates / dashboard initials discs) | circle | rounded square | accept rounded squares; drop `corner`. Alternative: keep `rounded-full` for Avatar only, documented as the one shape exception |
| icon discs (features `size-20`, parts empty / search `size-12 / size-8`, marketing steps `size-10`, dashboard markers `size-6 / 8`) | `rounded-full bg-*` | rounded tile | accept; route them through IconBadge (already a square tile) so there is one icon-tile primitive |
| switch knob (`kit.css` `switch-knob` 9999px, track `rounded-2xl`) | pill track, round knob | square track with round knob looks broken | track `rounded`, knob radius `max(1px, 4px - var(--pad))` (concentric); review visually. Alternative: keep the switch round as a functional exception |
| radio dot (`rounded-full` input, `radio-glyph` 9999px) | circle | indistinguishable from a checkbox | keep the radio round: the circle is the meaning (single choice), not decoration; document it as the only allowed `rounded-full` with avatar if chosen |
| spinner | no spinner primitive; `kit.css` has an unused `spin-once` keyframe | n/a | remove `spin-once`; a future spinner uses the Lucide `loader-circle` icon with `animate-spin` (shape from the icon) |
| progress / meter (`rounded-sm` track, value `4px` in `kit.css`), range track `rounded-full h-1.5` | rounded ends | same look (4 px radius on 2-6 px bars clamps to round ends) | switch to `rounded` and keep the 4 px value in `kit.css` as the plain radius; no visual change |
| range thumb `size-3.5 rounded-full` | circle | rounded square | accept, or keep the native thumb (`accent-primary` is already set) |
| play buttons over media (guide, showcase `size-12 rounded-full`) | circle | rounded square | accept |
| pill chips and pill nav (commerce filters, promo / hero badges, frames eyebrow, navbar `pill`) | pill | 4 px chip | accept; drop the navbar `pill` layout |
| status dots (timeline `size-2.5`, pager `size-2`) | circle | near circle (4 px on 8-10 px) | keep; or drop the decorative ones (D7) |

### 7.5 Proposed change list (for approval, all breaking, through specs / authoring)

Status after the owner's decisions (2026-10-06): [x] done, [-] not done on purpose (reason in 7.6).

1. [x] Plain `rounded` = the theme radius, 10 px: `--radius: 0.625rem` moved from `:root` into `@theme` in `theme.css`.
2. [x] Every A1 class replaced with `rounded`; `rounded-none` kept only for the sheet dialog and full-bleed pictures;
   `corners` check added. [-] The radius scale `--radius-sm..4xl` stays in `theme.css` (shadcn parity; no spec reads it).
3. [x] Public corner options removed; block variants and samples migrated.
4. [x] Decoration-only options removed; block variants dropped or folded (list in 7.6).
5. [x] Coloured and thick accents replaced with neutral ones.
6. [-] Shadows: not part of the approved list; unchanged except the shadow of Button `dark` (removed).
7. [-] Opacity tricks: not part of the approved list; unchanged.
8. [x] `kit.css`: `edge-over` and `spin-once` removed; radio dot and switch knob stay round (exceptions).
9. [x] Visual re-baselined once (all 402 states changed); e2e facts for dots, the pill layout and the texture removed.

### 7.6 Applied: one corner token, no decoration-only options (ui8kit 2.0, breaking)

Commits on `codegen`: `87fa7c0`, `a0d8f9b`, `9a19ec3`, `fa87b2f` (and the docs commit that holds this section).

**Corners.** Plain `rounded` is `border-radius: var(--radius)`; the theme sets `--radius: 0.625rem` in `@theme`
(checked in the browser: a `.rounded` element computes to 10 px). One token changes every corner of the kit.

- `rounded-full` is allowed only for the radio control, the switch (track; the knob is `kit.css`), Avatar (always round),
  the timeline status dot, the avatar skeleton, and the six avatar pictures drawn with a MediaFrame (quote card x2,
  review list, profile form, post header, sidebar user).
- `rounded-none` only for functional resets: the dialog `sheet` (fills the screen) and the backdrop / over-media pictures
  (edge to edge, not framed).
- Checkbox: its corner is `calc(var(--radius) * 0.4)` in `kit.css` `checkbox-glyph` (4 px on the 16-20 px box), still
  read from the one token; with the full 10 px a checkbox would look like a radio.
- Progress / meter value: `var(--radius)` instead of `4px` in `kit.css`.
- Guard: the `corners` group of `xgen check` reads every spec folder (ui, recipes, parts, patterns, organisms, blocks,
  screens, presets). It fails on any `rounded-*` other than `rounded-full` / `rounded-none`, and on any `rounded-full` /
  `rounded-none` beyond the count in `CORNER_ALLOW` (`xgen/check/src/audit-rules.ts`, one `why` per file; a count that
  drops must be lowered). In `kit.css` a `border-radius` must use `var(--radius)` (or `inherit`); only `radio-glyph` and
  `switch-knob` may use `9999px` (`KIT_RADIUS_ALLOW`).

Counts (source = ui / recipe variant tables and authoring; mirrors = generated organism / part / pattern / preset JSON
and brick JSON):

| | before (`554c466`) | after |
|---|---|---|
| non-plain corner classes, source + mirrors | 260 (167 + 93) | 23 (13 + 10): only `rounded-full` and `rounded-none` |
| of which radius scale, side-specific or arbitrary | 184 (123 + 61) | 0 |
| `rounded-full` | 70 (40 + 30) | 18 (10 + 8) |
| `rounded-none` | 4 + 2 (incl. MediaFrame `square`) | 3 + 2 (sheet, backdrop pictures) |
| plain `rounded` | 49 (40 + 9) | 184 (103 + 81) |

**Removed options (breaking).**

Corner props (11): `shape` on Button, Badge, Input, Select, Textarea, ButtonLabel; Avatar `corner` (always round);
MediaFrame `shape` (card, square, circle); `shape` on Switcher, SwitcherItem, NavItem (and the nav-item-content recipe key).
Avatar pictures that used MediaFrame `shape: circle` pass `className: "... rounded-full"` (allowlisted).

Variant values (12): Skeleton `circle` (avatar skeletons keep `rounded-full` by class); Image `avatar`, `rounded`,
`thumbnail`; Card `raised`; Card `accent`; Separator `muted`, `strong`; `tone: accent` (SectionFrame recipe, the shared
block `tone` axis, HeroClassic, AnnouncementBar, NewsletterForm); Backdrop `kind: pattern`; NavBar `layout: pill`;
SignupWizard `progress: dots`.

Other props, specs and CSS: SectionBox `variant`; CtaBand `backdrop`; TestimonialGrid `dots` and its `go` event (nothing
emitted it); SitemapFooter `wordmark` (giant was one of seven variants, not the only one); the PatternLayer pattern and
its dotted tiles (`placeholders.ts`); the shadow of Button `dark`; `kit.css` `edge-over` and `spin-once`.

Accents made neutral: commerce categories bar current link (`border-b-2 border-primary` -> `border-b border-foreground`),
guide article quote (`border-l-4` -> `border-l`), tour target (`ring-2 ring-primary ring-offset-2` -> `inset-ring-foreground`
on the outline button), feature-sticky active item (`ring-2 ring-primary` -> `inset-ring inset-ring-foreground`).
Kept: the pill and timeline status palettes, the destructive variants, fill-matched `inset-ring-primary` (button, badge,
checked controls), `focus-visible:inset-ring-ring`, the hero `inset-ring-background/30` on dark bands.

Icon discs are IconBadge tiles (plain `rounded`): features icon (new IconBadge `variant: primary`, `size: xl` = size-20),
empty state (`lg`), stat card (`sm`), template avatar (`sm`), steps marker (`primary`), dashboard checklist (`xs`) and
stepper (`sm`, `primary` when done, `outline` otherwise). Play buttons and range thumb / track are plain `rounded`.

**Block variants (337 -> 327).** Removed because they became identical to another variant (same row of axes) or showed
only a removed option:

| removed | now the same as / reason |
|---|---|
| `announcement.accent` | `announcement.bar` |
| `newsletter.accent` | `newsletter.stacked` |
| `features.accent` | `features.grid` |
| `hero.accent` | `hero.blog` (centered, compact) |
| `hero.agency` | `hero.twoActions` (its case copy `cases.agency.hero` removed with it) |
| `cta.pattern` | `cta.band` (band, roomy) |
| `testimonials.carousel` | `testimonials.single` (the carousel itself is the Carousel port contract) |
| `navbar.pill` | layout removed |
| `sitemap.giant` | wordmark removed |
| `wizard.dots` | progress removed |

Renamed (the accent tone gone, the rest of the row still unique): `faq.accent` -> `faq.roomy`, `pricing.accentRoomy` ->
`pricing.roomy`, `logos.accent` -> `logos.tiles4`, `stats.accent` -> `stats.cardsCompact`, `templates.accent` ->
`templates.roomy`, `testimonials.accent` -> `testimonials.noRating`. Changed in place: `announcement.agency`, `cta.band`,
`cta.saas`, `steps.columnIcons`, `products.showcase` (tone dropped), `wizard.second` (now the list progress, step 2, no card).
Theme screens and the coverage registry point at the remaining variants (`hero.accent` -> `hero.muted`,
`features.accent` -> `features.tiles4`, `cta.pattern` -> `cta.band` / `cta.form`, `testimonials.carousel` ->
`testimonials.single`, `logos.accent` -> `logos.tiles4`, `announcement.accent` -> `announcement.badge`,
`wizard.dots` -> `wizard.list`, `navbar.pill` dropped, footer `sitemap.giant` -> `sitemap.columns`).

A DOM comparison of every variant body in the gallery finds one more pair with the same markup: `sidenav.dense` and
`sidenav.full`. It predates this change (the 8 px grid pass gave both densities `gap-2 py-2`) and is left for the
control size review.

**Not changed on purpose.** Shadows (plan step 6) and opacity tricks (step 7) were not in the approved list; the
code-window traffic-light dots were not listed either. The AnimatedBackdrop contract keeps its `tone` union (a port
contract, not a block axis). The radius scale tokens stay in `theme.css`.

**Gates.** build, check (new `corners` group; hardcode allowlist unchanged, no count moved), test (75), typecheck,
build:hosts, e2e, lint:px 79 blocking (ratchet lowered 80 -> 79). Visual: 402 of 402 states changed and were
re-baselined on purpose; a second run against the new baseline is pixel-identical.

Screenshots (local only): `shots/complex-blocks-simple/<block>.png` for hero, product, authpage, shell, cta, auth,
templates, contact; `hero-dark.png`, `product-dark.png`; `profile.png` (switch and avatar picture in a block);
`controls-light.png` / `controls-dark.png` (radio, switch, checkbox, avatar, icon tile, button, card with the built kit CSS:
no block uses the Radio primitive).

## 8. Polish round: round badges, shadows only on floating layers, one control scale (ui8kit 2.0, breaking)

Commits on `codegen`: `17133031` (A, B), `ddd01e73` (C4), `175fa07f`, `6118209b`, `d71be5b8` (C), and the docs commit
that holds this section. Everything was changed in specs and authoring, then regenerated.

### 8.1 A: badges are pills

- `Badge` base `rounded` -> `rounded-full`; sizes are `sm / default / lg` (`h-5 / h-6 / h-8`, text-xs, xs, sm).
- The status pill part (`parts/pill`) and the hero badge (`organisms/hero-badge`, a pill around a `Badge` mark) are
  `rounded-full` too. The section badge of `SectionFrame` and the hero badge mark are now real `Badge`s (outline lg,
  secondary sm) instead of their own class strings.
- `CORNER_ALLOW` gained the three files, each with a reason. Buttons, inputs and cards stay plain `rounded`.
- `rounded-full` occurrences (source + mirrors): 18 (10 + 8) -> 23 (13 + 10).

### 8.2 B: shadows

| | before | after |
|---|---|---|
| `shadow-xs` on flat surfaces (switcher item, nav item, icon tab, badge square, smartbox, search field) | 6 | 0 |
| `focus:shadow` on the skip links | 3 | 0 (`focus:inset-ring focus:inset-ring-border`) |
| canary preset arbitrary inset shadows | 2 | 0 (canary preset removed, its classes folded into the standard ones) |
| `kit.css` drop shadows (switch knob, smartbox focus) | 2 | 0 (the knob was checked in light and dark: it reads fine flat) |
| `shadow-lg` (dialog / sheet, video modal, the fixed corner notice) | 3 | 3 |
| `shadow-md` (dropdown menu, tour callout) | 1 | 2 (the dropdown menu gained it) |

- The kit's custom shadow names left `cn` (plain `twMerge`, no extended class groups).
- Guard: the new `shadows` group of `xgen check` reads the same spec folders as `corners`. Only `shadow-md` and
  `shadow-lg` exist (`SHADOWS`), only in the files of `SHADOW_ALLOW` (`xgen/check/src/audit-rules.ts`, exact count and a
  `why` each: a dialog or sheet floats over the page, a popover callout, a menu, a toast fixed to the corner). Any other
  `shadow-*`, `drop-shadow-*`, `inset-shadow-*` or arbitrary shadow fails. In `kit.css` a `box-shadow` may only draw a ring
  (`0 0 0 ...`), read `var(--tw-*)` or be `none`.

### 8.3 C: polish (each change small; the breaking ones are marked B)

1. Code window: the three traffic-light dots are gone; the header is the title only (`px-4 py-2`).
2. Opacity and alpha: `disabled:opacity-50` kept. Product thumbs no longer fade (100/80/60 %); the chosen one has an
   outer `ring-2 ring-foreground`. Muted chart bars are `bg-muted-foreground` instead of `bg-primary opacity-30`. The form
   field label (`text-foreground/80`) and the showcase caption (`bg-background/90`) are at full strength. Kept: the
   backdrop pictures at `opacity-30/40` and the alphas on the inverse band (see questions); the ring on the band is one
   value now (`inset-ring-background/30`, the composer had `/20`).
3. `sidenav.dense` was the same DOM as `sidenav.full` (both `gap-2 py-2`): dense now drops the gap between rows. Seven
   other no-op density branches (`cond(compact, "p-4", "p-4")` and alike in content, commerce, guide, showcase) became
   plain classes. A DOM comparison of every gallery variant finds no identical pair.
4. Control, icon and type scale (B): see 8.4.
5. Chips: the prompt composer attachment chip, plus, model and send controls and the hero topic chips are `Button`s
   (ghost / outline / secondary, sm, icon layout where square, icons 16) instead of styled links with their own heights,
   paddings and a 12 px icon tile; the hero `pill` class constant is gone. The hero badge mark is a `Badge` (8.1). The
   hero badge width is `w-48` so its label stays on one line.
6. Visual gate: `xgen visual` shoots every state in light and dark (402 -> 804 states; a dark state is the light name
   plus `__dark`).
7. Duplicates, dead values and stray spacing:
   - Removed variant values that were empty or equal to another (B): Card `kpi`, `flat`; Checkbox and Radio `outline`;
     Input, Select, Textarea `outline`; Dialog size `sm` (= default `w-70`); Button `dark` (unused, = default in the
     neutral theme, and its name clashes with the dark theme); the whole Switch `variant` axis and Disclosure `size` axis
     (every value empty). Card `Variant` docs list the real values.
   - Preset text keys: `micro` (unused) and `caption` (= `tiny`, text-xs) folded into `tiny` (B for custom presets).
   - Switcher scrolls sideways when its tabs are wider than the screen (blog topic filters at 390 px).
   - On the grid: product badge `left-4 top-4`; landing CTA button at the lg control height (was `h-15`); templates row
     `h-8`; search palette icon and shortcut centred in its `h-8` input (`top-2`, `right-2`; the icon sat 2 px low); pager
     ellipsis as wide as a page number (`w-8`); composer model `gap-2`.
   - The canary preset import and its `canary` reader are gone (presets: `defaults` only).

### 8.4 Control, icon and type scale (breaking)

| spec | before | after |
|---|---|---|
| Button, ButtonLabel size | `16 20 24 28 32 40 48 60` + `sm default lg` | `sm default lg` = `h-8 / h-10 / h-12`, text-sm / sm / base; icon buttons `size-8/10/12` with 16/20/24 icons |
| Input, Select size | `xs sm default lg xl` | `sm default lg` = `h-8 / h-10 / h-12`, text-xs / sm / base |
| Textarea size | `xs sm default lg xl` | `sm default lg` = `min-h-16 / 20 / 24` |
| Badge size | `16 20 24 32` + `sm default lg` | `sm default lg` = `h-5 / h-6 / h-8` |
| Avatar size | `12 16 20 24 32 40 48 60` | `xs sm default lg xl` = 24 / 32 / 40 / 48 / 64 px |
| Switcher, SwitcherItem size | `24 32 40 48 60 76` | `sm default lg` (`h-8 / h-10 / h-12` track, `h-6 / h-8 / h-10` items) |
| SectionHead size | `36 44` | `default lg` (`h-8`, `h-12`) |
| BadgeSquare size | `16 20` | `sm default` |
| Icon size | `xs sm default md lg xl` | `xs default md lg` = 12 / 16 / 20 / 24 (12 only inside dense controls) |
| LucideIcon sizes used | 12 14 16 20 24 32 | 12 16 20 24 |
| Text size | `8 9 10 11 12 13 14 15 16 20 24 36 48` | `12 14 16 20 24 36 48` (text-xs is the floor) |
| Title size | `15 16 20 24 36 48` | `16 20 24 36 48` |
| Progress, Meter | `h-0.5 ...` | `sm default lg` = `h-1 / h-2 / h-3` |
| labels, form description / message, alert | 10-11 px arbitrary | text-xs |

Before this round Button sizes set no text size: 277 of 322 buttons in the gallery inherited 16 px from the page; they
now get text-sm (lg: text-base) from the size, as in shadcn.

### 8.5 Counts and ratchets

| | before the round | after |
|---|---|---|
| ui8px blocking (UI8PX001 + GRID), `.ui8px/gate.json` max | 79 | 25 (74 after A/B, 54 after C4) |
| `hardcode` allowlist (`HARDCODE_ALLOW`) | 24 files | 2 files (pill 48 status colours, timeline 4 dots) |
| shadow classes in specs | 15 (6 xs, 3 lg, 1 md, 3 focus, 2 arbitrary) + 2 in kit.css | 5 (3 lg, 2 md), 0 in kit.css |
| identical variant pairs in the gallery | 1 (`sidenav.dense` = `full`) | 0 |
| visual states | 402 (light) | 804 (light + dark) |

ui8px scopes: `ui/icon`, `patterns/nav-item-row` and `organisms/search-palette` moved into the controls scope (icon
sizes and input adornments are controls, like `search-field` already was). The 25 remaining hits:

| hits | where | why kept |
|---|---|---|
| 12 | plans screen `-mx-3` on the sortable column headers | the shadcn data-table idiom: a ghost sm button pulled out by its own padding so its text lines up with the column |
| 4 | before-after `mt-1` | puts a 16 px icon on the first 24 px text line |
| 3 | `inset-ring-background/30` (hero badge, composer, topic chips) | the ring on the inverse band; no semantic token for it (question 2) |
| 3 | timeline `w-3 mt-1.5 size-2.5` | status dot centred on the first text line (an allowed round exception) |
| 2 | feature cells `gap-px p-px` | 1 px hairline grid |
| 1 | post-card `inset-x-12` | not spacing: the title inset over the cover |

### 8.6 Questions for the user

1. Text and Title size keys are still pixel-named Tailwind steps (`12 14 16 20 24 36 48`). Rename them to t-shirt names
   (`xs sm base lg xl 4xl 5xl`)? It touches every text node of the authoring.
2. The inverse band (hero, CTA) uses alphas of `background` for rings and hover fills, and backdrop pictures sit at
   `opacity-30/40` for legibility. Keep, or add semantic tokens (for example `--band-ring`)?
3. `ButtonLabel` adds its own `px-2/3` inside the Button padding and is used once. Fold it into Button (and drop it)?
4. Buttons are `font-bold`; shadcn uses `font-medium`. Keep the heavier weight?
5. Input `sm` is text-xs while Button `sm` is text-sm (shadcn has text-sm for both). Align them?
6. The product card leaves a tall empty band between the picture and the text in the 3-column grid. Tighten it?

### 8.7 Decisions on the questions (applied)

Commits: `071b71c1`, `63f468a3` (and the docs commit that holds this part).

1. **Type scale names (B).** Text and Title `Size` take the Tailwind names `xs sm base lg xl 2xl 3xl 4xl 5xl`
   (plus `inherit`). Map: `12 -> xs`, `14 -> sm`, `16 -> base`, `20 -> xl`, `24 -> 2xl`, `36 -> 4xl`, `48 -> 5xl`. No
   size sat between two steps this time (the in-between ones were rounded in 8.4: `10 -> 12`, `13 -> 14`, `15 -> 16`,
   and `8 / 9 / 11` were gone); `lg` and `3xl` are new. All authoring was migrated, including the `muted / strong /
   heading` helpers (179 call sites). The rename alone was pixel-identical over the 804 visual states.
2. **Inverse band and backdrops:** kept as they are, no new tokens.
3. **ButtonLabel removed (B).** It was used once (the pager "more" button) and its `px-2/3` doubled the Button padding;
   the spec, its recipe and the one-time author tool entry are gone. Bricks / parts: 39 / 69 -> 38 / 68.
4. **Weights (B, visual).** Button `font-bold -> font-medium`; Badge `font-semibold -> font-medium` (in the base), the
   status pill and the count badge (`badge-square`) follow.
5. **Fields.** Input and Textarea `sm` and `default`: `text-base md:text-sm` (shadcn: 16 px on phones so iOS does not
   zoom, 14 px from `md`), `lg`: `text-base`. Responsive classes are static CSS, so this fits the fixture model. Select
   follows the shadcn SelectTrigger: `text-sm` (`lg`: `text-base`). The fields drop `font-semibold` (shadcn has none).
6. **Product card.** The tall band was the Card `gap-8` plus a CardContent `p-4`: the card now has `gap-4` and the body
   no own padding, so the text starts 16 px under the picture. The post card had the same shape and got the same fix.

Leftovers of the same kind (each small):

- Card pads once. Card is `p-6` (compact `p-4`), but CardHeader, CardContent and CardFooter added `px-6` and many
  CardContent uses added `p-4` / `p-6` on top. The parts lost `px-6`; CardContent in the product, post, cart, order,
  landing CTA, promo, bento / showcase, before-after and credit pack cards lost its padding; where the padding followed
  `density`, the card takes `gap-4 p-4` for compact.
- Buttons no longer override the text size or weight of their size: the hero band (login, CTA, composer chips, topic
  chips), the templates filter and browse buttons, the landing CTA button, the plans sort headers.
- Text / Title take their size and weight from the props, not from a second class: the post overlay title
  (`Size: xs`), the site section title (`Size: sm`), the CTA title (`Size: 3xl`, the preset no longer adds `text-3xl`),
  the stat figure and the CTA title (a repeated `font-*` class).
- Kept on purpose: display titles above the scale (`text-6xl` / `text-8xl` of the display section header, the 404
  figure) and the responsive stat figure (`text-4xl md:text-6xl` in the preset).

Gates: build, check, test (76), typecheck, build:hosts, e2e, lint:px 25 (no increase); visual: all 804 states changed (button and badge weight) and were re-baselined on purpose
(804 states, light and dark), and a second run against the new baseline is pixel-identical.

Applied next (on `codegen`):

- Credit packs `rows`: the badge sits next to the title and price (one left cluster), the buy button stays on the right;
  `justify-between` no longer pushes the title into the middle when a badge is present.
- Links (section actions, brand, hero nav, Link size `sm`): `font-bold` -> `font-medium`, matching buttons.

Applied next (on `codegen`), breaking change: `Stack` / `Group` `Gap` keys are Tailwind steps.

- `Gap` keys renamed from pixel names to the Tailwind step they set: `0 -> 0`, `8 -> 2`, `16 -> 4`, `24 -> 6`,
  `32 -> 8`, `40 -> 10`, `48 -> 12`, `auto` unchanged (`Gap "4"` = `gap-4`). A pure rename: every key keeps its class,
  so the rendered output is unchanged (visual: all 804 states pixel-identical against the previous baseline, no
  re-baseline).
- Migration: 169 `Gap` props in authoring (`xgen/screens/src/**`), 3 of them `cond(compact, ...)` expressions
  (`app-main`, `showcase`, `dashboard`); in the spec mirrors that is 85 `Group` and 82 `Stack` nodes. Consumers that
  pass `gap="16"` must pass `gap="4"`.
- Other layout spacing options: none are pixel-named. `Grid` has no gap option (gap goes through `Class`), and there is
  no `SectionFrame` padding option. The dropdown-menu `width` (`240` = `w-60`) and smartbox `width` (`400` = `w-100`)
  options are widths, not spacing, and are left as they are.
- New `spacing` group of `xgen check` (`xgen/check/src/spacing.ts`): a numeric key of a spacing axis (`gap`, `padding`,
  `margin`, `space`, `inset`) in a ui or recipe variant table must equal the Tailwind step its classes set; the old
  pixel tables fail it.

## 9. Layout audit (host-svelte, at `1186ddab`; applied in `11f736a9` and after)

How: headless Chrome over the 13 screens (57 routes, `plans/:id` as `plan-team`) and the 62 block pages (327
variants) at 1600, 768 and 390 px, light (363 page loads per width set). DOM measurements per section: container width
and left/right margins, sideways scroll of the page and of each section, `details > summary` without an indicator,
popup triggers without a chevron, clipped short labels, zero-size or broken images and icons, card rows of unequal
height and buy buttons not on one line, tables wider than their box, headings aligned against their content, line
height under the font size. Then the full-page shots of the worst suspects were read by eye (1600 and 390).

Found: 36 issues (counted once per root cause and place), by type: disclosure indicator 4 sites (168 summaries),
container width 7 organisms / 1 screen, alignment 3, card rows 2, line height 1 (23 pages at 390), mobile nav 1
(10 theme screens), contrast 1, orphan row 2; 5 left (below).

| Block / screen | Width | Issue | Cause | Fix |
| --- | --- | --- | --- | --- |
| FAQ (all 6 variants), every theme FAQ, site pricing; Accordion (4); Checklist `expand`; onboarding task details | all | accordion items have no open/close indicator (168 summaries) | spec: the `Summary` brick rendered only its children | `Summary` renders a Lucide chevron-down (`data-slot="summary-indicator"`, kit.css mask) that turns over on open with `group-open:rotate-180`; no script |
| Category nav (5), Profile (4), Activity (4), Chart (4), CTA `row`, Plans screen; commerce and dashboard screens | 1600, 768 | content box `max-w-5xl` (1024 px) while its siblings use `max-w-6xl` (1152 px): narrower, left edge 64 px in from the heading above | authoring: organisms drew their own container | they use the shared `wide` container of `frames.ts` (`mx-auto w-full max-w-6xl px-4`); `compose.ts` imports the same constant |
| Stats `stack` | all | figures in a centered `max-w-xs` column but aligned start: neither under the heading nor in the middle | authoring | the column is `mx-auto` only when centered; `text-center` only when centered |
| Stats `plain3` / `cards` | 1600, 768 | four figures in three columns: one card alone on a second row | authoring (variant data) | `panel` (was `plain3`): four figures in four columns; `cards`: three figures in three columns |
| Stats (all) | 768, 1600 | figure + label overflow the fixed `h-28` column at md (116 > 112 px) | preset | `min-h-28` |
| Credit packs `tiles4`, `tiles2`, `muted`; pricing `usage` page | 768, 1600 | buy buttons not on one line when a tile has a badge | authoring | the tile button takes `mt-auto` |
| Contact `single`, `short`, `consent` | 1600, 768 | heading at the start, the form centered under it | authoring | the form is centered only under a centered heading (`page: full`) |
| Announcement `dismissible`, promo `notices` | all | close button in the middle of the strip, black on the primary strip (invisible) | authoring | `ml-auto` and `text-current` |
| Every theme home and page head (23 pages) | 390 | h1 `text-5xl` with `leading-7`: two-line titles overlap | authoring (SectionHeader gave the h2 leading to the h1) | `leading-tight` for level 1 |
| Nav bar (10 theme screens) | 390 | links wrap into two or three rows above the buttons | authoring | below md the links take one row of their own that scrolls sideways (`order-last w-full overflow-x-auto`, no wrap) |

Left as they are (with reasons):

- Bento `bento` / `images` / `muted`, marketing-landing developers, marketing-product home: unequal tile heights are the
  bento layout (a tall tile beside two short ones).
- Shell `panes` / dashboard workspace at 768: the two panes differ in height (384 / 336) because their content does;
  they are not cards in a row.
- Hero `prompt`: the `brief.md` chip reports 1 px of clipping (sub-pixel), not visible; the fixture shows the same file
  twice (data, not layout).
- Cookie card, newsletter, order summary, tour callout, signup: a `max-w-md` card at the start of the section, under a
  heading at the start; consistent, by design.
- Nav bar at 390: the theme button wraps under the brand when there are three actions; acceptable.

Guards (`xgen/check/src/e2e/page-checks.ts`, every page of every app in the e2e): the page does not scroll sideways;
every `[data-slot="container"]` is the shared one (`max-w-6xl`; the wide hero `max-w-7xl`) and centered in its parent
(left and right within 2 px); every `details > summary` holds a `summary-indicator`.

## 10. Skins (first test skin: `sky`)

- One CSS file per skin in `xgen/runtimes/core/assets/styles/skins/` (emitted to `packages/shared/app/src/styles/skins/`),
  imported by `skins.css` after the base theme. A skin only sets shadcn tokens under `:root[data-skin="<name>"]` (and
  its dark variant), so it is inert until `<html data-skin>` names it.
- `bootScreen` picks the skin: `?skin=<name>` in the URL, else the `VITE_SKIN` build variable, else the screen's own
  (`default`). Web fonts of a skin (`SKIN_FONTS`) load only when it is on. The neutral build (`bun run build:hosts`) is
  what e2e and visual use; the preview of host-svelte is built with `VITE_SKIN=sky`.
- Wiring: `rounded` already reads `--radius`, the body font `--font-sans`, `tracking-*` their `--tracking-*`; the skin
  derives the tracking scale from `--tracking-normal`, sets it on body, and points the shadow utilities the kit uses at
  its `--shadow-*` (Tailwind prints shadow values literally).

### 10.1 The Skins screen (`/skins/#/`) and 14 tweakcn skins

- 14 built-in presets of tweakcn (Apache-2.0, commit `a3b47b3`; `skins/NOTICE.md`): Modern Minimal, Violet Bloom, T3 Chat,
  Bubblegum, Doom 64, Amber Minimal, Supabase, Kodama Grove, Perpetuity, Cosmic Night, Claude, Mocha Mousse, Neo Brutalism,
  Notebook. `xgen/runtimes/core/tools/tweakcn-skins.ts` writes one CSS file each (tweakcn's colours, radius, fonts, shadows,
  tracking; not its spacing) and their Google fonts into `skins/skins.json`. None equals `sky`, which stays as it is.
- A tweakcn skin's rule is `[data-skin="<slug>"]`, on `<html>` or on any element: a tile previews its skin inside a page that
  wears another one. `base.css` resets such an element (font, weights, tracking, radius, shadows; zero specificity) and
  `default.css` scopes the neutral theme for the Default tile.
- The screen (`authoring/gallery/skins.ts`, `compose-skins.ts`): Skins (Default + 14), Fonts (10 Google fonts with latin and
  cyrillic subsets, checked against the css2 API: Inter, Roboto, Manrope, Montserrat, Rubik, Nunito, IBM Plex Sans, Golos Text,
  Onest, Open Sans), Radius (0, 4, 8, 12, 16 px). Static tiles with data attributes; linked from the gallery and the catalog bars.
- `runtime/skins.ts` (shared app package; preview layer, not the kit) wires the tiles and keeps the choice in localStorage
  (`xgen-skin`, `xgen-font`, `xgen-radius`). Skin: `?skin=` > stored > `VITE_SKIN` > the screen's own; picking a tile drops
  `?skin=` from the address. Font and radius: inline `--font-sans` / `--radius` on `<html>`, over any skin; a second click or
  the row's reset button goes back to the skin's own. Nothing stored: nothing changes.
- The Cyrillic specimen of the font tiles is written as `\u` escapes in the dictionary and in `content.ts`, so the sources keep
  no Cyrillic text (check group `text`).

## 11. Theme-level tokens: radius, density, shadow per element (decided 2026-10-09, built 2026-10-11 in its smallest form)

Goal: a skin can set rounding, spacing and shadow for each element type separately (badge, button, card, alert, media),
without breaking the 8+4 spacing policy or the single plain `rounded` class.

- **Radius.** Keep `--radius` as the base. Add per-element variables `--radius-badge`, `--radius-button`, `--radius-card`,
  `--radius-alert`, `--radius-media`; each defaults to `var(--radius)`. Components read their own variable; the class stays
  plain `rounded`. A skin may override any of them (for example buttons 0, cards 16, media 8). `rounded-full` stays limited
  to badges, radio, avatar, switch and status dots.
- **Density.** One parameter per element with three positions: `compact`, `default`, `comfortable`. Every position picks
  from the 8px step (and 4px only inside controls): for example `--pad-card` is 16, 24 or 32, and `--pad-button` and
  `--pad-badge` are 4, 8 or 12 on the vertical axis. No arbitrary values, so the `.ui8px` check stays valid.
- **Shadow.** Per-element `--shadow-card`, `--shadow-alert`, `--shadow-media` and so on, each defaulting to the shared
  `--shadow` scale. The rule that shadows live only on floating surfaces stays; a skin that turns a card shadow on is an
  explicit override, not the default.
- **Where it lives.** Specs and the generator, so Svelte, React and Vue inherit it. Skins stay CSS variables (HSL). The
  per-element values are part of a skin and of a Discovery/magazine style identity only when a style overrides them.
- **Consumers.** The magazine's Design system tab turns these into controls next to skin, font and radius (built, see the status below).
- **Open (decided when built).** Element list: badge, button, card, alert, media. Density positions in presets: `compact`, `default`, `comfortable`. Density does not scale type.

### Status: built (2026-10-11), smallest version, five elements only

Elements: **badge, button, card, alert, media** (`pattern.media-frame`). Nothing else (input, tabs, dialog) knows the tokens.

What exists, all in `xgen/runtimes/core/assets/styles/kit.css` (generated into every runtime's `styles/kit.css`) plus one spec change:

- **Marker.** The specs of Badge, Button (both the `<button>` and the `<a>`), Card and Alert now render `data-slot="badge|button|card|alert"` (MediaFrame already had `data-slot="media-frame"`). So Svelte, React and Vue all inherit it from `xgen/specs/ui/*.json`; the generated packages were regenerated, not edited. The recipes are untouched: the class stays plain `rounded` (and `rounded-full` on the badge); `xgen check` corners still rejects every other `rounded-*`.
- **Radius.** `--radius-badge|button|card|alert|media`. **No default is declared**: the rule reads `var(--radius-card, var(--radius))`, so an unset token is the plain theme radius and a scope that changes `--radius` (a skin, the magazine specimen) still moves every element. (A `:root` default `--radius-card: var(--radius)` would freeze the root value and ignore a nested `--radius`.) The badge is a pill, so its unset value is the pill (`revert-layer` to `rounded-full`); a badge radius token is an explicit override. Only elements that carry the plain `rounded` class follow the token, so an element a block rounds on purpose keeps its own corner. `xgen check` corners now accepts `var(--radius-<element>, ...)` in kit.css.
- **Shadow.** `--shadow-card|alert|media`: a full shadow layer written into Tailwind's `--tw-shadow` (so the inset-ring edge stays). Unset: the spec's own (none). `0 0 #0000` is "none". The rule "shadows only on floating surfaces" is unchanged: the defaults are flat, a shadow on a card is an explicit override.
- **Density.** `data-density-badge|button|card|alert="compact|default|comfortable"` on the element or any ancestor sets `--pad-*` (default = attribute absent): card padding 16/24/32 (cards with the default `p-6`); alert inline padding 8/8/16 and `--min-alert` 24/32/40; button inline 12/16/20 and `--h-button` 32/40/48 (default size); badge inline 8/12/16 and `--h-badge` 20/24/28 (default size). 8px step everywhere; the 4px steps (12, 20, 28, 20) only in button and badge. The `sm`/`lg` sizes and `icon` buttons keep their own size.
- **Default rendering is unchanged**: with no token set every rule falls through (`revert-layer`) to the utility classes. Verified pixel-identical by `xgen visual` (1188 states, light and dark, 3 runtimes) before and after.
- **Skins.** The 15 skins are unchanged; a skin may set any of these variables.
- **Consumer.** The magazine's Design system tab (plan/MAGAZINE.md): per-element radius, density and shadow controls on the specimen, the Overview preview and the Templates stage. Overrides live in the preset and the collection item (`tokens`), never in the style key.

Left out on purpose: `--radius-*` and `--shadow-*` defaults in `:root` (see above); density for input/tabs/dialog and any density that scales type; vertical padding for badge and button (their height is fixed by the size class, so density moves the inline padding and the height together); a per-element shadow for button, badge and floating layers; per-element tokens in any skin file; blocks that apply a recipe to a bare element (no `data-slot`) do not follow the tokens; the `data-slot` on those four primitives changes the DOM of every screen (not its pixels) and therefore Discovery/magazine snapshot keys, see MAGAZINE.md.
