<!-- Stats: a tall grain plate at the start carries one huge figure; the headline, two figures and a bar chart at the end. -->
<script lang="ts">
  import { BarChart, Block, Box, Button, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { bars } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="3" class="flex-1 gap-16 px-16 pb-16">
    <Box class="relative overflow-hidden rounded">
      <Grain v={3} class="absolute inset-0" />
      <Stack gap="2" class="absolute bottom-8 left-8 text-background">
        <Text class="text-9xl leading-none font-bold">{c.stats[0]!.value}</Text>
        <Text size="lg" weight="semibold">{c.stats[0]!.label}</Text>
      </Stack>
    </Box>
    <Stack gap="8" justify="center" class="col-span-2">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
      <Grid cols="2" class="gap-8">
        {#each c.stats.slice(1) as s (s.label)}
          <Stack gap="0"><Text class="text-5xl font-bold">{s.value}</Text><Text class="text-muted-foreground">{s.label}</Text></Stack>
        {/each}
      </Grid>
      <BarChart bars={bars(7, 16)} label={c.eyebrow} height={160} class="w-full" />
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
  </Grid>
</Block>
