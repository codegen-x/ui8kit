<!-- Full-bleed: the headline breaks over three huge lines; a stripes band runs behind the middle line edge to edge. -->
<script lang="ts">
  import { Block, Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Box class="absolute inset-x-0 top-[392px] h-56"><Stripes v={2} class="h-full w-full" /></Box>
  <TopBar {c} layout="split" action="default" mark="bar" />
  <Stack gap="0" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="text-[176px] leading-[1.1] tracking-tighter uppercase">{c.title}</Title>
  </Stack>
  <Group justify="between" align="end" class="relative px-16 pb-16">
    <Text size="xl" class="max-w-xl">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Group>
</Block>
