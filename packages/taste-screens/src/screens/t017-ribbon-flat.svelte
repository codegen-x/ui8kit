<!-- Ribbon: a split hero with a flat-shapes panel, then a full-width strip of eight icon slots on the muted band. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, IconBadge, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Box class="h-[560px] overflow-hidden rounded"><Flat v={1} class="h-full w-full" /></Box>
  </Grid>
  <Stack gap="6" align="center" class="bg-muted px-16 py-12">
    <Text size="sm" weight="semibold" class="text-muted-foreground">{c.note}</Text>
    <Group gap="12">
      {#each MARKS.slice(4, 12) as m (m)}
        <IconBadge size="lg" variant="outline"><LucideIcon name={m} size={24} /></IconBadge>
      {/each}
    </Group>
  </Stack>
</Block>
