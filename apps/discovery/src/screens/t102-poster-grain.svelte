<!-- Poster on a disc: one enormous grain circle in the centre of a plain page, the headline and action set on top of it. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col overflow-hidden">
  <Box class="absolute top-1/2 left-1/2 size-[960px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"><Grain v={0} class="h-full w-full" /></Box>
  <TopBar {c} layout="split" action="default" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-xl">{c.lead}</Text>
    <Button size="lg" variant="secondary">{c.cta}</Button>
  </Stack>
</Block>
