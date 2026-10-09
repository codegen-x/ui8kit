<!-- Full-bleed type: a grain band across the width, then the headline set huge to both edges; lead and action under it. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="bare" action="secondary" mark="bar" />
  <Stack gap="0" align="stretch" justify="end" class="flex-1 px-16 pb-16">
    <Grain v={1} class="mb-12 h-80 w-full rounded" />
    <Title as={1} weight="bold" class="text-[168px] leading-[0.88] tracking-tighter">{c.title}</Title>
    <Group justify="between" align="end" class="pt-12">
      <Text size="xl" class="max-w-xl text-muted-foreground">{c.lead}</Text>
      <Button size="lg">{c.cta}</Button>
    </Group>
  </Stack>
</Block>
