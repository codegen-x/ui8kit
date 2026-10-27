<!-- One section of the feed: a heading, a note and a strip of cards (@ui8kit/layouts/magazine/card-strip), each with the line that
     says why it is here. -->
<script lang="ts">
  import CardStrip from "@ui8kit/layouts/magazine/card-strip.svelte";
  import type { FeedCard } from "../lib/feed";
  import Card from "../parts/card.svelte";
  import { whyText } from "./labels";

  let { id, title, note, cards, label = title }: { id: string; title: string; note: string; cards: FeedCard[]; /** the landmark name, when the title repeats */ label?: string } = $props();
</script>

<CardStrip {title} {note} {label} data-testid="feed-section" data-section={id}>
  {#each cards as card (card.key)}
    <Card {card} why={whyText(card.why)} />
  {/each}
</CardStrip>
