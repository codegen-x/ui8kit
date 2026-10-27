<!-- The grid of the current page: one list item per card, keyed, so a page change unmounts every card and its live render. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { List, ListItem } from "@codegen-x/svelte-compose";
  import type { CardView } from "./text";

  let { cards, card, wide = false }: { cards: CardView[]; card: Snippet<[CardView]>; wide?: boolean } = $props();
</script>

<List tag="ul" class={"grid grid-cols-1 gap-4 sm:grid-cols-2 " + (wide ? "lg:grid-cols-3 2xl:grid-cols-4" : "xl:grid-cols-3")} data-testid="card-grid">
  {#each cards as c (c.key)}
    <ListItem>{@render card(c)}</ListItem>
  {/each}
</List>
