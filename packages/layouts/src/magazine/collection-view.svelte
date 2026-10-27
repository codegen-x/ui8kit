<!-- One collection as a page: the way back, its title (or the missing one), the count and its cards in a grid (the children), or the
     line for an empty one. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, LinkPlain, Text, Title } from "@codegen-x/svelte-compose";
  import Page from "./page.svelte";

  let { id, backLabel, backHref, title, found, count, empty, children }: {
    id: string; backLabel: string; backHref: string; title: string; /** the collection exists */ found: boolean;
    count: string; /** the line for no cards; the grid otherwise */ empty?: string; children?: Snippet;
  } = $props();
</script>

<Page data-testid="magazine-collection" data-id={id}>
  <Text class="mb-2"><LinkPlain href={backHref} class="text-sm leading-normal text-foreground underline-offset-4 hover:underline">{backLabel}</LinkPlain></Text>
  {#if !found}
    <Title as={1} weight="bold" class="mb-4 text-2xl leading-normal wrap-anywhere">{title}</Title>
  {:else}
    <Title as={1} weight="bold" class="mb-4 text-2xl leading-normal wrap-anywhere" data-testid="collection-title">{title}</Title>
    <Text class="text-sm leading-normal text-muted-foreground" data-testid="collection-count">{count}</Text>
    {#if empty}
      <Text class="text-sm leading-normal text-muted-foreground" data-testid="collection-empty">{empty}</Text>
    {:else if children}
      <Box class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">{@render children()}</Box>
    {/if}
  {/if}
</Page>
