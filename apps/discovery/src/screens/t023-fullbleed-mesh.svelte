<!-- Full-bleed: a mesh field fills the screen; the headline is set huge at the bottom edge, nav and action float on top. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Mesh v={3} class="absolute inset-0" />
  <TopBar {c} layout="start" action="secondary" />
  <Stack gap="8" justify="end" class="relative flex-1 px-16 pb-12">
    <Group gap="4"><Button size="lg">{c.cta}</Button><Text class="max-w-md">{c.lead}</Text></Group>
    <Title as={1} weight="bold" class="text-[200px] leading-[0.85] tracking-tighter">{c.title}</Title>
  </Stack>
</Block>
