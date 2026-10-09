<!-- Stats panel: a glow field; one frosted card with the main figure at the start and a bar chart card at the end. -->
<script lang="ts">
  import { BarChart, Block, Box, Grid, Stack, Text, Title, Button } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { bars } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={5} class="absolute inset-0" />
  <TopBar {c} layout="start" action="outline" />
  <Stack gap="4" class="relative px-16 pt-8"><Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title><Text size="lg" class="max-w-2xl text-muted-foreground">{c.lead}</Text></Stack>
  <Grid cols="3" class="relative flex-1 gap-6 p-16">
    <Box class="flex flex-col justify-between rounded bg-background/50 p-8 inset-ring inset-ring-foreground/10 backdrop-blur-xl">
      <Text weight="semibold">{c.stats[0]!.label}</Text>
      <Text class="text-8xl font-bold tracking-tight">{c.stats[0]!.value}</Text>
      <Button class="self-start">{c.cta}</Button>
    </Box>
    <Box class="col-span-2 flex flex-col gap-4 rounded bg-background/50 p-8 inset-ring inset-ring-foreground/10 backdrop-blur-xl">
      <Text weight="semibold">{c.stats[1]!.label} · {c.stats[1]!.value}</Text>
      <BarChart bars={bars(11, 20)} label={c.eyebrow} height={240} class="w-full" />
    </Box>
  </Grid>
</Block>
