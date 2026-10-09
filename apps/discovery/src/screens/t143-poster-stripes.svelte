<!-- Fashion poster: a huge condensed headline at the start and a big arch plate at the end, a benefit line, a row of round category discs and two banner cards. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";
  import Flat from "../recipes/flat.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
  const marks = ["heart", "layers", "tag", "star", "sparkles", "zap", "compass", "house"];
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <Group justify="between" class="h-12 px-16 text-sm"><Text size="sm">{c.items[2]!.text}</Text><Text size="sm">{c.items[3]!.text}</Text><Text size="sm">{c.secondary}</Text></Group>
  <Group justify="between" class="h-20 px-16"><Text class="text-lg font-bold tracking-widest uppercase">{c.brand}</Text><Group gap="8">{#each c.nav as n (n)}<Text size="sm">{n}</Text>{/each}</Group><Group gap="2" class="rounded bg-card px-4 py-2 inset-ring inset-ring-border"><LucideIcon name="search" size={16} /><Text size="sm" class="text-muted-foreground">{c.input}</Text></Group></Group>
  <Box class="relative h-[360px]">
    <Stack gap="4" class="relative z-10 px-16"><Text size="xs" class="tracking-widest uppercase">{c.eyebrow}</Text><Title as={1} weight="bold" class="text-9xl leading-none tracking-tight uppercase">{c.title}</Title><Text class="text-3xl">{c.accent}</Text><Group gap="4"><Button size="lg">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button><Group gap="2"><Avatars n={4} size={24} /><Text size="sm">{c.note}</Text></Group></Group></Stack>
    <Flat v={3} class="absolute top-0 right-16 h-full w-96 overflow-hidden rounded" />
  </Box>
  <Group gap="8" justify="between" class="px-16 py-6">
    {#each c.tags as t, i (t)}<Stack gap="2" align="center"><Box class="flex h-20 w-20 items-center justify-center bg-card inset-ring inset-ring-border" style="border-radius:50%"><LucideIcon name={marks[i]!} size={24} /></Box><Text size="xs">{t}</Text></Stack>{/each}
  </Group>
  <Grid cols="2" class="flex-1 gap-8 px-16 pb-8">
    {#each c.items.slice(0, 2) as it, i (it.title)}
      <Box class={"relative flex flex-col justify-end overflow-hidden rounded p-6 " + (i ? "bg-secondary" : "bg-accent")}>
        <Stripes v={i} class="absolute top-0 right-0 h-full w-1/3 opacity-60" />
        <Stack gap="2" class="relative max-w-xs rounded bg-card p-4"><Text size="xs" class="tracking-widest uppercase">{c.eyebrow}</Text><Title as={2} weight="bold" class="text-3xl uppercase">{it.title}</Title><Text size="sm">{it.text}</Text><Button class="self-start">{c.secondary}</Button></Stack>
      </Box>
    {/each}
  </Grid>
</Block>
