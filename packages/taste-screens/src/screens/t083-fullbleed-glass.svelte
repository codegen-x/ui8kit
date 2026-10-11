<!-- Full-bleed glass: glow and frosted panels everywhere; the headline is set huge at the start, a frosted card sits at the end. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={0} class="absolute inset-0" />
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="3" class="relative flex-1 items-end gap-16 px-16 pb-16">
    <Title as={1} weight="bold" class="col-span-2 text-[120px] leading-[0.9] tracking-tighter">{c.title}</Title>
    <Box class="flex flex-col gap-4 rounded bg-background/40 p-8 inset-ring inset-ring-foreground/10 backdrop-blur-2xl">
      <Text weight="semibold">{c.accent}</Text>
      <Text size="sm" class="text-muted-foreground">{c.lead}</Text>
      <Button class="self-start">{c.cta}</Button>
    </Box>
  </Grid>
</Block>
