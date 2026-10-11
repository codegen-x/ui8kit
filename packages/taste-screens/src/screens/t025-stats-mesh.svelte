<!-- Stats: the headline at the start; at the end a card of three meters over a mesh plate, with the figures as captions. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, MeterRow, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
  const levels = [86, 64, 92];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 pb-16">
    <Stack gap="8">
      <Text size="sm" weight="semibold" class="text-muted-foreground">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative h-full overflow-hidden rounded">
      <Mesh v={0} class="absolute inset-0" />
      <Card class="absolute inset-x-12 bottom-12 gap-6 shadow-lg">
        <Text size="lg" weight="semibold">{c.accent}</Text>
        {#each c.stats as s, i (s.label)}
          <MeterRow label={s.label} value={levels[i] ?? 50} caption={s.value} />
        {/each}
      </Card>
    </Box>
  </Grid>
</Block>
