<!-- Shop dashboard: an icon rail at the start, a command bar on top, a yellow-tinted promo card beside a bar chart card, a row of four colourful product tiles and two stat cards at the end. -->
<script lang="ts">
  import { BarChart, Block, Box, Button, Card, Grid, Group, Input, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { bars } from "../kit-data";
  import Conic from "../recipes/conic.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
  const rail = ["house", "layers", "users", "shop", "tag"];
  const tiles = ["bg-secondary", "bg-muted", "bg-accent", "bg-card"];
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <Group justify="between" class="h-20 px-8"><Text class="text-lg font-bold">{c.brand}</Text><Group gap="2" class="w-1/2 rounded bg-card px-4 py-2 inset-ring inset-ring-border"><LucideIcon name="search" size={16} class="text-muted-foreground" /><Input variant="ghost" placeholder={c.input} class="flex-1" /></Group><Button><LucideIcon name="sparkles" size={16} />{c.cta}</Button></Group>
  <Grid cols="12" class="mx-8 mb-8 flex-1 gap-0 rounded bg-card">
    <Stack gap="6" align="center" class="col-span-1 p-4 pt-8">
      {#each c.tags as t, i (t)}<Stack gap="0" align="center"><Box class={"flex h-10 w-10 items-center justify-center rounded " + (i === 3 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}><LucideIcon name={i === 3 ? "tag" : rail[i]!} size={20} /></Box><Text size="xs" class="text-muted-foreground">{t}</Text></Stack>{/each}
    </Stack>
    <Stack gap="6" class="col-span-8 p-6">
      <Grid cols="3" class="h-72 gap-4">
        <Box class="relative col-span-2 overflow-hidden rounded bg-secondary p-6"><Conic v={2} class="absolute top-0 right-0 h-full w-1/2" /><Title as={1} weight="bold" class="relative max-w-md self-start rounded bg-card p-4 text-5xl tracking-tight">{c.title}</Title><Card class="relative mt-6 w-64 gap-2 p-4"><Text size="sm" weight="semibold">{c.items[0]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text></Card></Box>
        <Card class="gap-4 p-4"><Text size="sm" weight="semibold">{c.stats[2]!.label}</Text><BarChart bars={bars(7, 7)} label={c.stats[2]!.label} height={200} class="w-full" /></Card>
      </Grid>
      <Group justify="between"><Text weight="semibold">{c.eyebrow}</Text><Group gap="2"><Button variant="outline" size="sm">{c.note}</Button><Button size="sm">{c.secondary}</Button></Group></Group>
      <Grid cols="4" class="flex-1 gap-4">{#each c.items as it, i (it.title)}<Stack gap="2"><Box class={"flex-1 overflow-hidden rounded " + tiles[i]}><Flat v={i} class="h-full w-full" /></Box><Group justify="between"><Text size="sm" weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Group></Stack>{/each}</Grid>
    </Stack>
    <Stack gap="8" justify="center" class="col-span-3 p-8">
      {#each c.stats.slice(0, 2) as s (s.label)}<Stack gap="2"><Box class="flex h-10 w-10 items-center justify-center rounded bg-secondary"><LucideIcon name="users" size={20} /></Box><Text size="sm" class="text-muted-foreground">{s.label}</Text><Text class="text-5xl font-light tracking-tight">{s.value}</Text></Stack>{/each}
    </Stack>
  </Grid>
</Block>
