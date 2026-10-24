<!-- "Same structure, different look": one layout in three skins; the button under a card applies its skin to the whole feed. -->
<script lang="ts">
  import { Block, Box, Text, Title } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import type { FeedCard } from "../lib/feed";
  import SkinCell from "./skin-cell.svelte";

  let { cards }: { cards: FeedCard[] } = $props();
  const S = ui.feed.sections.structure;
</script>

<Block tag="section" class="mg-row" aria-label={S.title} data-testid="feed-section" data-section="structure">
  <Title as={2} class="mg-h2">{S.title}</Title>
  <Text class="mg-note">{S.note}</Text>
  <Box class="mg-strip mg-strip-3">
    {#each cards as card, i (card.key)}
      <SkinCell {card} current={i === 0} />
    {/each}
  </Box>
</Block>
