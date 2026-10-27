<!-- The head of a collection: its heading and note, a compact list of its styles (each a card, rendered by the app through `pick`),
     and an open legend of the words a recommended card uses for why it is there. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Box, Disclosure, List, ListItem, Summary, Text, Title } from "@codegen-x/svelte-compose";

  let { title, note, stripLabel, legendTitle, legendNote, keys, legend, pick }: {
    title: string; note: string; stripLabel: string; legendTitle: string; legendNote: string;
    keys: string[]; legend: Array<{ term: string; phrase: string; meaning: string }>; pick: Snippet<[string]>;
  } = $props();
</script>

<Block tag="section" class="mb-8" aria-labelledby="collection-title" data-testid="collection-header">
  <Title as={2} weight="semibold" class="mt-6 mb-2 text-xl leading-normal" id="collection-title" data-testid="collection-title">{title}</Title>
  <Text class="text-sm leading-normal text-muted-foreground">{note}</Text>
  <List tag="ul" class="mb-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]" aria-label={stripLabel} data-testid="picks-strip">
    {#each keys as key (key)}
      <ListItem class="max-w-36 min-w-24 shrink-0 grow basis-24">{@render pick(key)}</ListItem>
    {/each}
  </List>
  <Disclosure variant="ghost" class="text-sm leading-normal" open data-testid="why-legend">
    <Summary variant="ghost" class="mb-2 justify-start py-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">{legendTitle}</Summary>
    <Text class="text-sm leading-normal text-muted-foreground">{legendNote}</Text>
    <Box tag="dl" class="m-0 grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-x-6 gap-y-2">
      {#each legend as l (l.term)}
        <Box class="flex flex-col gap-2">
          <Box tag="dt" class="font-semibold first-letter:uppercase">{l.phrase}</Box>
          <Box tag="dd" class="m-0 text-xs leading-4 text-muted-foreground">{l.meaning}</Box>
        </Box>
      {/each}
    </Box>
  </Disclosure>
</Block>
