<!-- Full-bleed figure: a dot field with one giant figure set across it; the headline is small at the bottom start. -->
<script lang="ts">
  import { Block, Button, Group, Inline, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Dots v={0} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" />
  <Stack align="center" justify="center" class="relative flex-1"><Inline class="text-[320px] leading-none font-black tracking-tighter text-primary">{c.stats[1]!.value}</Inline></Stack>
  <Group justify="between" align="end" class="relative px-16 pb-16">
    <Stack gap="4" class="max-w-xl"><Title as={1} weight="bold" class="text-5xl leading-tight tracking-tight">{c.title}</Title><Text class="text-muted-foreground">{c.stats[1]!.label} · {c.lead}</Text></Stack>
    <Button size="lg">{c.cta}</Button>
  </Group>
</Block>
