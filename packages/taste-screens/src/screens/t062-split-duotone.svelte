<!-- Split: a rating line and actions at the start; at the end two duotone cards fanned on top of each other. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Rating, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8">
      <Group gap="2"><Rating value={5} label={c.stats[2]!.label} /><Text size="sm" class="text-muted-foreground">{c.stats[2]!.value} {c.stats[2]!.label}</Text></Group>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="secondary">{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative h-[680px]">
      <Box class="absolute top-0 right-24 h-[520px] w-[400px] rotate-6 overflow-hidden rounded shadow-lg"><Duotone v={3} alt={c.title} class="h-full w-full" /></Box>
      <Box class="absolute bottom-0 left-8 h-[520px] w-[400px] -rotate-3 overflow-hidden rounded shadow-lg"><Duotone v={1} alt={c.title} class="h-full w-full" /></Box>
    </Box>
  </Grid>
</Block>
