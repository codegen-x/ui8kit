<!-- Food poster: a big conic plate behind a centred headline, a review chip and a delivery chip on either side, an order-process action and the figures below. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="default" />
  <Box class="relative flex flex-1 items-center justify-center">
    <Conic v={1} class="absolute top-0 left-1/2 aspect-square h-[560px] -translate-x-1/2 overflow-hidden" />
    <Stack gap="6" align="center" class="relative max-w-2xl rounded bg-background p-8 text-center shadow-lg">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline"><LucideIcon name="play" size={16} />{c.secondary}</Button></Group>
    </Stack>
    <Card class="absolute top-16 left-16 flex-row items-center gap-4 p-4 shadow-lg"><LucideIcon name="star" size={24} class="text-primary" /><Stack gap="0"><Text size="sm" weight="semibold">{c.stats[1]!.value}</Text><Text size="xs" class="text-muted-foreground">{c.stats[1]!.label}</Text></Stack></Card>
    <Card class="absolute right-16 bottom-16 flex-row items-center gap-4 p-4 shadow-lg"><LucideIcon name="timer" size={24} class="text-primary" /><Stack gap="0"><Text size="sm" weight="semibold">{c.tags[0]}</Text><Text size="xs" class="text-muted-foreground">{c.note}</Text></Stack></Card>
  </Box>
  <Grid cols="4" class="gap-8 px-16 py-8">
    {#each c.items as it, i (it.title)}<Stack gap="0"><Text size="xs" class="text-muted-foreground">0{i + 1}</Text><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>{/each}
  </Grid>
</Block>
