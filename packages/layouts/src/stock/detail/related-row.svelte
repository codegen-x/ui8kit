<!-- A row of related assets (same composition pattern, the same blocks, similar): its heading and one row of cards (the storefront's
     card, through a snippet), picked by the app from the index; none says so. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, List, ListItem, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { CardView, RelatedView, StockText } from "../text";

  let { t, row, card }: { t: StockText; row: RelatedView; card: Snippet<[CardView]> } = $props();
</script>

<Block tag="section" aria-labelledby={"detail-related-" + row.id} data-testid={"related-" + row.id}>
  <Stack gap="4" align="stretch">
    <Title as={2} size="lg" weight="semibold" id={"detail-related-" + row.id}>{row.title}</Title>
    {#if row.cards.length > 0}
      <List tag="ul" class="ui8-related-row" data-testid="related-row">
        {#each row.cards as c (c.key)}
          <ListItem>{@render card(c)}</ListItem>
        {/each}
      </List>
    {:else}
      <Text tag="p" size="sm" class="ui8-passport-muted">{row.none}</Text>
    {/if}
  </Stack>
</Block>
