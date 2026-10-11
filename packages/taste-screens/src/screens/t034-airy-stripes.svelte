<!-- Airy: one line of headline, a short lead and a button in the middle, a thin stripes band along the bottom edge. -->
<script lang="ts">
  import { Block, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="ghost" mark="none" />
  <Stack gap="6" align="center" justify="center" class="flex-1 text-center">
    <Title as={1} weight="medium" class="text-5xl tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-md text-muted-foreground">{c.accent}</Text>
    <Button size="lg" class="mt-6">{c.cta}</Button>
  </Stack>
  <Stripes v={1} class="h-24" />
</Block>
