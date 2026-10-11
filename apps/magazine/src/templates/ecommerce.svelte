<!-- E-commerce: a search header, a category bar, one featured product page, the product grid, reviews and the footer. -->
<script lang="ts">
  import { CategoryNav, CtaBand, ProductDetail, ProductGrid, ReviewList } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<div class="tp-page" data-template="ecommerce">
  <Header {c} layout="search" />
  <CategoryNav label={d.ui.commerce.nav.label} categories={d.categories} current="category-all" tools={d.ui.commerce.tools} layout="bar" count="show" icon="show" density="default" />
  <main id="tp-shop-main" class="tp-main">
    <ProductDetail id="tp-shop-detail" product={d.products[0]!} labels={d.ui.commerce.detail} badges={d.ui.commerce.badges} layout="split" mediaSide="start" thumbs="below" buy="full" tone="default" density="default" />
    <ProductGrid id="tp-shop-products" title={d.ui.commerce.products.title} products={d.products} labels={d.ui.commerce.productLabels} badges={d.ui.commerce.badges} layout="grid" cols="1-4" ratio="1/1" rating="show" action="button" tone="muted" density="default" />
    <ReviewList id="tp-shop-reviews" title={d.ui.commerce.reviews.title} reviews={d.reviews} labels={d.ui.commerce.reviewLabels} layout="grid" item="card" avatar="none" tone="default" density="default" />
    <CtaBand id="tp-shop-cta" title={c.accent} text={c.note} actions={{ mode: "one", cta: c.cta, href: "#" }} layout="row" tone="default" proof="none" density="default" />
  </main>
  <Footer {c} />
</div>
