<!-- Full-bleed: a rings disc sits off the end edge; the headline runs over it in four huge lines, start-aligned. -->
<script lang="ts">
  import { Block, Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Box class="absolute top-24 -right-48 size-[880px] overflow-hidden rounded-full"><Rings v={2} class="h-full w-full" /></Box>
  <TopBar {c} layout="start" action="default" mark="bar" />
  <Stack gap="8" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="max-w-6xl text-[152px] leading-[0.92] tracking-tighter">{c.title}</Title>
    <Group gap="8"><Button size="lg">{c.cta}</Button><Text size="lg" class="max-w-md text-muted-foreground">{c.lead}</Text></Group>
  </Stack>
</Block>
