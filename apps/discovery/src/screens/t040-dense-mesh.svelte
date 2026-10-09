<!-- Dense masonry: three columns of mesh cards of different heights, the headline card in the middle column. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Grid cols="3" class="flex-1 gap-4 overflow-hidden px-16 pb-0">
    <Stack gap="4" align="stretch">
      <Mesh v={0} class="h-96 rounded" />
      <Card variant="muted" class="gap-2"><Text weight="semibold">{c.items[0]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text></Card>
      <Mesh v={3} class="h-80 rounded" />
    </Stack>
    <Stack gap="4" align="stretch">
      <Card class="gap-6 p-10">
        <Title as={1} weight="bold" class="text-5xl leading-none tracking-tight">{c.title}</Title>
        <Text class="text-muted-foreground">{c.lead}</Text>
        <Button class="self-start">{c.cta}</Button>
      </Card>
      <Mesh v={1} class="h-[520px] rounded" />
    </Stack>
    <Stack gap="4" align="stretch">
      <Mesh v={2} class="h-56 rounded" />
      <Card variant="muted" class="gap-2"><Text class="text-4xl font-bold">{c.stats[0]!.value}</Text><Text size="sm" class="text-muted-foreground">{c.stats[0]!.label}</Text></Card>
      <Mesh v={0} class="h-[440px] rounded" />
    </Stack>
  </Grid>
</Block>
