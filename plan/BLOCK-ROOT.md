# Block root: zero findings plan

Goal: `block-root` (rule 01) at 0 in `apps/host-{svelte,react,vue}` and `packages/{svelte,react,vue}/ui`, then in
`apps/magazine`, `apps/discovery` and `packages/taste-screens`. Every fix is made in the generator or in the specs
(xgen authoring); generated files are never edited by hand (`drift`).

Model: a Block is the top-level element of a block or screen file only, with the HTML5 sectioning or landmark tag
its content means (`section`, `article`, `nav`, `aside`, `header`, `footer`, `main` once per page, `search`).
Inside it: Container, then Box, Stack, Group, Grid, List, Nav, Figure and the other kit primitives. One Block per
file and render path (exclusive branches may each hold one), never nested, never in a loop. A composite component
never opens on Block.

## Findings before (commit cee0c2e)

Per host (each of svelte, react, vue; 760 per host):

| Finding | Count | Root cause | Where it is made |
| --- | ---: | --- | --- |
| `Block nested inside Block` | 481 | generator template | `compose-kit.ts` `variantSection` (a `section` per variant inside the block page), `compose-catalog.ts` (a `section` per block of a category, per catalog section, the pages section), `compose-skins.ts` (a `section` per tile row), and the chrome `nav` inside the chrome `header` |
| `root is <Container>, not Block` | 154 | generator template | every page (area) of BlocksScreen and CatalogScreen opened on Container; the authored PlansScreen layout opened on Container (and had no `main` at all) |
| `N Block in one render path` | 119 | generator template | the variant sections are siblings in one page; the screen frame holds the chrome `header` and the `main` as siblings |
| `root is <LinkPlain>, not Block` | 3 | generator template | the skip link was the first node of the gallery, catalog and Skins frames |
| `root is <SiteHeader>, not Block` | 1 | ui block | `site-header` opens on its skip link (ui package) |
| `Block inside a loop` | 2 | generator template | gallery index topics and catalog index sections were a `section` per item |

Per ui package (each of svelte, react, vue; 81 per package):

| Finding | Count | Root cause | Where it is made |
| --- | ---: | --- | --- |
| composite opens on `Block` | 40 | component spec | parts and patterns whose root is `use("Block")`: 22 are plain `div`s (Block used as a generic wrapper), 4 open on `nav`, 2 on `figure`, the rest on `section`, `aside`, `header`, `footer` or a tag prop (frames: `section-frame`, `region`, shell parts, `hero-head`, `footer-card`, `panel`, `sidebar-panel`, `faq-help`); `stat-figure` and `backdrop`/`over-media` inherit it through a composite |
| `Block nested inside Block` | 17 | block and component specs | inner `nav`, `aside`, `figure`, `header`, `footer` regions written as Block inside the root Block (`nav-bar`, `site-header`, `site-footer`, `sidebar-nav`, `mega-menu`, `cart-drawer`, `sitemap-footer`, `video-grid`, `photo-gallery`, `article-body`, shell parts, `footer-card`, `hero-head`, `over-media`) |
| `Block inside a loop` | 13 | block and component specs | items drawn as `article`/`figure` Blocks per item (`faq-list`, `review-list`, `metric-row`, `dashboard-overview`, `video-grid`, `photo-gallery`, `article-body`, `app-main`, `faq-cards`, `hero-split-*`, `project-tiles`) |
| `root is <Container>` / `<Card>` / `<Box>` / `<LinkPlain>` | 8 | block specs | blocks that open on Container (`activity-feed`, `category-nav`, `chart-panel`, `profile-form`), on Card (`pricing-card`, `product-card`), on Box (`post-card`), on the skip link (`site-header`) |

Hand-written packages: magazine 12 (templates and the reference app open on a raw `div`), discovery 3 (parts open on
Block), taste-screens 1 (`top-bar` part opens on Block).

## Decisions

1. Screens. A screen file opens on Block. The host frame `xgen/App.*` renders the screen alone (its own
   `main#main-content` exists only on the index branch), so the screen owns the one `main` of the page. A frame
   chrome (gallery, catalog, Skins header) becomes a screen part: `ScreenSpec.parts` + a `{ part }` view node, emitted
   as `screens/<Screen>/ScreenHeader.*` by all three runtimes; it opens on `Block tag="header"` with the skip link
   inside. The screen file then opens on that part (a composite whose root is Block) and holds one Block, the
   `main`. One `main#main-content` per page holds.
2. Pages of a chunked screen (gallery, catalog, Skins) open on `Block tag="section"` (`data-testid="page"`), then
   Container. Variants, topics, categories, catalog sections and tile rows inside a page are labelled groups:
   a Stack with `role="group"` and `aria-labelledby` (the label stays announced), never a nested Block.
   The Skins screen becomes chunked so its page is a file of its own.
3. Nested navigation is the new kit primitive `Nav` (`<nav>`), as rule 01 names it; self-contained quotes and
   figures use the new primitive `Figure` (`<figure>`). Neither is a Block, so a composite may open on them.
4. A composite that only needs a `div` opens on Box (the same `div`, no landmark).
5. Landmark frames: a composite whose whole purpose is to be the landmark of a region (`section-frame`, `region`,
   the shell header, sidebar and footer, `footer-card`, `hero-head`, `panel`, `sidebar-panel`, `faq-help`) is
   declared a frame in its spec (`frame: true`) and listed in the `blockRoot` zone of the ui packages, so it is
   checked as a block file (it must open on one Block, nothing nested, nothing in a loop). This is what rule 01
   already means by "a composite whose own root is Block (a section frame)".
6. Items in loops and nested regions of blocks become Box, Stack, Figure or Nav, or a frame of their own.
7. `packages/panorama` (Three.js and canvas) is outside every rule zone and the style groups (done first).
8. A cheap HTML validity pass (html-validate on rendered pages) checks landmark nesting, one main and heading order.

## Steps

1. Panorama out of the zones and style baselines.
2. Generator: screen parts, page sections, labelled groups, chrome header parts; PlansScreen gets its `main`.
3. Kit: `Nav` and `Figure` primitives.
4. ui specs: composites to Box, Nav, Figure or frames; blocks' nested and loop Blocks; block roots.
5. Hand-written apps: magazine templates, discovery parts, taste-screens top bar.
6. Baselines rewritten after each step (counts only go down), gates: check, test, typecheck, build, build:hosts,
   lint:px, e2e (pair test across runtimes).

## Result

| Package | block-root before | after |
|---|---|---|
| apps/host-svelte / host-react / host-vue | 760 each | 0 each |
| packages/svelte / react / vue ui | 81 each | 0 each |
| apps/discovery | 3 | 0 (frame is a Box; header and the two mains are the block roots) |
| apps/magazine | 12 | 0 (templates: header part, main Block, footer part; stage moved to parts) |
| packages/taste-screens | 1 | 0 (top bar opens on the new Header primitive) |

New primitives: Nav, Figure (+FigureCaption), Article, Blockquote. Panel became a
`Box role="group"`. Backdrop / OverMedia became a picture layer inside the block root.
Screen chrome moved into a screen part (`ScreenHeader`); the gallery header wraps at
390px, which removes the pre-existing sideways scroll on blocks pages.

## HTML5 validity (xgen e2e, group html)

Every state the e2e scenarios read, in every runtime (570 states), is validated with
html-validate (`rules/html-validate.json`, recommended preset, markup-style rules off).
Errors: 0. Fixed in the generator: phrasing content in summary/button/label/span,
demo forms (method=dialog, a real submit button), unique field names, non-wrapping phone
numbers, autocomplete tokens, aria-label only on elements that take it.

Backdrop decision: the faint backdrop picture is now visible (it was hidden under the
section background before); kept as designed.

### Resolved: unique-landmark (was a warning, 1740 in states; now an error, 0)

The gallery, the catalog and the theme showcase pages show the same block in several
variants on one page, so the same section, nav or aside name repeats (for example three
cart layouts named "Your cart"). Making the names unique without changing visible text
needs a landmark-name prop (`label`) on every block whose root is a landmark, forwarded
to its frame, and set per variant by the gallery and the theme pages. Until then the rule
reports as a warning and does not fail e2e.

## Revert to the codegen tag model

The kit is back on the minimal tag-to-primitive model of `ui8kit/codegen`:

| Primitive | Tags |
|---|---|
| Block | div (default), section, article, aside, header, footer, main, nav, figure, search, hgroup |
| Box | div only (ARIA, `role="group"` included, through attrs) |
| Container | div, main, section |
| Stack | div, ul, ol |
| Group | div, fieldset, dl |
| List / ListItem | ul, ol, dl, menu / li, dt, dd |
| Title | h1 to h6 |
| Text | p, blockquote, figcaption, address, pre, and the inline elements |

Removed primitives: Header, Footer, Nav, Article, Figure, FigureCaption, Blockquote.
Stack and Group no longer render a span; the two places that did (a payment option
label, a disclosure summary) use Inline with the same classes.

Rule 01 now lets any file (block, composite, part, screen) open on exactly one Block
with a semantic tag; the detector no longer reports a composite that opens on Block.
A nav, figure or article nested inside a block root or repeated in a loop is a separate
file rooted on Block: the parts `NavBlock`, `FigureBlock`, `ArticleBlock`
(`xgen/screens/src/authoring/components/landmarks.ts`). Quotations and captions are
`Text tag="blockquote"` / `Text tag="figcaption"`.

Result: block-root 0 in every zone, html-validate 0 errors in 570 states, warnings
unique-landmark 1740 only (unchanged open item above).

## Landmark names (unique-landmark: error, 0)

Every organism that holds a landmark (a Block with a section, nav, aside, header or footer
tag, or an organism that holds one) takes the optional prop `landmarkLabel`
(`xgen/screens/src/authoring/landmarks.ts`). The root landmark takes it as `aria-label`
in place of its default name; a nested NavBlock keeps its own name and adds the label
after it ("Main navigation, Navigation bar, Brand in the middle"). The gallery and the
catalog set it per variant from the dictionary (`blocks.landmark` = "{0}, {1}": the block
name, the variant name); a composed page sets it on a block used twice, and the theme
pages (`nameLandmarks`) on every block after the lead. Elsewhere nothing changes.
The split nav bar is one NavBlock around the grid instead of two navs with one name.
`rules/html-validate.json` now reports unique-landmark as an error.
