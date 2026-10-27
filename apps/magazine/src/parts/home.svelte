<!-- Home: the recommendation rows for the picks (packages/taste-data/src/recommend), computed in the browser; the page and the
     collection links are @ui8kit/layouts/magazine/page and link-strip. -->
<script lang="ts">
  import LinkStrip from "@ui8kit/layouts/magazine/link-strip.svelte";
  import Page from "@ui8kit/layouts/magazine/page.svelte";
  import PageTitle from "@ui8kit/layouts/magazine/page-title.svelte";
  import ui from "../../content/ui.json";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { recommend } from "@ui8kit/taste-data/recommend";
  import { lib } from "../lib/collections.svelte";
  import CollectionHeader from "./collection-header.svelte";
  import Row from "./row.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const rows = $derived(recommend(picks));
  const links = $derived(lib.collections.map((c) => ({ id: c.id, href: "#/collection/" + c.id, label: `${c.title} (${c.styles.length})` })));
</script>

<Page data-testid="magazine-home">
  <LinkStrip label={ui.collections.heading} {links} data-testid="collections-strip" />
  <PageTitle text={ui.home.heading} />
  <CollectionHeader {picks} />
  {#each rows as row, i (i)}
    <Row {row} />
  {/each}
</Page>
