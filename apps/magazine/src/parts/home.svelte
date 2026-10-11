<!-- Home: the recommendation rows for the picks (packages/taste-data/src/recommend), computed in the browser. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { recommend } from "@ui8kit/taste-data/recommend";
  import Row from "./row.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const rows = $derived(recommend(picks));
</script>

<main id="main-content" class="mg-main" data-testid="magazine-home">
  <h1 class="mg-h1">{ui.home.heading}</h1>
  {#each rows as row, i (i)}
    <Row {row} />
  {/each}
</main>
