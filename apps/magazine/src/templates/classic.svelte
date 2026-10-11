<!-- Classic website: header with navigation, a hero, the content sections, a closing call to action and the footer. -->
<script lang="ts">
  import { CtaBand, FeatureGrid, HeroClassic, StatsBand } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<div class="tp-page" data-template="classic">
  <Header {c} cta />
  <main id="tp-classic-main" class="tp-main">
    <HeroClassic
      id="tp-classic-hero"
      title={c.title}
      text={c.lead}
      badge={c.eyebrow}
      actions={{ mode: "two", cta: c.cta, href: "#", secondary: c.secondary, secondaryHref: "#" }}
      media={{ kind: "none" }}
      layout="centered"
      scale="default"
      tone="default"
      density="roomy"
    />
    <FeatureGrid id="tp-classic-features" title={d.ui.site.home.featuresTitle} features={d.features} layout="grid" cols="1-3" item="card" tone="muted" density="default" />
    <StatsBand id="tp-classic-stats" title={d.ui.marketing.stats.title} stats={d.stats.slice(0, 4)} cols="4" layout="row" surface="none" item="icon" align="start" tone="default" density="default" />
    <CtaBand
      id="tp-classic-cta"
      title={c.accent}
      text={c.note}
      actions={{ mode: "one", cta: c.cta, href: "#" }}
      layout="band"
      tone="default"
      proof="none"
      density="default"
    />
  </main>
  <Footer {c} />
</div>
