<!-- Dense bento: a four by three grid mixing flat shape tiles, a headline tile, figure tiles and a call tile. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Grid cols="4" class="flex-1 gap-4 px-16 pb-16" style="grid-template-rows:repeat(3,1fr)">
    <Card class="col-span-2 row-span-2 justify-end gap-4 p-8"><Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title><Text class="text-muted-foreground">{c.lead}</Text></Card>
    <Flat v={0} class="rounded" />
    <Card class="justify-between p-6"><Text class="text-5xl font-bold">{c.stats[0]!.value}</Text><Text size="sm" class="text-muted-foreground">{c.stats[0]!.label}</Text></Card>
    <Flat v={2} class="col-span-2 rounded" />
    <Card class="justify-between bg-primary p-6 text-primary-foreground"><Text weight="semibold">{c.accent}</Text><Button variant="secondary" class="self-start">{c.cta}</Button></Card>
    {#each c.items as it (it.title)}<Card class="justify-end gap-2 p-6"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Card>{/each}
  </Grid>
</Block>
