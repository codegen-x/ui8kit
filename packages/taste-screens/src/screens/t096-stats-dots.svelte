<!-- Stats as progress: a dotted plate at the end; at the start the headline and meter rows for each figure. -->
<script lang="ts">
  import { Block, Button, Card, Grid, MeterRow, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
  const levels = [86, 64, 42];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 pb-16">
    <Stack gap="8" align="stretch">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Card class="gap-6 p-8">{#each c.stats as s, i (s.label)}<MeterRow label={s.label} value={levels[i] ?? 50} caption={s.value} />{/each}</Card>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Dots v={3} class="h-full rounded" />
  </Grid>
</Block>
