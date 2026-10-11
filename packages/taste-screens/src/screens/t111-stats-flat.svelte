<!-- Stats as shapes: three flat discs of growing size in a row, each holding a figure; the headline sits above them. -->
<script lang="ts">
  import { Block, Box, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
  const SIZE = ["size-64", "size-80", "size-[400px]"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" align="end" class="px-16 pt-8">
    <Title as={1} weight="bold" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Button size="lg">{c.cta}</Button>
  </Group>
  <Group justify="center" align="end" gap="8" class="flex-1 px-16 pb-16">
    {#each c.stats as s, i (s.label)}
      <Box class={"relative overflow-hidden rounded-full " + SIZE[i]}>
        <Flat v={i + 6} class="absolute inset-0" />
        <Stack gap="0" align="center" justify="center" class="absolute inset-0 text-center"><Text class="text-6xl font-bold">{s.value}</Text><Text weight="medium">{s.label}</Text></Stack>
      </Box>
    {/each}
  </Group>
</Block>
