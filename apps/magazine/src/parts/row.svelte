<!-- One row of the feed: a neutral label and a horizontal strip of cards that grow from 200 to 360 px to fill the width (a row of 6
     fits from about 1280 px; narrower, it scrolls). The strip is @ui8kit/layouts/magazine/card-strip. -->
<script lang="ts">
  import CardStrip from "@ui8kit/layouts/magazine/card-strip.svelte";
  import type { Row } from "@ui8kit/taste-data/recommend";
  import { whyLine } from "@ui8kit/taste-data/recommend";
  import ui from "../../content/ui.json";
  import Card from "./card.svelte";

  let { row }: { row: Row } = $props();
  const captionOf = (card: Row["cards"][number]): string => (row.kind === "compositions" ? (card.label ?? "") : row.kind === "radii" ? `r${card.radius}` : row.kind === "fonts" ? card.fonts.display : row.kind === "skins" ? card.skin : "");
</script>

<CardStrip title={ui.rows[row.kind]} data-testid="row" data-kind={row.kind} data-cycle={row.cycle}>
  {#each row.cards as card (card.key)}
    <Card {card} why={whyLine(card.why)} caption={captionOf(card)} />
  {/each}
</CardStrip>
