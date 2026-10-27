<!-- "Same structure, different look": one layout in three skins; the button under a card applies its skin to the whole feed. The
     strip is @ui8kit/layouts/magazine/card-strip. -->
<script lang="ts">
  import CardStrip from "@ui8kit/layouts/magazine/card-strip.svelte";
  import ui from "../../content/ui.json";
  import type { FeedCard } from "../lib/feed";
  import SkinCell from "./skin-cell.svelte";

  let { cards }: { cards: FeedCard[] } = $props();
  const S = ui.feed.sections.structure;
</script>

<CardStrip title={S.title} note={S.note} label={S.title} data-testid="feed-section" data-section="structure">
  {#each cards as card, i (card.key)}
    <SkinCell {card} current={i === 0} />
  {/each}
</CardStrip>
