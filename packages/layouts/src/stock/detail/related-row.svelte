<!-- The similar assets: one row of cards (the storefront's card, through a snippet), picked by the app from the shared labels. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, List, ListItem, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { CardView, StockText } from "../text";

  let { t, cards, card }: { t: StockText; cards: CardView[]; card: Snippet<[CardView]> } = $props();
</script>

<Block tag="section" aria-labelledby="detail-similar-title" data-testid="similar">
  <Stack gap="4" align="stretch">
    <Title as={2} size="lg" weight="semibold" id="detail-similar-title">{t.detail.similar.title}</Title>
    {#if cards.length > 0}
      <List tag="ul" class="ui8-similar-row" data-testid="similar-row">
        {#each cards as c (c.key)}
          <ListItem>{@render card(c)}</ListItem>
        {/each}
      </List>
    {:else}
      <Text tag="p" size="sm" class="ui8-passport-muted">{t.detail.similar.none}</Text>
    {/if}
  </Stack>
</Block>
