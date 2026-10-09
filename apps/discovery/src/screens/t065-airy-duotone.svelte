<!-- Airy: a small headline high at the start, a small duotone square low at the end, one button between. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <TopBar {c} layout="bare" action="ghost" mark="bar" />
  <Stack gap="6" class="px-16 pt-24">
    <Title as={1} weight="regular" class="max-w-xl text-5xl leading-tight">{c.title}</Title>
    <Text class="max-w-sm text-muted-foreground">{c.accent}</Text>
    <Button variant="outline" class="mt-2">{c.cta}</Button>
  </Stack>
  <Box class="absolute right-16 bottom-16 size-80 overflow-hidden rounded"><Duotone v={0} alt={c.title} class="h-full w-full" /></Box>
</Block>
