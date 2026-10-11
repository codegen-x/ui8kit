<!-- Home: the recommendation rows for the picks (packages/taste-data/src/recommend), computed in the browser. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { recommend } from "@ui8kit/taste-data/recommend";
  import { lib } from "../lib/collections.svelte";
  import Row from "./row.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const rows = $derived(recommend(picks));
</script>

<main id="main-content" class="mg-main" data-testid="magazine-home">
  <nav class="mg-strip-links" aria-label={ui.collections.heading} data-testid="collections-strip">
    {#each lib.collections as c (c.id)}
      <a class="mg-link" href={"#/collection/" + c.id} data-testid="collection-link">{c.title} ({c.styles.length})</a>
    {/each}
  </nav>
  <h1 class="mg-h1">{ui.home.heading}</h1>
  {#each rows as row, i (i)}
    <Row {row} />
  {/each}
</main>
