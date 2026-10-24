<!-- Poster, stacked words: a mesh field behind; each word of the headline sits on its own line, huge and start-aligned. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
  const words = $derived(c.title.split(" "));
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Mesh v={7} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" mark="bar" />
  <Group justify="between" align="end" class="relative flex-1 px-16 pb-16">
    <Stack gap="0">{#each words as w, i (i)}<Title as={i === 0 ? 1 : 2} weight="bold" class="text-[132px] leading-[0.88] tracking-tighter">{w}</Title>{/each}</Stack>
    <Stack gap="6" class="max-w-xs pb-4"><Text size="lg">{c.lead}</Text><Button size="lg" class="self-start">{c.cta}</Button></Stack>
  </Group>
</Block>
