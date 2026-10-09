<!-- Airy: one thin ring drawn in the middle of the page, a short headline and a link inside it. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="ghost" mark="none" />
  <Stack align="center" justify="center" class="flex-1">
    <Box class="relative size-[600px]">
      <Rings v={2} class="absolute inset-0 rounded-full opacity-40" />
      <Stack gap="6" align="center" justify="center" class="absolute inset-16 rounded-full bg-background text-center">
        <Title as={1} weight="medium" class="max-w-sm text-4xl leading-tight">{c.title}</Title>
        <Text size="sm" class="max-w-xs text-muted-foreground">{c.accent}</Text>
        <Button variant="link">{c.cta}</Button>
      </Stack>
    </Box>
  </Stack>
</Block>
