<!-- Airy: three small geometric marks in a row above a short headline and a single outline button; everything centred. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="bare" action="ghost" mark="square" />
  <Stack gap="12" align="center" justify="center" class="flex-1 text-center">
    <Group gap="4">
      <Geometric v={0} cols={1} rows={1} class="size-24 rounded" />
      <Geometric v={3} cols={1} rows={1} class="size-24 rounded" />
      <Geometric v={6} cols={1} rows={1} class="size-24 rounded" />
    </Group>
    <Stack gap="6" align="center">
      <Title as={1} weight="semibold" class="max-w-2xl text-5xl leading-tight tracking-tight">{c.title}</Title>
      <Text class="max-w-md text-muted-foreground">{c.lead}</Text>
    </Stack>
    <Button variant="outline" size="lg">{c.cta}</Button>
  </Stack>
</Block>
