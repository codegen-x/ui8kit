<!-- Poster under a spotlight: a conic beam falls from the top centre onto a huge centred headline. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Conic v={2} class="absolute inset-0 opacity-60" />
  <TopBar {c} layout="center" action="default" mark="none" />
  <Stack gap="8" align="center" justify="end" class="relative flex-1 px-16 pb-24 text-center">
    <Text size="sm" weight="semibold" class="tracking-widest text-muted-foreground uppercase">{c.eyebrow}</Text>
    <Title as={1} weight="bold" class="font-black max-w-6xl text-[136px] leading-[0.9] tracking-tighter">{c.title}</Title>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="link">{c.secondary}</Button></Group>
  </Stack>
</Block>
