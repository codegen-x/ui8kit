<!-- One collection as a page: the way back, its title (or the missing one), the count and its cards in a grid (the children), or the
     line for an empty one. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, LinkPlain, Text } from "@codegen-x/svelte-compose";
  import Page from "./page.svelte";
  import PageTitle from "./page-title.svelte";

  let { id, backLabel, backHref, title, found, count, empty, children }: {
    id: string; backLabel: string; backHref: string; title: string; /** the collection exists */ found: boolean;
    count: string; /** the line for no cards; the grid otherwise */ empty?: string; children?: Snippet;
  } = $props();
</script>

<Page data-testid="magazine-collection" data-id={id}>
  <Text class="ui8-collection-view-back"><LinkPlain href={backHref} class="ui8-text-link">{backLabel}</LinkPlain></Text>
  {#if !found}
    <PageTitle text={title} />
  {:else}
    <PageTitle text={title} data-testid="collection-title" />
    <Text class="ui8-collection-view-note" data-testid="collection-count">{count}</Text>
    {#if empty}
      <Text class="ui8-collection-view-note" data-testid="collection-empty">{empty}</Text>
    {:else if children}
      <Box class="ui8-collection-view-grid">{@render children()}</Box>
    {/if}
  {/if}
</Page>
