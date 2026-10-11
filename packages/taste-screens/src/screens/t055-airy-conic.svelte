<!-- Airy: one small colour-wheel disc high in the middle, a short headline under it, a text link; nothing else. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="ghost" mark="none" />
  <Stack gap="8" align="center" justify="center" class="flex-1 text-center">
    <Box class="size-40 overflow-hidden rounded-full"><Conic v={1} class="h-full w-full" /></Box>
    <Title as={1} weight="medium" class="max-w-xl text-5xl leading-tight tracking-tight">{c.title}</Title>
    <Text class="max-w-sm text-muted-foreground">{c.accent}</Text>
    <Button variant="link">{c.cta}</Button>
  </Stack>
</Block>
