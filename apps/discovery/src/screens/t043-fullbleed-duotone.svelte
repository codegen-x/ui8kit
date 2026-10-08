<!-- Full-bleed: a duotone picture fills the start 60%; the huge headline crosses from the picture onto the plain side. -->
<script lang="ts">
  import { Block, Button, Group, Link, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Duotone v={1} alt={c.title} class="absolute inset-y-0 left-0 w-3/5" />
  <TopBar {c} layout="bare" action="default" mark="square" />
  <Stack gap="8" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="max-w-6xl text-[160px] leading-[0.9] tracking-tighter mix-blend-difference">{c.title}</Title>
  </Stack>
  <Group justify="between" class="relative px-16 pb-12">
    <Group gap="8">{#each c.nav as n (n)}<Link href="#/" variant="nav" size="sm">{n}</Link>{/each}</Group>
    <Group gap="4"><Text class="max-w-sm text-right text-muted-foreground">{c.lead}</Text><Button size="lg">{c.cta}</Button></Group>
  </Group>
</Block>
