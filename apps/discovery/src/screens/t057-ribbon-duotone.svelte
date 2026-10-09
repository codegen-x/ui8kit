<!-- Ribbon over a picture: the headline at the top start, a wide duotone banner with a strip of icon slots along its foot. -->
<script lang="ts">
  import { Block, Box, Button, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Group justify="between" align="end" class="px-16 pt-8 pb-12">
    <Title as={1} weight="bold" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Stack gap="4" class="max-w-sm"><Text class="text-muted-foreground">{c.lead}</Text><Button>{c.cta}</Button></Stack>
  </Group>
  <Box class="relative mx-16 mb-16 flex-1 overflow-hidden rounded">
    <Duotone v={2} alt={c.title} class="absolute inset-0" />
    <Group gap="0" justify="between" class="absolute inset-x-0 bottom-0 bg-background/80 px-16 py-8 backdrop-blur">
      {#each MARKS.slice(6, 14) as m (m)}<LucideIcon name={m} size={32} />{/each}
    </Group>
  </Box>
</Block>
