<!-- Poster in a frame: a geometric border of shapes on all four sides, the headline and one action in the clear centre. -->
<script lang="ts">
  import { Block, Button, Grid, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="default" mark="square" />
  <Grid cols="1" class="flex-1 gap-0 px-16 pb-16" style="grid-template-rows:160px 1fr 160px">
    <Geometric v={1} cols={9} rows={1} />
    <Grid class="gap-0" style="grid-template-columns:160px 1fr 160px">
      <Geometric v={3} cols={1} rows={4} />
      <Stack gap="8" align="center" justify="center" class="px-16 text-center">
        <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
        <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
        <Button size="lg">{c.cta}</Button>
      </Stack>
      <Geometric v={5} cols={1} rows={4} />
    </Grid>
    <Geometric v={2} cols={9} rows={1} />
  </Grid>
</Block>
