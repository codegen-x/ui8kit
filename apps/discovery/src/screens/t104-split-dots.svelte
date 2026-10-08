<!-- Split, media first: a dotted plate with a large badge on it at the start; the end half has the headline and a two-column list. -->
<script lang="ts">
  import { Badge, Block, Box, Button, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Box class="relative overflow-hidden rounded bg-muted">
      <Dots v={2} class="absolute inset-0" />
      <Badge size="lg" class="absolute bottom-8 left-8">{c.stats[0]!.value} {c.stats[0]!.label}</Badge>
    </Box>
    <Stack gap="8" justify="center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Grid cols="2" class="gap-8">{#each [...c.items, { title: c.accent, text: c.note }] as it, i (i)}<Stack gap="2"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>{/each}</Grid>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
  </Grid>
</Block>
