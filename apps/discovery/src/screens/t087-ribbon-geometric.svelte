<!-- Ribbon of tiles: the headline above, one long strip of geometric tiles across the screen, a logo row under it. -->
<script lang="ts">
  import { Block, Button, Group, LogoRibbon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { logos } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Stack gap="6" align="center" class="px-16 pt-12 pb-12 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost">{c.secondary}</Button></Group>
  </Stack>
  <Geometric v={3} cols={8} rows={1} class="h-44" />
  <Stack justify="center" class="flex-1"><LogoRibbon id="ribbon" title={c.note} logos={logos(c, 5, 3)} density="roomy" /></Stack>
</Block>
