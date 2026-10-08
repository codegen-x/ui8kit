<!-- Frame on top: a browser window with a gallery of duotone tiles fills the upper part; the headline sits under it. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Card class="mx-16 h-[560px] gap-0 overflow-hidden p-0 shadow-lg">
    <Group gap="2" class="h-10 bg-muted px-4"><Box class="size-3 rounded-full bg-border" /><Box class="size-3 rounded-full bg-border" /><Box class="size-3 rounded-full bg-border" /></Group>
    <Grid cols="4" class="flex-1 gap-2 p-2">
      <Duotone v={1} alt={c.title} class="col-span-2 row-span-2 rounded" />
      <Duotone v={0} alt={c.title} class="rounded" /><Duotone v={3} alt={c.title} class="rounded" />
      <Duotone v={2} alt={c.title} class="rounded" /><Duotone v={5} alt={c.title} class="rounded" />
    </Grid>
  </Card>
  <Group justify="between" align="center" class="flex-1 px-16">
    <Title as={1} weight="bold" class="max-w-3xl text-6xl leading-none tracking-tight">{c.title}</Title>
    <Stack gap="4" class="max-w-sm"><Text class="text-muted-foreground">{c.lead}</Text><Group gap="4"><Button>{c.cta}</Button><Button variant="outline">{c.secondary}</Button></Group></Stack>
  </Group>
</Block>
