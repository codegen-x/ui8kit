<!-- Rental hero: headline and actions at the start over a mesh landscape, a floating search card at the end, a row of benefit cards overlapping the foot. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Field from "../parts/field.svelte";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
  const perks = ["truck", "tag", "shield-check", "clock"];
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Mesh v={2} class="absolute inset-x-0 top-0 h-3/4" />
  <TopBar {c} layout="start" action="default" />
  <Grid cols="2" class="relative flex-1 gap-8 px-16 pt-8">
    <Stack gap="6" class="rounded bg-background/80 p-8 self-start">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.accent}</Text>
      <Group gap="4"><Button size="lg">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button><Button size="lg" variant="outline"><LucideIcon name="play" size={16} />{c.secondary}</Button></Group>
    </Stack>
    <Card class="ml-auto w-96 gap-4 self-start p-6 shadow-lg">
      <Stack gap="0"><Text weight="semibold">{c.eyebrow}</Text><Text size="sm" class="text-muted-foreground">{c.lead}</Text></Stack>
      <Field label="Pick-up" value={c.input} icon="map-pin" />
      <Field label="From" value="Select date" icon="calendar" />
      <Field label="Until" value="Select date" icon="calendar" />
      <Button size="lg" class="w-full">{c.cta}<LucideIcon name="search" size={16} /></Button>
    </Card>
  </Grid>
  <Grid cols="4" class="relative mx-16 mb-8 gap-0 rounded bg-card p-6 shadow-lg inset-ring inset-ring-border">
    {#each c.items as it, i (it.title)}
      <Stack gap="2" align="center" class="px-4 text-center"><LucideIcon name={perks[i]!} size={24} class="text-primary" /><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack>
    {/each}
  </Grid>
</Block>
