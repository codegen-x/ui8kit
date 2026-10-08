<!-- Full-bleed picture: a duotone landscape fills the screen; the copy sits in a solid page-coloured box at the bottom start. -->
<script lang="ts">
  import { Block, Box, Button, Group, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Duotone v={5} alt={c.title} class="absolute inset-0" />
  <TopBar {c} layout="split" tone="inverse" action="secondary" />
  <Box class="relative mt-auto mb-16 ml-16 flex max-w-2xl flex-col gap-6 rounded bg-background p-10">
    <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Box>
</Block>
