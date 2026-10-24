<!-- Ribbon of medallions: the headline at the start top, then a row of six ring medallions with names under each. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { repeat } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" align="end" class="px-16 pt-16">
    <Stack gap="6" class="max-w-3xl"><Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title><Text size="lg" class="text-muted-foreground">{c.lead}</Text></Stack>
    <Button size="lg">{c.cta}</Button>
  </Group>
  <Grid cols="6" class="flex-1 items-center gap-8 px-16">
    {#each repeat([...c.items.map((i) => i.title), ...c.tags], 6) as n, i (i)}
      <Stack gap="4" align="center"><Box class="size-40 overflow-hidden rounded-full"><Rings v={i} class="h-full w-full" /></Box><Text weight="semibold">{n}</Text></Stack>
    {/each}
  </Grid>
</Block>
