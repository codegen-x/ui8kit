// The data of the 10 template skeletons: the kit's own neutral fixtures (@ui8kit/app-shared, fictional placeholder content, no photos)
// mapped to the block props, with the one fictional name the fixtures carry replaced by the deck's generic wordmark.
import type {
  Category, Event, Faq, Feature, MegaGroup, NavLink, Photo, Plan, Point, Post, PostTopic, Product, Project, Quote,
  Review, Section, Skill, Spec, Stat, Step,
} from "@ui8kit/svelte-ui";
import { fromCodex, trail } from "@ui8kit/app-shared/runtime/core";
import { CODEX_FIELDS } from "@ui8kit/app-shared/runtime/fields";
import { CODEX } from "@ui8kit/app-shared/runtime/codex";
import { ui as kitUi } from "@ui8kit/app-shared/content";
import { activity } from "@ui8kit/app-shared/data/activity";
import { article } from "@ui8kit/app-shared/data/article";
import { categories } from "@ui8kit/app-shared/data/categories";
import { crumbs } from "@ui8kit/app-shared/data/crumbs";
import { faq } from "@ui8kit/app-shared/data/faq";
import { features } from "@ui8kit/app-shared/data/features";
import { helplinks } from "@ui8kit/app-shared/data/helplinks";
import { metrics } from "@ui8kit/app-shared/data/metrics";
import { navlinks } from "@ui8kit/app-shared/data/navlinks";
import { outline } from "@ui8kit/app-shared/data/outline";
import { posts } from "@ui8kit/app-shared/data/posts";
import { products } from "@ui8kit/app-shared/data/products";
import { profilefacts } from "@ui8kit/app-shared/data/profilefacts";
import { projects } from "@ui8kit/app-shared/data/projects";
import { reviews } from "@ui8kit/app-shared/data/reviews";
import { series } from "@ui8kit/app-shared/data/series";
import { sidenav } from "@ui8kit/app-shared/data/sidenav";
import { sitemap } from "@ui8kit/app-shared/data/sitemap";
import { skills } from "@ui8kit/app-shared/data/skills";
import { specs } from "@ui8kit/app-shared/data/specs";
import { stats } from "@ui8kit/app-shared/data/stats";
import { steps } from "@ui8kit/app-shared/data/steps";
import { subnav } from "@ui8kit/app-shared/data/subnav";
import { testimonials } from "@ui8kit/app-shared/data/testimonials";
import { tiers } from "@ui8kit/app-shared/data/tiers";
import { topics } from "@ui8kit/app-shared/data/topics";
import { photos } from "@ui8kit/app-shared/data/photos";
import { details } from "@ui8kit/app-shared/data/details";

export const ui = kitUi;

// the maps of product, post, plan and review are the central ones (runtime/fields, source xgen/runtimes/core/assets/app/fields.ts)
const f = {
  reviews: CODEX_FIELDS.review,
  posts: CODEX_FIELDS.post,
  products: CODEX_FIELDS.product,
  plan: CODEX_FIELDS.plan,
  metrics: { id: "id", label: "title", value: "metadata.value.value", icon: "metadata.icon.value", hint: "metadata.hint.value" },
  projects: { id: "id", title: "title", category: "metadata.category.value", year: "metadata.year.value", summary: "metadata.summary.value", tags: "metadata.tags.value", featured: "metadata.featured.value", client: "metadata.client.value" },
  testimonials: { id: "id", author: "title", role: "metadata.role.value", company: "metadata.company.value", quote: "metadata.quote.value", rating: "metadata.rating.value", handle: "metadata.handle.value", time: "metadata.time.value|ago-short", mark: "metadata.mark.value" },
};

/** replaces the fixtures' one fictional company name with the deck's wordmark, deeply, without touching the source */
export function rebrand<T>(value: T, brand: string): T {
  const walk = (v: unknown): unknown =>
    typeof v === "string" ? v.replace(/northwind/gi, (m) => (m === m.toLowerCase() ? brand.toLowerCase() : brand)) :
    Array.isArray(v) ? v.map(walk) :
    v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v;
  return walk(value) as T;
}

// the lookups of the entries (media files, author names, term labels: runtime/codex) and the addresses of entries: the
// magazine has no product or post page, so no route: `slug|route` stays undefined and the blocks render no link
const codex = { ...CODEX, routes: {} };

export type TemplateData = ReturnType<typeof makeData>;

export function makeData(brand: string) {
  const rb = <T>(v: T): T => rebrand(v, brand);
  return {
    brand,
    ui: rb(kitUi),
    // the menus: Codex menu_item entries (CODEX_FIELDS.menuItem); no route for menu items, so names, not links
    sidenav: rb(fromCodex<NavLink>(sidenav, CODEX_FIELDS.menuItem, codex)),
    subnav: fromCodex<NavLink>(subnav, CODEX_FIELDS.menuItem, codex),
    helplinks: fromCodex<NavLink>(helplinks, CODEX_FIELDS.menuItem, codex),
    navlinks: fromCodex<NavLink>(navlinks, CODEX_FIELDS.menuItem, codex),
    outline: fromCodex<NavLink>(outline, CODEX_FIELDS.menuItem, codex),
    // the breadcrumbs: the pages of the parent_id chain, root first (no page routes in the magazine: names, no links)
    crumbs: fromCodex<NavLink>(trail(crumbs), CODEX_FIELDS.page, codex),
    metrics: fromCodex<Stat>(metrics, f.metrics),
    stats: fromCodex<Stat>(stats, CODEX_FIELDS.stat, codex),
    series: fromCodex<Point>(series, { id: "id", label: "title", value: "metadata.value.value" }),
    activity: fromCodex<Event>(activity, { id: "id", title: "title", text: "metadata.text.value", time: "metadata.time.value|ago", tone: "metadata.tone.value" }),
    posts: fromCodex<Post>(posts, f.posts, codex),
    topics: fromCodex<PostTopic>(topics, { id: "id", title: "title", value: "metadata.value.value" }),
    article: fromCodex<Section>(article, { id: "id", title: "title", text: "metadata.text.value", quote: "metadata.quote.value" }),
    products: fromCodex<Product>(products, f.products, codex),
    categories: fromCodex<Category>(categories, CODEX_FIELDS.menuCategory, codex),
    reviews: fromCodex<Review>(reviews, f.reviews, codex),
    specs: fromCodex<Spec>(specs, { id: "id", label: "title", value: "metadata.value.value" }),
    details: fromCodex<{ id: string; title: string; text: string }>(details, { id: "id", title: "title", text: "metadata.text.value" }),
    projects: rb(fromCodex<Project>(projects, f.projects)),
    photos: fromCodex<Photo>(photos, { id: "id", title: "title", tag: "metadata.tag.value", size: "metadata.size.value" }),
    facts: fromCodex<Spec>(profilefacts, { id: "id", label: "title", value: "metadata.value.value" }),
    skills: fromCodex<Skill>(skills, { id: "id", label: "title", level: "metadata.level.value" }),
    features: fromCodex<Feature>(features, { id: "id", title: "title", text: "metadata.text.value", icon: "metadata.icon.value" }),
    steps: fromCodex<Step>(steps, { id: "id", title: "title", text: "metadata.text.value", icon: "metadata.icon.value" }),
    tiers: fromCodex<Plan>(tiers, f.plan, codex),
    testimonials: fromCodex<Quote>(testimonials, f.testimonials),
    faq: fromCodex<Faq>(faq, CODEX_FIELDS.faq, codex),
    // the footer menu: groups and the items under them (parent_id, the lookup CODEX.menus)
    sitemap: fromCodex<MegaGroup>(sitemap, CODEX_FIELDS.menuGroup, codex),
  };
}
