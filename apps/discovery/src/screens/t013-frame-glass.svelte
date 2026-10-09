<!-- Frame: a glass-over-glow backdrop with a floating app window: sidebar, a bar chart and three figures. -->
<script lang="ts">
  import { BarChart, Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { bars } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={2} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" />
  <Stack gap="4" align="center" class="relative px-16 pt-8 text-center">
    <Title as={1} weight="semibold" class="text-6xl tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
  </Stack>
  <Card class="relative mx-40 mt-12 mb-0 flex-1 flex-row gap-0 overflow-hidden rounded-b-none p-0 shadow-lg">
    <Stack gap="2" class="w-56 bg-muted p-6">
      <Text weight="bold" class="pb-4">{c.brand}</Text>
      {#each c.nav as n, i (n)}
        <Text size="sm" class={i === 0 ? "rounded bg-background px-3 py-2 font-medium" : "px-3 py-2 text-muted-foreground"}>{n}</Text>
      {/each}
    </Stack>
    <Stack gap="6" align="stretch" class="flex-1 p-8">
      <Group justify="between"><Text size="xl" weight="semibold">{c.eyebrow}</Text><Button size="sm">{c.cta}</Button></Group>
      <Grid cols="3" class="gap-4">
        {#each c.stats as s (s.label)}
          <Card variant="compact"><Text size="sm" class="text-muted-foreground">{s.label}</Text><Text size="3xl" weight="bold">{s.value}</Text></Card>
        {/each}
      </Grid>
      <BarChart bars={bars(3, 12)} label={c.eyebrow} height={200} />
    </Stack>
  </Card>
</Block>
