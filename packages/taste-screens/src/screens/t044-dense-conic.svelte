<!-- Dense 3×3: the headline in the centre tile, conic plates in the corners, figures and copy in the edge tiles. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="3" class="flex-1 gap-4 px-16 pb-16" style="grid-template-rows:repeat(3,1fr)">
    <Conic v={0} class="rounded" />
    <Card variant="muted" class="justify-end"><Text class="text-5xl font-bold">{c.stats[0]!.value}</Text><Text class="text-muted-foreground">{c.stats[0]!.label}</Text></Card>
    <Conic v={3} class="rounded" />
    <Card class="justify-end gap-2"><Text weight="semibold">{c.items[0]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text></Card>
    <Card class="items-center justify-center gap-4 bg-primary text-center text-primary-foreground">
      <Title as={1} weight="bold" class="text-4xl leading-tight text-primary-foreground">{c.title}</Title>
      <Button variant="secondary">{c.cta}</Button>
    </Card>
    <Card class="justify-end gap-2"><Text weight="semibold">{c.items[1]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[1]!.text}</Text></Card>
    <Conic v={1} class="rounded" />
    <Card variant="muted" class="justify-end"><Text class="text-5xl font-bold">{c.stats[1]!.value}</Text><Text class="text-muted-foreground">{c.stats[1]!.label}</Text></Card>
    <Conic v={2} class="rounded bg-muted" />
  </Grid>
</Block>
