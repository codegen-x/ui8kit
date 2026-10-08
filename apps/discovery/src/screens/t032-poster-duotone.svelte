<!-- Poster over a picture: a full-screen procedural duotone landscape, the headline large and centred on it. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Duotone v={3} alt={c.title} class="absolute inset-0" />
  <TopBar {c} layout="center" action="secondary" />
  <Stack gap="8" align="center" class="relative flex-1 justify-start px-16 pt-24 text-center">
    <Title as={1} weight="bold" class="max-w-5xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="secondary">{c.secondary}</Button></Group>
  </Stack>
</Block>
