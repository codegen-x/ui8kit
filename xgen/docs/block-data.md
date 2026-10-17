# Block data vs the Codex v0.4 contract (inventory; step 2: the pilot blocks fixed; step 3: lookups, terms, author_id; step 4: five more blocks)

Goal: every block, screen, template and data structure of the kit reads Codex v0.4 entries (`@ui8kit/contract` ^0.2.0;
manifest `xgen/schema/codex/manifest.json`, 62 kinds) by the rules: money = integer minor units + `currency`; dates RFC 3339,
formatted by the UI per locale; text = plain string + entry `locale`; links built from `slug` / `parent_id` (no `href` in data);
media via `featured_media_id` (kind `media`); UI labels from the dictionary of the locale, never from entries; an empty state in every block.

**The contract wins.** On any conflict the block (or its prop) changes; where data is missing it goes into a kind/metadata field
declared in `manifest.json` (an extension point), never into the core schema. Fix column: `block` (preferred) or `manifest` (kind/field).

Machine-readable twin: `xgen/schema/codex/blocks.json` (schema `blocks.schema.json`, test `xgen/schema/test/blocks.test.ts`).
Central field maps: `xgen/runtimes/core/assets/app/fields.ts` -> generated `@ui8kit/app-shared/runtime/fields` (`CODEX_FIELDS`).
Lookups: generated `@ui8kit/app-shared/runtime/codex` (`CODEX`: media, users, taxonomy terms) is the third argument of every
`fromCodex` in the hosts and the magazine; `routes` are added only for kinds an app has a page for (today none: no link).

## 1. Surfaces

| Surface | Where | Data source | Kinds | Status |
|---|---|---|---|---|
| kit blocks (92) | `xgen/specs/blocks/*.json` (authoring `xgen/screens/src/authoring/blocks`, gallery) -> 8 runtimes | `data[].fields` per spec (product, post, plan: `CODEX_FIELDS` in `gallery/blocks-data.ts`), fixtures | 50+ kinds, see blocks.json | 3 done, 89 todo |
| kit organisms/components (179) | `xgen/specs/organisms`, `authoring/components` | props from the blocks above | (via blocks) | todo (listed in step 2) |
| presets | `authoring/presets`, `xgen/specs/presets` | style only | none | n/a |
| xgen screens (15) | `xgen/specs/screens/*.json` -> `apps/host-*/xgen/screens/*` | `{ "$": "ui.*" }` dictionary refs + block data | via blocks | todo |
| magazine templates (10 + header/footer) | `apps/magazine/src/templates/*.svelte`, Templates tab `#/style/<key>/templates` | `data.ts` (fromCodex over `@ui8kit/app-shared/data/*`) + the copy deck `c` | 25 collections | todo (3 pilot blocks use central maps) |
| taste screens (146) | `packages/taste-screens/src/screens` (style detail preview; panorama excluded) | `Deck` from `@ui8kit/taste-data/content/copy.json`, not Codex | none | todo |
| fixtures (317 entries, 2 taxonomies / 10 terms) | `xgen/fixtures/*.json`, `xgen/fixtures/taxonomies/*.json` -> `packages/shared/app/src/data` | v0.4 entries, taxonomy bundles | 62 (`media`, `user`) | valid (0 errors; term refs checked) |
| taste-data content | `copy.json`, `reference-*.json` | own shapes | none | todo: decide which become entries |
| panorama, illustrations | `packages/panorama` | - | - | excluded |

## 2. The 15 magazine blocks

| Block | Template(s) | Data props | data.ts collection | Kind | Labels | Status |
|---|---|---|---|---|---|---|
| ProductGrid | ecommerce | products | products (CODEX_FIELDS.product) | product | commerce.productLabels, commerce.badges | **done** |
| PostHeader | two-column, three-column | post | posts[i] (CODEX_FIELDS.post) | post | content.labels | **done** |
| PricingTiers | saas | plans | tiers (CODEX_FIELDS.plan) | plan | pricing, vibe.billing | **done** |
| ProductDetail | ecommerce | product | products[0] | product | commerce.detail, commerce.badges | todo |
| ReviewList | ecommerce | reviews | reviews | review | commerce.reviewLabels | todo |
| ProjectGrid | portfolio | projects | projects | project | company.projects | todo |
| PhotoGallery | portfolio | photos | photos | photo | company.photos | todo |
| ArticleBody | docs, two/three-column | sections | article | section | vibe.article | todo |
| FaqList | saas, sidebar | items | faq | faq | site.pricing.faqTitle | todo |
| FeatureGrid | classic, saas, sidebar | features | features | feature | site.home.featuresTitle | todo |
| StatsBand | classic, saas | stats | stats | stat | marketing.stats | todo |
| PageTrail | docs | crumbs, extras.facts | crumbs, stats | crumb, stat | marketing.pageTrail | todo |
| PageIntro | blog, sidebar | none (text props) | - (deck / dictionary) | - | pages.contentBlog.home | todo |
| CtaBand | classic, saas, ecommerce, portfolio | none | - (deck) | - | deck | todo |
| NewsletterForm | blog | none | - | - | promo.newsletter | todo |

Templates also compose HeroClassic, HeroSplit, PostGrid, AppShell, SidebarNav, CategoryNav, AboutMe, NavBar, SitemapFooter
(listed as kit blocks, todo).

| Template | Blocks | Collections |
|---|---|---|
| classic | HeroClassic, FeatureGrid, StatsBand, CtaBand | features, stats |
| two-column | PostHeader, ArticleBody | posts, article, topics |
| three-column | SidebarNav, PostHeader, ArticleBody | sidenav, posts, article, activity |
| sidebar | CategoryNav, PageIntro, FeatureGrid, FaqList | categories, features, faq |
| dashboard | AppShell | sidenav, metrics, series, activity |
| blog | PageIntro, PostGrid, NewsletterForm | posts, topics |
| ecommerce | CategoryNav, ProductDetail, ProductGrid, ReviewList, CtaBand | categories, products, reviews |
| portfolio | AboutMe, ProjectGrid, PhotoGallery, CtaBand | facts, skills, projects, photos |
| saas | HeroSplit, StatsBand, FeatureGrid, PricingTiers, FaqList, CtaBand | stats, features, tiers, testimonials, faq |
| docs | SidebarNav, PageTrail, ArticleBody | outline, helplinks, crumbs, article, stats |

## 3. Pilot field maps

**ProductGrid** (`Product`, kind `product`, map `CODEX_FIELDS.product`)

| Prop | Entry path | Manifest | Note |
|---|---|---|---|
| id | id | core | |
| name | title | core | plain string + locale |
| summary | metadata.summary.value | string, req | |
| price | metadata.price.value | number, money | minor units, `fmtMoney(minor, currency)` |
| compareAt (optional) | metadata.compare_at.value | number, money, optional | old price, same currency; struck through (`del`, "Was" for screen readers) when higher than price |
| currency | metadata.currency.value | string, req | ISO 4217 |
| rating / reviews | metadata.rating / reviews.value | number / integer | |
| badge (optional) | metadata.badge.value | string, optional | a key into the `badges` dictionary |
| category | terms\|term:product_category | core `terms` -> taxonomy `product_category` | the term name ("Light"), by the entry's locale |
| inStock | metadata.inStock.value | boolean | |
| href (optional) | slug\|route | core | built from the slug by `opts.routes[kind]`; no route: no link |
| image (optional) | featured_media_id\|media | core -> kind `media` (`metadata.file`) | the file of a *published* media entry (CODEX.media); in the fixtures a base64 data URI placeholder (no external or file URLs); a real app resolves its own through opts.media / its adapter |
| labels | dictionary `commerce.productLabels` | | add, soldOut, reviews, ratingLabel, was, empty |

**PostHeader** (`Post`, kind `post`, map `CODEX_FIELDS.post`): id, title, excerpt (core), category<-terms|term:category (term name),
author<-author_id|author (`display_name` of the kind `user`), date<-metadata.date|date (RFC 3339 -> the locale of the entry or the app, Intl), minutes (integer,
`labels.minutes`), icon, href<-slug|route, image<-featured_media_id|media (the cover; placeholder without). `post` is optional: without it
the empty state (`content.labels.empty`).

**PricingTiers** (`Plan`, kind `plan`, map `CODEX_FIELDS.plan`): id, name<-title, tagline, price / yearly (money, minor units; 0 -> `labels.free`),
currency, seats / storage (integers, units in labels), highlighted, features (string[]). `status` is no longer read (optional on the record,
the plans list screen keeps its own column). No plans: the empty state (`pricing.empty`).

## 4. Mismatches (fix direction)

| # | Where | Mismatch | Fix |
|---|---|---|---|
| 1 | Product/Post `href` (**fixed**: `slug\|route`), CtaBand/PageIntro/PageTrail `href="#"`, sitemap `links` strings | links not built from slug/parent_id | block: derive the link from `slug` by a route helper; drop `href` from data |
| 2 | Product `image`, PostHeader cover (**fixed**: kind `media`, `featured_media_id\|media`), PhotoGallery, ProjectGrid | no media field; MediaFrame placeholders | block reads `featured_media_id` -> media entry; fixtures add kind `media` (manifest kind) |
| 3 | ProductGrid (**fixed**), ProductDetail (todo) | no old (compare-at) price | manifest field `product.compare_at` (money) + block prop |
| 4 | Product `category`, Post `category` (**fixed**: `terms`, taxonomies `product_category`, `category`), Faq `category`, Photo `tag`, Project `tags` | taxonomy as free text / raw keys printed | block: read `terms` (taxonomy + term entries with locale), show term name |
| 5 | Post/Review `author` (**fixed**: `author_id` -> kind `user`, map `CODEX_FIELDS.review`) | a name string, not a reference | block: read `author_id` (kind user) display_name |
| 6 | `fmtDate`, `fmtAgo` in core.ts (**fixed**: Intl by the entry's or the app's locale; en output unchanged, the compact en units "min", "h", "d" kept) | fixed en-US format and English "2 min ago", "Yesterday" | block/runtime: Intl by locale + dictionary words |
| 7 | stats `value` (**fixed**: number + `metadata.unit`, `\|number` formats in the locale), metrics `value` ("$48,200"), templates `views`/`likes` ("1.2K"), dictionary `marketing.pageTrail.value` ("48") | preformatted numbers as strings | manifest: number fields; formatted with Intl |
| 8 | Product `badge` / Plan `status` (**fixed**: optional; `status` not mapped for the pricing blocks) | record vs manifest | block: make the prop optional / drop `status` |
| 9 | ProductGrid, PricingTiers, PostHeader (**fixed**: EmptyState, `labels.empty`), most other lists | no empty state | block: empty state with a dictionary label |
| 10 | magazine templates / taste screens | text from the English copy deck `c` (not entries, not dictionary) | block props from dictionary; deck becomes entries or a dictionary per locale |
| 11 | sitemap `links`, footer groups, side navs, category nav, brand (hardcoded `"#/"` in the components), Plan `features` | string arrays / no href per item; menus are not `menu` records | features ok as content of the entry; menus -> the contract `menu` schema, a link only where it has an address |
| 12 | Project `year` string, ProjectGrid `client` "Northwind" rebranded at runtime | types / data | manifest: integer year; block drops runtime rebrand when data is neutral |

## 5. Status per block

done: ProductGrid, PostHeader, PricingTiers. Step 2 fixed: empty states, links from slug, image from `featured_media_id` (kind `media`),
optional badge, no status, dates by locale, `compare_at`; the xgen specs read `CODEX_FIELDS` (`gallery/blocks-data.ts`, `screens/plans-screen.ts`).
Step 3: category from `terms`, author from `author_id` (kind `user`), lookups `CODEX` passed by the hosts and the magazine;
PostCard renders its read link only with a route. Open: real media assets (none in the repo), routes once the apps have product/post pages.
Step 4 done: ProductDetail (old price, featured media, category term; split into ProductPrice and ProductGallery), ReviewList
(author_id, dates by locale, empty state), StatsBand (numeric `value` + `unit`, `|number` by locale, prop `empty`), PageTrail (crumbs = kind `page`
chained by `parent_id`, `trail()` orders them, a crumb links only with a route; no crumbs: no nav), FaqList (category = slug of the
`faq_category` term, tabs filter by it; prop `empty`). Fallback `"#/"` links removed from SectionHead, FeatureGrid cell head, HeroPrompt,
HeroHead and NavBar links: no address, no link (a button stays a button). Media fixtures: published, base64 data URIs.
The magazine is a showcase: no routes and no links by design; its templates pass no `href`. Left: the hardcoded `"#/"` of footer
groups, side navs, the category nav, the brand and the in-page table of contents (#11).
todo: everything else in blocks.json (kind listed from the spec).
