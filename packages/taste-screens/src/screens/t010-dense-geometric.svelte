<!-- Dense grid: a bento of six tiles; the large tile is a geometric pattern, the others mix copy, figures and shapes. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" />
  <Grid cols="4" class="flex-1 gap-4 px-16 pb-16" style="grid-template-rows:repeat(3,1fr)">
    <Card class="col-span-2 row-span-2 justify-end gap-6 p-12">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Card>
    <Geometric v={2} cols={4} rows={4} class="col-span-2 row-span-2 rounded" />
    {#each c.stats as s (s.label)}
      <Card variant="muted" class="justify-between">
        <Text class="text-5xl font-bold">{s.value}</Text>
        <Text size="sm" class="text-muted-foreground">{s.label}</Text>
      </Card>
    {/each}
    <Card class="justify-between bg-primary text-primary-foreground">
      <Text weight="semibold">{c.items[0]!.title}</Text>
      <Text size="sm" class="opacity-80">{c.items[0]!.text}</Text>
    </Card>
  </Grid>
</Block>
