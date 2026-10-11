// The 10 template skeletons (plan/CODEGEN-X.md "Templates tab"): one hand-composed Svelte page each, built from kit blocks, skinned only
// by the CSS variables of the frame it renders in.
import type { Component } from "svelte";
import type { Deck } from "@ui8kit/taste-data/copy";
import Blog from "./blog.svelte";
import Classic from "./classic.svelte";
import Dashboard from "./dashboard.svelte";
import Docs from "./docs.svelte";
import Ecommerce from "./ecommerce.svelte";
import Portfolio from "./portfolio.svelte";
import Saas from "./saas.svelte";
import Sidebar from "./sidebar.svelte";
import ThreeColumn from "./three-column.svelte";
import TwoColumn from "./two-column.svelte";

export type TemplateId = "classic" | "two-column" | "three-column" | "sidebar" | "dashboard" | "blog" | "ecommerce" | "portfolio" | "saas" | "docs";
export type TemplateDef = { id: TemplateId; label: string; note: string; landmarks: string; component: Component<{ c: Deck }> };

export const TEMPLATES: readonly TemplateDef[] = [
  { id: "classic", label: "Classic website", note: "Header, navigation, hero, content, call to action, footer.", landmarks: "header · nav · main · section · footer", component: Classic },
  { id: "two-column", label: "Two columns", note: "An article with an aside of related reading.", landmarks: "header · nav · main · article · aside · footer", component: TwoColumn },
  { id: "three-column", label: "Three columns", note: "Navigation, content and an aside side by side.", landmarks: "header · nav · aside · main · article · aside · footer", component: ThreeColumn },
  { id: "sidebar", label: "Sidebar", note: "A category sidebar beside intro, features and questions.", landmarks: "header · nav · aside · main · section · footer", component: Sidebar },
  { id: "dashboard", label: "Dashboard", note: "An application shell: rail, search, metrics, chart, activity.", landmarks: "nav · header · main · section · aside", component: Dashboard },
  { id: "blog", label: "Blog", note: "Introduction, a magazine grid of posts and a newsletter.", landmarks: "header · nav · main · section · article · footer", component: Blog },
  { id: "ecommerce", label: "E-commerce", note: "Category bar, a product page, the product grid and reviews.", landmarks: "header · nav · main · section · article · footer", component: Ecommerce },
  { id: "portfolio", label: "Portfolio", note: "A profile, a bento of projects and a photo gallery.", landmarks: "header · nav · main · section · figure · footer", component: Portfolio },
  { id: "saas", label: "SaaS landing", note: "Split hero, figures, features, pricing and questions.", landmarks: "header · nav · main · section · footer", component: Saas },
  { id: "docs", label: "Documentation", note: "Outline sidebar, breadcrumbs, an article with a table of contents.", landmarks: "header · nav · aside · main · article · aside · footer", component: Docs },
];
