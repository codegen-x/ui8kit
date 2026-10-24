<!-- Ribbon: a centred hero over a rings field, then the kit LogoRibbon of abstract icon slots across the bottom. -->
<script lang="ts">
  import { Block, Button, Group, LogoRibbon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { logos } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" mark="circle" />
  <Stack gap="8" align="center" class="relative flex-1 justify-center overflow-hidden px-16 text-center">
    <Rings v={0} class="absolute inset-x-32 inset-y-8 rounded opacity-60" />
    <Title as={1} weight="bold" class="relative max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="relative max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4" class="relative">
      <Button size="lg">{c.cta}</Button>
      <Button size="lg" variant="secondary">{c.secondary}</Button>
    </Group>
  </Stack>
  <LogoRibbon id="ribbon" title={c.note} logos={logos(c, 7)} tone="muted" density="roomy" />
</Block>
