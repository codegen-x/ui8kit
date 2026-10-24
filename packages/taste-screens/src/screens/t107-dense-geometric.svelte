<!-- Dense board: three columns of task-like cards, each card with a geometric thumbnail, a title and badges. -->
<script lang="ts">
  import { Badge, Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" class="px-16 pb-8"><Title as={1} weight="bold" class="text-5xl tracking-tight">{c.title}</Title><Button variant="outline">{c.secondary}</Button></Group>
  <Grid cols="3" class="flex-1 gap-6 px-16 pb-16">
    {#each c.tags as t, col (t)}
      <Stack gap="4" align="stretch" class="rounded bg-muted p-4">
        <Group justify="between"><Text weight="semibold">{t}</Text><Badge variant="secondary">{col + 2}</Badge></Group>
        {#each c.items.slice(0, col === 1 ? 3 : 2) as it, i (it.title)}
          <Card class="gap-4 p-4">
            {#if (i + col) % 2 === 0}<Geometric v={col * 3 + i} cols={4} rows={1} class="h-20 overflow-hidden rounded" />{/if}
            <Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text>
            <Group gap="2"><Badge variant="outline">{c.nav[i]}</Badge></Group>
          </Card>
        {/each}
      </Stack>
    {/each}
  </Grid>
</Block>
