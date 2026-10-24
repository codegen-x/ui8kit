// The data of the 10 template skeletons: the kit's own neutral fixtures (@ui8kit/app-shared, fictional placeholder content, no photos)
// mapped to the block props, with the one fictional name the fixtures carry replaced by the deck's generic wordmark.
import type {
  Category, Event, Faq, Feature, MegaGroup, NavLink, Photo, Plan, Point, Post, PostTopic, Product, Project, Quote,
  Review, Section, Skill, Spec, Stat, Step,
} from "@codegen-x/svelte-compose";
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

// every map is a central one (runtime/fields, source xgen/runtimes/core/assets/app/fields.ts): one data contract per kind
const F = CODEX_FIELDS;

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
    // the menus: Codex menu_item entries (F.menuItem); no route for menu items, so names, not links
    sidenav: rb(fromCodex<NavLink>(sidenav, F.menuItem, codex)),
    subnav: fromCodex<NavLink>(subnav, F.menuItem, codex),
    helplinks: fromCodex<NavLink>(helplinks, F.menuItem, codex),
    navlinks: fromCodex<NavLink>(navlinks, F.menuItem, codex),
    outline: fromCodex<NavLink>(outline, F.menuItem, codex),
    // the breadcrumbs: the pages of the parent_id chain, root first (no page routes in the magazine: names, no links)
    crumbs: fromCodex<NavLink>(trail(crumbs), F.page, codex),
    metrics: fromCodex<Stat>(metrics, F.metric, codex),
    stats: fromCodex<Stat>(stats, F.stat, codex),
    series: fromCodex<Point>(series, F.point),
    activity: fromCodex<Event>(activity, F.event),
    posts: fromCodex<Post>(posts, F.post, codex),
    topics: fromCodex<PostTopic>(topics, F.topic),
    article: fromCodex<Section>(article, F.section),
    products: fromCodex<Product>(products, F.product, codex),
    categories: fromCodex<Category>(categories, F.menuCategory, codex),
    reviews: fromCodex<Review>(reviews, F.review, codex),
    specs: fromCodex<Spec>(specs, F.spec),
    details: fromCodex<{ id: string; title: string; text: string }>(details, F.detail),
    projects: rb(fromCodex<Project>(projects, F.project, codex)),
    photos: fromCodex<Photo>(photos, F.photo),
    facts: fromCodex<Spec>(profilefacts, F.profilefact),
    skills: fromCodex<Skill>(skills, F.skill),
    features: fromCodex<Feature>(features, F.feature),
    steps: fromCodex<Step>(steps, F.step),
    tiers: fromCodex<Plan>(tiers, F.plan, codex),
    testimonials: fromCodex<Quote>(testimonials, F.testimonial),
    faq: fromCodex<Faq>(faq, F.faq, codex),
    // the footer menu: groups and the items under them (parent_id, the lookup CODEX.menus)
    sitemap: fromCodex<MegaGroup>(sitemap, F.menuGroup, codex),
  };
}
