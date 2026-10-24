<!-- Stats: a wide duotone banner with the headline on a solid plate, three ruled figure columns under it. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Separator, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Box class="relative mx-16 h-[480px] overflow-hidden rounded">
    <Duotone v={0} alt={c.title} class="absolute inset-0" />
    <Stack gap="4" class="absolute bottom-8 left-8 max-w-2xl rounded bg-background p-8">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text class="text-muted-foreground">{c.lead}</Text>
      <Button class="self-start">{c.cta}</Button>
    </Stack>
  </Box>
  <Grid cols="3" class="flex-1 gap-16 px-16 py-12">
    {#each c.stats as s, i (s.label)}
      <Stack gap="4" align="stretch">
        <Separator />
        <Text class="text-7xl font-bold tracking-tight">{s.value}</Text>
        <Text weight="semibold">{s.label}</Text>
        <Text size="sm" class="text-muted-foreground">{c.items[i]!.text}</Text>
      </Stack>
    {/each}
  </Grid>
</Block>
