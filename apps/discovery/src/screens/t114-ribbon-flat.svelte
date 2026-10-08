<!-- Ribbon of words: the headline above, then a tilted band of huge repeated tags with flat shapes between the words. -->
<script lang="ts">
  import { Block, Box, Button, Group, Inline, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col overflow-hidden">
  <TopBar {c} layout="start" action="default" />
  <Stack gap="6" class="px-16 pt-16">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Group gap="4"><Text size="lg" class="max-w-lg text-muted-foreground">{c.lead}</Text><Button size="lg">{c.cta}</Button></Group>
  </Stack>
  <Stack justify="center" class="flex-1">
    <Group gap="8" class="-mx-16 -rotate-3 bg-primary px-8 py-8 whitespace-nowrap text-primary-foreground">
      {#each [...c.tags, ...c.tags] as t, i (i)}<Inline class="text-7xl font-bold">{t}</Inline><Box class="size-16 shrink-0 overflow-hidden rounded-full"><Flat v={i} class="h-full w-full" /></Box>{/each}
    </Group>
  </Stack>
</Block>
