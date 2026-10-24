<!-- Ribbon: a grain field holds the headline on the top half; a plain lower band carries a big row of icon slots. -->
<script lang="ts">
  import { Block, Box, Button, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <Box class="relative flex h-[680px] flex-col">
    <Grain v={2} class="absolute inset-0" />
    <TopBar {c} layout="split" action="secondary" />
    <Stack gap="8" justify="center" class="relative flex-1 px-16">
      <Title as={1} weight="bold" class="max-w-4xl text-8xl leading-none tracking-tight">{c.title}</Title>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Text size="lg" class="max-w-md">{c.lead}</Text></Group>
    </Stack>
  </Box>
  <Stack gap="8" align="center" justify="center" class="flex-1">
    <Text size="sm" weight="semibold" class="text-muted-foreground">{c.note}</Text>
    <Group gap="12" class="text-muted-foreground">{#each MARKS.slice(10, 16) as m (m)}<LucideIcon name={m} size={48} strokeWidth={1.5} />{/each}</Group>
  </Stack>
</Block>
