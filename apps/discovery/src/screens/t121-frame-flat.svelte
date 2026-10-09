<!-- Store hero: a tinted panel with the headline at the start and a flat plate at the end carrying a floating stats card and category chips; a benefit strip below. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title, Badge } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { GLYPHS } from "../kit-data";
  import Avatars from "../parts/avatars.svelte";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
  const perks = ["truck", "shield-check", "lock", "headphones"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Grid cols="2" class="mx-16 flex-1 gap-8 rounded bg-muted p-8">
    <Stack gap="6" justify="center" class="px-8">
      <Badge variant="secondary" size="lg" class="self-start">{c.eyebrow}</Badge>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="max-w-md text-muted-foreground">{c.lead}</Text>
      <Button size="lg" class="self-start">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button>
    </Stack>
    <Box class="relative overflow-hidden rounded">
      <Flat v={1} class="absolute inset-0" />
      <Card class="absolute top-8 right-8 w-64 gap-4 p-6 shadow-lg">
        <Text class="text-4xl font-bold tracking-tight">{c.stats[0]!.value}</Text>
        <Text size="sm" class="text-muted-foreground">{c.stats[0]!.label}</Text>
        <Avatars n={3} />
      </Card>
      <Grid cols="2" class="absolute right-8 bottom-8 w-80 gap-2">
        {#each c.tags as t, i (t)}
          <Button variant="outline" size="sm" class="justify-between">{t}<LucideIcon name="arrow-up-right" size={16} /></Button>
        {/each}
      </Grid>
    </Box>
  </Grid>
  <Grid cols="4" class="mx-16 my-8 gap-4 rounded bg-card p-6 inset-ring inset-ring-border">
    {#each c.items as it, i (it.title)}
      <Group gap="4"><LucideIcon name={perks[i % perks.length] ?? GLYPHS[0]!} size={24} class="text-primary" /><Stack gap="0"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack></Group>
    {/each}
  </Grid>
</Block>
