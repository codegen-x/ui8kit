<!-- Poster, start-aligned: a dot field over the whole screen, the headline in two big lines, the action low at the end. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Dots v={2} class="absolute inset-0" />
  <TopBar {c} layout="start" action="ghost" mark="circle" />
  <Stack gap="6" justify="center" class="relative flex-1 px-16">
    <Text size="lg" weight="semibold" class="text-primary">{c.eyebrow}</Text>
    <Title as={1} weight="bold" class="max-w-5xl text-9xl leading-[0.95] tracking-tighter">{c.title}</Title>
  </Stack>
  <Group justify="between" align="end" class="relative px-16 pb-16">
    <Text size="xl" class="max-w-lg">{c.lead}</Text>
    <Button size="lg">{c.cta}</Button>
  </Group>
</Block>
