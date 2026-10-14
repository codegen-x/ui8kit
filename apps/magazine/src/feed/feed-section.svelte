<!-- One section of the feed: a heading, a note and a strip of cards, each with the line that says why it is here. -->
<script lang="ts">
  import { Block, Box, Text, Title } from "@ui8kit/svelte-ui";
  import type { FeedCard } from "../lib/feed";
  import Card from "../parts/card.svelte";
  import { whyText } from "./labels";

  let { id, title, note, cards, label = title }: { id: string; title: string; note: string; cards: FeedCard[]; /** the landmark name, when the title repeats */ label?: string } = $props();
</script>

<Block tag="section" class="mg-row" aria-label={label} data-testid="feed-section" data-section={id}>
  <Title as={2} class="mg-h2">{title}</Title>
  <Text class="mg-note">{note}</Text>
  <Box class="mg-strip">
    {#each cards as card (card.key)}
      <Card {card} why={whyText(card.why)} />
    {/each}
  </Box>
</Block>
