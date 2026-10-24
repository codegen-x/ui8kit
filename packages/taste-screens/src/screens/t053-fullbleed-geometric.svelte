<!-- Full-bleed: geometric shapes cover the end half; uppercase type stacked huge at the start runs into the shapes. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Geometric v={4} cols={3} rows={4} class="absolute inset-y-0 right-0 w-1/2" />
  <TopBar {c} layout="bare" action="default" mark="square" />
  <Stack gap="8" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="max-w-5xl text-[144px] leading-[0.9] tracking-tight uppercase">{c.title}</Title>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Text size="lg" class="max-w-sm bg-background p-2">{c.lead}</Text></Group>
  </Stack>
</Block>
