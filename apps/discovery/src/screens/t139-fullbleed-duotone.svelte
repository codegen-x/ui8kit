<!-- Fashion hero: a dark rounded full-bleed panel with a huge headline, actions and three figures over a duotone figure plate, a benefit strip overlapping its foot, and a row of category links. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
  const perks = ["truck", "layers", "badge-check", "lock"];
</script>

<Block tag="section" class="flex h-full flex-col p-8">
  <Box class="relative flex flex-1 flex-col overflow-hidden rounded bg-foreground text-background">
    <Duotone v={0} alt={c.title} class="absolute top-20 right-0 bottom-0 w-1/2 opacity-70" />
    <Group justify="between" class="relative h-20 px-8"><Text class="font-bold tracking-widest uppercase">{c.brand}</Text><Group gap="8">{#each c.nav as n (n)}<Text size="sm" class="text-background">{n}</Text>{/each}</Group><Box class="w-24" /></Group>
    <Stack gap="6" justify="center" class="relative flex-1 px-16 pb-16">
      <Text size="xs" class="tracking-widest text-background uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-8xl leading-none tracking-tight">{c.title}</Title>
      <Text class="text-4xl text-background">{c.accent}</Text>
      <Text class="max-w-sm text-background">{c.lead}</Text>
      <Group gap="4"><Button size="lg" variant="secondary">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button><Button size="lg" variant="ghost" class="text-background"><LucideIcon name="play" size={16} />{c.secondary}</Button></Group>
      <Group gap="8">{#each c.stats as s (s.label)}<Stack gap="0"><Text class="text-3xl font-bold">{s.value}</Text><Text size="xs" class="text-background">{s.label}</Text></Stack>{/each}</Group>
    </Stack>
  </Box>
  <Grid cols="4" class="relative z-10 -mt-8 mx-8 gap-4 rounded bg-card p-6 shadow-lg inset-ring inset-ring-border">
    {#each c.items as it, i (it.title)}<Group gap="4"><LucideIcon name={perks[i]!} size={24} class="text-primary" /><Stack gap="0"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack></Group>{/each}
  </Grid>
  <Box class="h-8" />
</Block>
