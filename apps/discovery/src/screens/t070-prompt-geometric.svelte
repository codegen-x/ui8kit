<!-- Prompt: geometric columns frame both edges; in the clear middle the headline and a search field with an action. -->
<script lang="ts">
  import { Block, Button, Group, Input, Stack, Text, Title, TopicChips } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { topics } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Geometric v={6} cols={2} rows={6} class="absolute inset-y-0 left-0 w-60" />
  <Geometric v={2} cols={2} rows={6} class="absolute inset-y-0 right-0 w-60" />
  <Stack gap="0" align="stretch" class="relative mx-60 flex-1 bg-background">
    <TopBar {c} layout="center" action="default" mark="square" />
    <Stack gap="8" align="center" justify="center" class="flex-1 px-16 text-center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="max-w-xl text-muted-foreground">{c.lead}</Text>
      <Group gap="2" class="w-full max-w-2xl"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
      <TopicChips topics={topics(c, 1)} />
    </Stack>
  </Stack>
</Block>
