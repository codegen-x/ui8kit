<!-- #/collection/<id>: the styles saved in one collection (local only), each a card with its heart. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import { styleOf } from "@ui8kit/taste-data/recommend";
  import { collectionOf } from "../lib/collections.svelte";
  import Card from "./card.svelte";

  let { id }: { id: string } = $props();
  const c = $derived(collectionOf(id));
  const cards = $derived((c?.styles ?? []).flatMap((k) => { const s = styleOf(k); return s ? [s] : []; }));
</script>

<main id="main-content" class="mg-main" data-testid="magazine-collection" data-id={id}>
  <p class="mg-crumbs"><a class="mg-link" href="#/">{ui.collections.back}</a></p>
  {#if !c}
    <h1 class="mg-h1">{ui.collections.missing}</h1>
  {:else}
    <h1 class="mg-h1" data-testid="collection-title">{c.title}</h1>
    <p class="mg-note" data-testid="collection-count">{cards.length} {ui.collections.count}</p>
    {#if cards.length === 0}
      <p class="mg-note" data-testid="collection-empty">{ui.collections.empty}</p>
    {:else}
      <div class="mg-grid">
        {#each cards as s (s.key)}
          <Card card={s} />
        {/each}
      </div>
    {/if}
  {/if}
</main>
