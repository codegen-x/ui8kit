<!-- Fashion catalogue: three tinted collection tiles with a round arrow, then a trending header with filter links and a row of five product tiles. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Link, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import Flat from "../recipes/flat.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
  const tints = ["bg-muted", "bg-secondary", "bg-accent"];
</script>

<Block tag="section" class="flex h-full flex-col gap-8 p-16">
  <Grid cols="3" class="h-72 gap-6">
    {#each c.items.slice(0, 3) as it, i (it.title)}
      <Box class={"relative flex flex-col justify-between overflow-hidden rounded p-6 " + tints[i]}>
        <Flat v={i} class="absolute right-0 bottom-0 h-40 w-40 rounded" />
        <Stack gap="2" class="relative self-start rounded bg-card p-4"><Text weight="semibold" class="text-xl uppercase">{c.tags[i + 1]}</Text><Text size="sm" class="max-w-40 text-muted-foreground">{it.text}</Text></Stack>
        <Button variant="outline" layout="icon" class="relative" aria-label={it.title}><LucideIcon name="arrow-right" size={16} /></Button>
      </Box>
    {/each}
  </Grid>
  <Group justify="between"><Title as={1} weight="bold" class="text-4xl uppercase">{c.eyebrow}</Title><Group gap="6">{#each c.tags as t, i (t)}<Text size="sm" class={i === 0 ? "border-b border-foreground font-semibold" : "text-muted-foreground"}>{t}</Text>{/each}<Text size="sm" weight="semibold">{c.secondary}</Text></Group></Group>
  <Grid cols="5" class="flex-1 gap-6">
    {#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
      <Stack gap="2">
        <Box class="relative flex-1 overflow-hidden rounded"><Geometric v={i} cols={3} rows={4} class="absolute inset-0" /><Button size="sm" variant="outline" layout="icon" class="absolute top-2 right-2" aria-label="Save"><LucideIcon name="heart" size={16} /></Button></Box>
        <Group justify="between"><Text size="sm" weight="semibold">{c.tags[i % 5]} {i + 1}</Text><Text size="sm" class="text-muted-foreground">{c.stats[i % 3]!.value}</Text></Group>
      </Stack>
    {/each}
  </Grid>
</Block>
