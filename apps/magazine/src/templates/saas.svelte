<!-- SaaS landing: header with a call to action, a split hero, figures, features, pricing, questions, a closing band and the footer. -->
<script lang="ts">
  import { Block, CtaBand, FaqList, FeatureGrid, HeroSplit, PricingTiers, StatsBand } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} cta />
<Block tag="main" id="tp-saas-main" class="tp-main">
  <HeroSplit
    id="tp-saas-hero"
    title={c.title}
    lead={c.lead}
    badge={c.eyebrow}
    actions={{ mode: "two", cta: c.cta, secondary: c.secondary }}
    content={{ stats: d.stats, features: d.features, people: d.testimonials, plans: d.tiers, proof: c.note, card: { title: c.items[0]!.title, text: c.items[0]!.text, icon: "zap" } }}
    extra="stats"
    media="card"
    mediaSide="end"
    tone="default"
  />
  <StatsBand id="tp-saas-stats" title={d.ui.marketing.stats.title} stats={d.stats.slice(0, 4)} empty={d.ui.marketing.stats.empty} cols="4" layout="row" surface="none" item="icon" align="start" tone="muted" density="default" />
  <FeatureGrid id="tp-saas-features" title={d.ui.site.home.featuresTitle} features={d.features} empty={d.ui.empty.features} layout="grid" cols="1-3" item="card" tone="default" density="default" />
  <PricingTiers id="tp-saas-pricing" title={d.ui.site.pricing.tiersTitle} plans={d.tiers} labels={d.ui.pricing} billingLabels={d.ui.vibe.billing} layout="grid" cols="1-3" emphasis="auto" billing="monthly" tone="muted" density="default" />
  <FaqList id="tp-saas-faq" title={d.ui.site.pricing.faqTitle} items={d.faq.slice(0, 5)} empty={d.ui.vibe.faq.empty} search={{ mode: "none" }} filter={{ mode: "none" }} layout="accordion" cols="2" tone="default" density="default" />
  <CtaBand id="tp-saas-cta" title={c.accent} text={c.note} actions={{ mode: "two", cta: c.cta, secondary: c.secondary }} layout="band" tone="default" proof="none" density="default" />
</Block>
<Footer {c} />
