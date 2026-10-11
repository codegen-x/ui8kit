<!-- Full-bleed horizon: conic rays rise from the bottom half like a sunrise; the headline fills the sky above them. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Conic v={0} class="absolute inset-x-0 bottom-0 h-1/2" />
  <TopBar {c} layout="start" action="default" />
  <Stack gap="8" align="center" class="relative px-16 pt-16 text-center">
    <Title as={1} weight="bold" class="text-[148px] leading-[0.9] tracking-tighter">{c.title}</Title>
    <Group gap="4"><Text size="lg" class="max-w-md text-muted-foreground">{c.lead}</Text><Button size="lg">{c.cta}</Button></Group>
  </Stack>
</Block>
