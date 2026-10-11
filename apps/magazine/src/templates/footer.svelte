<!-- The page footer of every template: the kit's SitemapFooter (a <footer> with grouped links). -->
<script lang="ts">
  import { SitemapFooter } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";

  let { c, layout = "columns" }: { c: Deck; layout?: "columns" | "row" } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<SitemapFooter
  id="tp-footer"
  label={d.ui.vibe.sitemap.label}
  brand={c.brand}
  tagline={c.lead}
  copyright={`2026 ${c.brand}`}
  groups={d.sitemap}
  signup={{ mode: "none" }}
  status={{ mode: "none" }}
  {layout}
  density="compact"
/>
