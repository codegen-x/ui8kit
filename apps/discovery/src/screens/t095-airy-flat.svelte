<!-- Airy: one small flat shape above a short headline, both low and left of centre; the rest of the page stays empty. -->
<script lang="ts">
  import { Block, Box, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="ghost" mark="none" />
  <Stack gap="8" justify="end" class="flex-1 pb-32 pl-64">
    <Box class="size-24 overflow-hidden rounded"><Flat v={5} class="h-full w-full" /></Box>
    <Title as={1} weight="regular" class="max-w-xl text-5xl leading-tight">{c.title}</Title>
    <Group gap="8"><Text class="max-w-xs text-muted-foreground">{c.accent}</Text><Button variant="link">{c.cta}</Button></Group>
  </Stack>
</Block>
