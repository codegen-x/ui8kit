<!-- Ribbon: the headline at the start, a 5×2 board of icon slots at the end, and a conic sunburst band across the foot. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" mark="bar" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost">{c.secondary}</Button></Group>
    </Stack>
    <Grid cols="5" class="gap-0 rounded inset-ring inset-ring-border">
      {#each MARKS.slice(2, 12) as m (m)}
        <Box class="flex h-32 items-center justify-center text-muted-foreground"><LucideIcon name={m} size={36} /></Box>
      {/each}
    </Grid>
  </Grid>
  <Conic v={0} class="h-48" />
</Block>
