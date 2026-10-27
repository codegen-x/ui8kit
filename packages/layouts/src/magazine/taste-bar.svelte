<!-- The taste bar: the profile a feed is built from, as a description list (dt axis, dd value); a "tuned" mark, the Filters button and Reset. -->
<script lang="ts">
  import { Block, Box, Button, Group, Text } from "@codegen-x/svelte-compose";

  let { title, tuned, tunedLabel, filtersLabel, resetLabel, items, onfilters, onreset }: {
    title: string; tuned: boolean; tunedLabel: string; filtersLabel: string; resetLabel: string;
    items: Array<{ id: string; label: string; value: string }>; onfilters: () => void; onreset: () => void;
  } = $props();
</script>

<Block tag="section" class="ui8-taste-bar" aria-label={title} data-testid="taste-bar" data-tuned={tuned ? "1" : "0"}>
  <Group gap="2" class="ui8-taste-bar-head">
    <Text tag="span" weight="semibold">{title}</Text>
    {#if tuned}<Text tag="span" class="ui8-eyebrow">{tunedLabel}</Text>{/if}
    <Box class="ui8-taste-bar-spacer" />
    <Button size="sm" onclick={onfilters} data-testid="taste-filters">{filtersLabel}</Button>
    <Button size="sm" variant="outline" disabled={!tuned} onclick={onreset} data-testid="taste-reset">{resetLabel}</Button>
  </Group>
  <Box tag="dl" class="ui8-taste-bar-list">
    {#each items as item (item.id)}
      <Box>
        <Box tag="dt">{item.label}</Box>
        <Box tag="dd" class="ui8-taste-bar-value">{item.value}</Box>
      </Box>
    {/each}
  </Box>
</Block>
