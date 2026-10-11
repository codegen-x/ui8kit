// The data of the 10 template skeletons: the kit's own neutral fixtures (@ui8kit/app-shared, fictional placeholder content, no photos)
// mapped to the block props, with the one fictional name the fixtures carry replaced by the deck's generic wordmark.
import type {
  Category, Event, Faq, Feature, MegaGroup, NavLink, Photo, Plan, Point, Post, PostTopic, Product, Project, Quote,
  Review, Section, Skill, Spec, Stat, Step,
} from "@ui8kit/svelte-ui";
import { fromCodex } from "@ui8kit/app-shared/runtime/core";
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

const f = {
  nav: { id: "id", name: "title.en", icon: "metadata.icon.value" },
  metrics: { id: "id", label: "title.en", value: "metadata.value.value", icon: "metadata.icon.value", hint: "metadata.hint.value" },
  posts: { id: "id", title: "title.en", excerpt: "metadata.excerpt.value", category: "metadata.category.value", author: "metadata.author.value", date: "metadata.date.value", minutes: "metadata.minutes.value", icon: "metadata.icon.value" },
  products: { id: "id", name: "title.en", summary: "metadata.summary.value", price: "metadata.price.value", currency: "metadata.currency.value", rating: "metadata.rating.value", reviews: "metadata.reviews.value", badge: "metadata.badge.value", category: "metadata.category.value", inStock: "metadata.inStock.value" },
  plan: { id: "id", name: "title.en", tagline: "metadata.tagline.value", price: "metadata.price.value", currency: "metadata.currency.value", seats: "metadata.seats.value", storage: "metadata.storage.value", highlighted: "metadata.highlighted.value", status: "metadata.status.value", features: "metadata.features.value", yearly: "metadata.yearly.value" },
  projects: { id: "id", title: "title.en", category: "metadata.category.value", year: "metadata.year.value", summary: "metadata.summary.value", tags: "metadata.tags.value", featured: "metadata.featured.value", client: "metadata.client.value" },
  reviews: { id: "id", title: "title.en", author: "metadata.author.value", rating: "metadata.rating.value", text: "metadata.text.value", date: "metadata.date.value" },
  testimonials: { id: "id", author: "title.en", role: "metadata.role.value", company: "metadata.company.value", quote: "metadata.quote.value", rating: "metadata.rating.value", handle: "metadata.handle.value", time: "metadata.time.value", mark: "metadata.mark.value" },
};

/** replaces the fixtures' one fictional company name with the deck's wordmark, deeply, without touching the source */
export function rebrand<T>(value: T, brand: string): T {
  const walk = (v: unknown): unknown =>
    typeof v === "string" ? v.replace(/northwind/gi, (m) => (m === m.toLowerCase() ? brand.toLowerCase() : brand)) :
    Array.isArray(v) ? v.map(walk) :
    v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v;
  return walk(value) as T;
}

export type TemplateData = ReturnType<typeof makeData>;

export function makeData(brand: string) {
  const rb = <T>(v: T): T => rebrand(v, brand);
  return {
    brand,
    ui: rb(kitUi),
    sidenav: rb(fromCodex<NavLink>(sidenav, f.nav)),
    subnav: fromCodex<NavLink>(subnav, f.nav),
    helplinks: fromCodex<NavLink>(helplinks, f.nav),
    navlinks: fromCodex<NavLink>(navlinks, f.nav),
    outline: fromCodex<NavLink>(outline, f.nav),
    crumbs: fromCodex<NavLink>(crumbs, f.nav),
    metrics: fromCodex<Stat>(metrics, f.metrics),
    stats: fromCodex<Stat>(stats, f.metrics),
    series: fromCodex<Point>(series, { id: "id", label: "title.en", value: "metadata.value.value" }),
    activity: fromCodex<Event>(activity, { id: "id", title: "title.en", text: "metadata.text.value", time: "metadata.time.value", tone: "metadata.tone.value" }),
    posts: fromCodex<Post>(posts, f.posts),
    topics: fromCodex<PostTopic>(topics, { id: "id", title: "title.en", value: "metadata.value.value" }),
    article: fromCodex<Section>(article, { id: "id", title: "title.en", text: "metadata.text.value", quote: "metadata.quote.value" }),
    products: fromCodex<Product>(products, f.products),
    categories: fromCodex<Category>(categories, { id: "id", name: "title.en", icon: "metadata.icon.value", count: "metadata.count.value" }),
    reviews: fromCodex<Review>(reviews, f.reviews),
    specs: fromCodex<Spec>(specs, { id: "id", label: "title.en", value: "metadata.value.value" }),
    details: fromCodex<{ id: string; title: string; text: string }>(details, { id: "id", title: "title.en", text: "metadata.text.value" }),
    projects: rb(fromCodex<Project>(projects, f.projects)),
    photos: fromCodex<Photo>(photos, { id: "id", title: "title.en", tag: "metadata.tag.value", size: "metadata.size.value" }),
    facts: fromCodex<Spec>(profilefacts, { id: "id", label: "title.en", value: "metadata.value.value" }),
    skills: fromCodex<Skill>(skills, { id: "id", label: "title.en", level: "metadata.level.value" }),
    features: fromCodex<Feature>(features, { id: "id", title: "title.en", text: "metadata.text.value", icon: "metadata.icon.value" }),
    steps: fromCodex<Step>(steps, { id: "id", title: "title.en", text: "metadata.text.value", icon: "metadata.icon.value" }),
    tiers: fromCodex<Plan>(tiers, f.plan),
    testimonials: fromCodex<Quote>(testimonials, f.testimonials),
    faq: fromCodex<Faq>(faq, { id: "id", question: "title.en", answer: "metadata.answer.value", category: "metadata.category.value" }),
    sitemap: fromCodex<MegaGroup>(sitemap, { id: "id", title: "title.en", icon: "metadata.icon.value", links: "metadata.links.value" }),
  };
}
