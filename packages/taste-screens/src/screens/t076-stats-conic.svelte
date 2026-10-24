<!-- Stats as a gauge: a half-disc conic sweep with the main figure in its centre, other figures listed beside it. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Separator, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Stack gap="4" class="px-16 pt-12">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
  </Stack>
  <Grid cols="2" class="flex-1 items-end gap-16 px-16 pb-16">
    <Box class="relative h-[400px] overflow-hidden rounded-t-full">
      <Conic v={1} class="absolute inset-x-0 top-0 h-[800px] rounded-full" />
      <Stack gap="0" align="center" class="absolute inset-x-0 bottom-0 mx-auto w-1/2 rounded-t-full bg-background pt-16">
        <Text class="text-7xl font-bold">{c.stats[0]!.value}</Text><Text class="text-muted-foreground">{c.stats[0]!.label}</Text>
      </Stack>
    </Box>
    <Stack gap="6" align="stretch">
      {#each c.stats.slice(1) as s (s.label)}
        <Separator /><Stack gap="0"><Text class="text-5xl font-bold">{s.value}</Text><Text class="text-muted-foreground">{s.label}</Text></Stack>
      {/each}
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
  </Grid>
</Block>
