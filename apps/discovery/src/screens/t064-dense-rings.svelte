<!-- Dense catalogue: a filter row of badges, then six product-like cards with a rings plate, a name and a figure. -->
<script lang="ts">
  import { Badge, Block, Card, Grid, Group, Stack, Text, Title, Button } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { repeat } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" align="end" class="px-16 pt-4 pb-8">
    <Stack gap="4"><Title as={1} weight="bold" class="text-5xl tracking-tight">{c.title}</Title>
      <Group gap="2">{#each c.tags as t, i (t)}<Badge variant={i === 0 ? "default" : "outline"} size="lg">{t}</Badge>{/each}</Group></Stack>
    <Button variant="outline">{c.secondary}</Button>
  </Group>
  <Grid cols="3" class="flex-1 gap-6 px-16 pb-16" style="grid-template-rows:repeat(2,1fr)">
    {#each repeat(c.items, 6) as it, i (i)}
      <Card class="gap-0 overflow-hidden p-0">
        <Rings v={i} class="flex-1" />
        <Group justify="between" class="p-4"><Text weight="semibold">{it.title}</Text><Text weight="bold">{c.stats[i % 3]!.value}</Text></Group>
      </Card>
    {/each}
  </Grid>
</Block>
