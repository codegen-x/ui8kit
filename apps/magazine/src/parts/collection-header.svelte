<!--
  The collection header of the home: "Collection based on your N styles", a compact strip of the picks (each opens its style) and a small
  legend of the words a recommended card uses for why it is there (packages/taste-data/src/recommend/why.ts).
-->
<script lang="ts">
  import { whyLegend } from "@ui8kit/taste-data/recommend";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { styleOf } from "@ui8kit/taste-data/recommend";
  import ui from "../../content/ui.json";
  import Card from "./card.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const styles = $derived(picks.flatMap((k) => { const s = styleOf(k); return s ? [s] : []; }));
  const legend = whyLegend();
</script>

<section class="mg-collection" aria-labelledby="mg-collection-title" data-testid="collection-header">
  <h2 class="mg-h2 mg-collection-title" id="mg-collection-title" data-testid="collection-title">{ui.home.collection.title.replace("{n}", String(styles.length))}</h2>
  <p class="mg-note">{ui.home.collection.note}</p>
  <div class="mg-picks" role="list" aria-label={ui.home.collection.strip} data-testid="picks-strip">
    {#each styles as s (s.key)}
      <div role="listitem" class="mg-pick"><Card card={s} compact /></div>
    {/each}
  </div>
  <details class="mg-legend" data-testid="why-legend" open>
    <summary>{ui.home.collection.legend}</summary>
    <p class="mg-note">{ui.home.collection.legendNote}</p>
    <dl class="mg-legend-list">
      {#each legend as l (l.term)}
        <div><dt>{l.phrase}</dt><dd>{l.meaning}</dd></div>
      {/each}
    </dl>
  </details>
</section>
