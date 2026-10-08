<!-- Poster on grain: a dark grain field edge to edge, a huge centred headline, a single line of figures under the action. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col text-background">
  <Grain v={1} class="absolute inset-0" />
  <TopBar {c} layout="split" tone="inverse" action="secondary" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="bold" class="max-w-5xl text-[128px] leading-[0.95] tracking-tight text-background">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-background/80">{c.lead}</Text>
    <Button size="lg" variant="secondary">{c.cta}</Button>
    <Group gap="12" class="pt-8">
      {#each c.stats as s (s.label)}<Text weight="semibold" class="text-background">{s.value} <Text class="inline font-normal text-background/70">{s.label}</Text></Text>{/each}
    </Group>
  </Stack>
</Block>
