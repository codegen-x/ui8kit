<!-- Airy corner: a quarter of a ring field peeks from the bottom end corner; a small headline rests high at the start. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col overflow-hidden">
  <Box class="absolute -right-80 -bottom-80 size-[960px] overflow-hidden rounded-full"><Rings v={3} class="h-full w-full" /></Box>
  <TopBar {c} layout="bare" action="ghost" mark="circle" />
  <Stack gap="6" class="relative px-16 pt-32">
    <Text size="sm" class="text-muted-foreground">{c.eyebrow}</Text>
    <Title as={1} weight="regular" class="font-light max-w-xl text-6xl leading-tight">{c.title}</Title>
    <Button variant="outline" class="mt-4">{c.cta}</Button>
  </Stack>
</Block>
