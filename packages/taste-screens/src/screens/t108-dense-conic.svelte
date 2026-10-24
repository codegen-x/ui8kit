<!-- Dense palette library: a four by two grid of colour-wheel cards with names and a figure each. -->
<script lang="ts">
  import { Block, Box, Card, Grid, Group, Input, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { repeat } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" class="px-16 pb-8"><Title as={1} weight="bold" class="text-5xl tracking-tight">{c.title}</Title><Box class="w-96"><Input placeholder={c.input} /></Box></Group>
  <Grid cols="4" class="flex-1 gap-6 px-16 pb-16" style="grid-template-rows:repeat(2,1fr)">
    {#each repeat(c.items, 8) as it, i (i)}
      <Card class="gap-4 p-4">
        <Conic v={i % 2 === 0 ? 1 : 3} class="flex-1 rounded" />
        <Group justify="between"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{c.stats[i % 3]!.value}</Text></Group>
      </Card>
    {/each}
  </Grid>
</Block>
