<!-- Rental responsive: a wide desktop frame beside a narrow mobile column, both with the headline over a ring plate and a search card. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Field from "../parts/field.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full items-stretch gap-8 bg-muted p-8">
  <Card class="relative flex-1 gap-0 overflow-hidden p-0 shadow-lg">
    <Group justify="between" class="h-16 px-8"><Text class="font-bold">{c.brand}</Text><Group gap="6">{#each c.nav.slice(0, 3) as n (n)}<Text size="sm" class="text-muted-foreground">{n}</Text>{/each}</Group><Button size="sm">{c.cta}</Button></Group>
    <Box class="relative flex-1">
      <Rings v={0} class="absolute inset-0" />
      <Stack gap="4" class="relative max-w-md p-8"><Title as={1} weight="bold" class="rounded bg-background/80 p-4 text-6xl leading-none tracking-tight">{c.title}</Title><Button size="lg" class="self-start">{c.secondary}<LucideIcon name="arrow-right" size={16} /></Button></Stack>
      <Card class="absolute right-8 bottom-8 w-80 gap-2 p-6 shadow-lg"><Text weight="semibold">{c.eyebrow}</Text><Field label="Pick-up" value={c.input} icon="map-pin" /><Field label="Dates" value="Select dates" icon="calendar" /><Button class="w-full">{c.cta}</Button></Card>
    </Box>
    <Grid cols="4" class="gap-4 p-8">{#each c.items as it (it.title)}<Stack gap="0" align="center" class="text-center"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack>{/each}</Grid>
  </Card>
  <Card class="w-96 gap-0 overflow-hidden p-0 shadow-lg">
    <Group justify="between" class="h-16 px-6"><Text class="font-bold">{c.brand}</Text><LucideIcon name="search" size={20} /></Group>
    <Stack gap="4" class="p-6"><Title as={2} weight="bold" class="text-4xl leading-none tracking-tight">{c.title}</Title><Button class="self-start">{c.secondary}</Button></Stack>
    <Rings v={2} class="mx-6 h-48 rounded" />
    <Stack gap="2" class="p-6"><Field label="Pick-up" value={c.input} icon="map-pin" /><Button class="w-full">{c.cta}</Button></Stack>
    <Grid cols="2" class="gap-4 px-6 pb-6">{#each c.items as it (it.title)}<Stack gap="0"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack>{/each}</Grid>
  </Card>
</Block>
