<!-- Sidebar layout: a category sidebar beside a content area with an intro, a feature grid and the questions. -->
<script lang="ts">
  import { Block, CategoryNav, FaqList, FeatureGrid, PageIntro } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} cta />
<div class="tp-cols tp-cols-side">
  <aside class="tp-col-left" aria-label={d.ui.commerce.nav.label}>
    <CategoryNav label={d.ui.commerce.nav.label} categories={d.categories} current="category-all" tools={d.ui.commerce.tools} layout="sidebar" count="show" icon="show" density="default" />
  </aside>
  <Block tag="main" id="tp-side-main" class="tp-col-main">
    <PageIntro id="tp-side-intro" title={c.title} text={c.lead} cta={c.cta} align="start" tone="default" density="default" />
    <FeatureGrid id="tp-side-features" title={c.eyebrow} features={d.features.slice(0, 4)} empty={d.ui.empty.features} layout="grid" cols="1-2" item="card" tone="default" density="compact" />
    <FaqList id="tp-side-faq" title={d.ui.site.pricing.faqTitle} items={d.faq.slice(0, 4)} empty={d.ui.vibe.faq.empty} search={{ mode: "none" }} filter={{ mode: "none" }} layout="accordion" cols="1" tone="default" density="compact" />
  </Block>
</div>
<Footer {c} layout="row" />
