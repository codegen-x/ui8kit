<!-- Full-bleed stripes: stripes cover the screen; a solid band runs across the middle with the headline and the action. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Stripes v={6} class="absolute inset-0" />
  <TopBar {c} layout="split" action="default" />
  <Stack align="stretch" justify="center" class="relative flex-1">
    <Group justify="between" align="center" class="bg-foreground px-16 py-12 text-background">
      <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight text-background">{c.title}</Title>
      <Stack gap="4" class="max-w-sm"><Text class="text-background/80">{c.lead}</Text><Button size="lg" variant="secondary" class="self-start">{c.cta}</Button></Stack>
    </Group>
  </Stack>
</Block>
