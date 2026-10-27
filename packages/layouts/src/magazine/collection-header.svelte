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

<Block tag="section" class="ui8-collection-header" aria-labelledby="collection-title" data-testid="collection-header">
  <Title as={2} weight="semibold" class="ui8-collection-header-title" id="collection-title" data-testid="collection-title">{title}</Title>
  <Text class="ui8-collection-header-note">{note}</Text>
  <List tag="ul" class="ui8-collection-header-picks" aria-label={stripLabel} data-testid="picks-strip">
    {#each keys as key (key)}
      <ListItem class="ui8-collection-header-pick">{@render pick(key)}</ListItem>
    {/each}
  </List>
  <Disclosure variant="ghost" class="ui8-collection-header-legend" open data-testid="why-legend">
    <Summary variant="ghost" class="ui8-collection-header-legend-title">{legendTitle}</Summary>
    <Text class="ui8-collection-header-note">{legendNote}</Text>
    <Box tag="dl" class="ui8-collection-header-legend-list">
      {#each legend as l (l.term)}
        <Box class="ui8-collection-header-legend-item">
          <Box tag="dt" class="ui8-collection-header-legend-term">{l.phrase}</Box>
          <Box tag="dd" class="ui8-collection-header-legend-meaning">{l.meaning}</Box>
        </Box>
      {/each}
    </Box>
  </Disclosure>
</Block>
