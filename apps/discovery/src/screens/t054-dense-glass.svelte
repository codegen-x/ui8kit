<!-- Dense glass: a glow field under a 4×3 grid of frosted tiles; the headline spans the first two tiles. -->
<script lang="ts">
  import { Block, Box, Button, Grid, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { GLYPHS, repeat } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={0} class="absolute inset-0" />
  <TopBar {c} layout="start" action="secondary" />
  <Grid cols="4" class="relative flex-1 gap-4 px-16 pb-16" style="grid-template-rows:repeat(3,1fr)">
    <Stack gap="6" justify="end" class="col-span-2 rounded bg-background/60 p-10 backdrop-blur-xl">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Button class="self-start">{c.cta}</Button>
    </Stack>
    {#each repeat(c.items, 10) as it, i (i)}
      <Box class="flex flex-col justify-between rounded bg-background/40 p-6 inset-ring inset-ring-foreground/10 backdrop-blur-xl">
        <LucideIcon name={GLYPHS[i % GLYPHS.length]!} size={28} />
        <Text weight="semibold">{it.title}</Text>
      </Box>
    {/each}
  </Grid>
</Block>
