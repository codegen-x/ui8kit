<!-- Centered poster headline over a full mesh field; one primary action and a quiet secondary link. -->
<script lang="ts">
  import { Block, Button, Badge, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Mesh v={0} class="absolute inset-0" />
  <TopBar {c} layout="split" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 pb-24 text-center">
    <Badge variant="outline" size="lg">{c.eyebrow}</Badge>
    <Title as={1} weight="bold" class="max-w-5xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4">
      <Button size="lg">{c.cta}</Button>
      <Button size="lg" variant="ghost">{c.secondary}</Button>
    </Group>
  </Stack>
</Block>
