<!-- The grid of the current page: one list item per card, keyed, so a page change unmounts every card and its live render. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { List, ListItem } from "@codegen-x/svelte-compose";
  import type { CardView } from "./text";

  let { cards, card }: { cards: CardView[]; card: Snippet<[CardView]> } = $props();
</script>

<List tag="ul" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="card-grid">
  {#each cards as c (c.key)}
    <ListItem>{@render card(c)}</ListItem>
  {/each}
</List>
