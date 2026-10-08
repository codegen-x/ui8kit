<!-- Dense grid: a catalogue header row and a 4×2 grid of duotone tiles, each with a short caption under it. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { repeat } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Group justify="between" align="end" class="px-16 pt-8 pb-8">
    <Stack gap="2"><Title as={1} weight="bold" class="text-5xl tracking-tight">{c.title}</Title><Text class="text-muted-foreground">{c.lead}</Text></Stack>
    <Button>{c.cta}</Button>
  </Group>
  <Grid cols="4" class="flex-1 gap-6 px-16 pb-16" style="grid-template-rows:repeat(2,1fr)">
    {#each repeat(c.items, 8) as it, i (i)}
      <Stack gap="2" align="stretch">
        <Duotone v={i} alt={it.title} class="flex-1 rounded" />
        <Text size="sm" weight="semibold">{it.title}</Text>
      </Stack>
    {/each}
  </Grid>
</Block>
