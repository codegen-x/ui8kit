<!-- Stats in shapes: the headline on top, a row of four big geometric tiles each carrying one figure in its corner. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
  const four = $derived([...c.stats, { value: c.tags[0]!, label: c.tags[1]! }]);
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" />
  <Group justify="between" align="end" class="px-16 pt-16">
    <Stack gap="6"><Title as={1} weight="bold" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title><Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text></Stack>
    <Button size="lg">{c.cta}</Button>
  </Group>
  <Grid cols="4" class="flex-1 gap-4 px-16 py-16">
    {#each four as s, i (i)}
      <Box class="relative overflow-hidden rounded">
        <Geometric v={i * 2 + 1} cols={2} rows={3} class="absolute inset-0" />
        <Stack gap="0" class="absolute inset-x-4 bottom-4 rounded bg-background p-4">
          <Text class="text-4xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text>
        </Stack>
      </Box>
    {/each}
  </Grid>
</Block>
