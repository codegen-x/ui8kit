<!-- Sidebar layout: a category sidebar beside a content area with an intro, a feature grid and the questions. -->
<script lang="ts">
  import { CategoryNav, FaqList, FeatureGrid, PageIntro } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<div class="tp-page" data-template="sidebar">
  <Header {c} cta />
  <div class="tp-cols tp-cols-side">
    <aside class="tp-col-left" aria-label={d.ui.commerce.nav.label}>
      <CategoryNav label={d.ui.commerce.nav.label} categories={d.categories} current="category-all" tools={d.ui.commerce.tools} layout="sidebar" count="show" icon="show" density="default" />
    </aside>
    <main id="tp-side-main" class="tp-col-main">
      <PageIntro id="tp-side-intro" title={c.title} text={c.lead} cta={c.cta} href="#" align="start" tone="default" density="default" />
      <FeatureGrid id="tp-side-features" title={c.eyebrow} features={d.features.slice(0, 4)} layout="grid" cols="1-2" item="card" tone="default" density="compact" />
      <FaqList id="tp-side-faq" title={d.ui.site.pricing.faqTitle} items={d.faq.slice(0, 4)} search={{ mode: "none" }} filter={{ mode: "none" }} layout="accordion" cols="1" tone="default" density="compact" />
    </main>
  </div>
  <Footer {c} layout="row" />
</div>
