<!-- Car shop catalogue: a ribbon of brand-style name tiles, a centred heading with a filter bar and a four by two product grid. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Field from "../parts/field.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
  const names = $derived([...c.tags, ...c.tags, ...c.tags]);
</script>

<Block tag="section" class="flex h-full flex-col">
  <Grid cols="6" class="gap-2 p-8">{#each names.slice(0, 6) as n, i (i)}<Box class="flex h-12 items-center justify-center rounded bg-card text-sm font-medium inset-ring inset-ring-border">{n}</Box>{/each}</Grid>
  <Stack gap="4" align="center" class="px-16">
    <Title as={1} weight="medium" class="text-4xl tracking-tight">{c.title}</Title>
    <Group gap="2"><Field label="Type" value={c.tags[0]!} /><Field label="Model" value="Any" /><Field label="Location" value={c.input} icon="map-pin" /><Button size="lg"><LucideIcon name="search" size={16} />{c.cta}</Button></Group>
  </Stack>
  <Grid cols="4" class="flex-1 gap-6 px-16 py-8">
    {#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
      <Card class="gap-0 overflow-hidden p-0">
        <Box class="h-32 bg-muted p-4"><Flat v={i % 4} class="h-full w-full rounded" /></Box>
        <Group justify="between" class="px-4 py-2"><Text size="sm" weight="semibold">{c.tags[i % 4]} {i + 1}</Text><Text size="sm" class="text-muted-foreground">{c.stats[i % 4]!.value}</Text></Group>
      </Card>
    {/each}
  </Grid>
</Block>
