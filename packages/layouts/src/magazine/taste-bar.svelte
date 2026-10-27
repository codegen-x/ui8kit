<!-- The taste bar: the profile a feed is built from, as a description list (dt axis, dd value); a "tuned" mark, the Filters button and Reset. -->
<script lang="ts">
  import { Block, Box, Button, Group, Text } from "@codegen-x/svelte-compose";

  let { title, tuned, tunedLabel, filtersLabel, resetLabel, items, onfilters, onreset }: {
    title: string; tuned: boolean; tunedLabel: string; filtersLabel: string; resetLabel: string;
    items: Array<{ id: string; label: string; value: string }>; onfilters: () => void; onreset: () => void;
  } = $props();
</script>

<Block tag="section" class="mt-4 mb-8 rounded border border-border bg-card p-4 text-card-foreground" aria-label={title} data-testid="taste-bar" data-tuned={tuned ? "1" : "0"}>
  <Group gap="2" class="mb-2 flex-wrap">
    <Text tag="span" weight="semibold">{title}</Text>
    {#if tuned}<Text tag="span" class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{tunedLabel}</Text>{/if}
    <Box class="flex-1" />
    <Button size="sm" onclick={onfilters} data-testid="taste-filters">{filtersLabel}</Button>
    <Button size="sm" variant="outline" disabled={!tuned} onclick={onreset} data-testid="taste-reset">{resetLabel}</Button>
  </Group>
  <Box tag="dl" class="m-0 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
    {#each items as item (item.id)}
      <Box>
        <Box tag="dt">{item.label}</Box>
        <Box tag="dd" class="m-0 wrap-anywhere">{item.value}</Box>
      </Box>
    {/each}
  </Box>
</Block>
