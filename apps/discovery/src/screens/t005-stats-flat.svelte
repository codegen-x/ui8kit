<!-- Stats: a left-aligned headline and lead, a flat-shapes panel at the end, four big figures in a ruled row below. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" />
  <Grid cols="3" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8" class="col-span-2">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
      <Group gap="4">
        <Button size="lg">{c.cta}</Button>
        <Button size="lg" variant="link">{c.secondary}</Button>
      </Group>
    </Stack>
    <Box class="aspect-square w-full overflow-hidden rounded">
      <Flat v={0} class="h-full w-full" />
    </Box>
  </Grid>
  <Stack gap="0" align="stretch" class="px-16 pb-16">
    <Separator />
    <Grid cols="4" class="gap-8 pt-8">
      {#each [...c.stats, c.stats[0]!] as s, i (i)}
        <Stack gap="2">
          <Text class="text-6xl font-bold tracking-tight">{s.value}</Text>
          <Text size="sm" class="text-muted-foreground">{s.label}</Text>
        </Stack>
      {/each}
    </Grid>
  </Stack>
</Block>
