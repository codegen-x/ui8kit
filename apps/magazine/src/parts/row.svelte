<!-- One row of the feed: a neutral label and a horizontal strip of fixed-width cards (240 px, scrolls when narrower). -->
<script lang="ts">
  import type { Row } from "@ui8kit/taste-data/recommend";
  import ui from "../../content/ui.json";
  import Card from "./card.svelte";

  let { row }: { row: Row } = $props();
</script>

<section class="mg-row" data-testid="row" data-kind={row.kind} data-cycle={row.cycle}>
  <h2 class="mg-h2">{ui.rows[row.kind]}</h2>
  <div class="mg-strip">
    {#each row.cards as card (card.key)}
      <Card {card} caption={row.kind === "compositions" ? card.label : row.kind === "radii" ? `r${card.radius}` : row.kind === "fonts" ? card.fonts.display : row.kind === "skins" ? card.skin : ""} />
    {/each}
  </div>
</section>
