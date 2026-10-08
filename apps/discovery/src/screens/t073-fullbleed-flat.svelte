<!-- Full-bleed colour: the primary colour fills the screen with a flat disc; the headline is cut out in the page colour. -->
<script lang="ts">
  import { Block, Box, Button, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col bg-primary text-primary-foreground">
  <Box class="absolute top-40 -right-32 size-[720px] overflow-hidden rounded-full"><Flat v={1} class="h-full w-full" /></Box>
  <TopBar {c} layout="start" tone="inverse" action="secondary" />
  <Stack gap="8" justify="end" class="relative flex-1 px-16 pb-16">
    <Title as={1} weight="bold" class="max-w-6xl text-[160px] leading-[0.88] tracking-tighter text-background">{c.title}</Title>
    <Group gap="8"><Button size="lg" variant="secondary">{c.cta}</Button><Text size="lg" class="max-w-md text-primary-foreground/80">{c.lead}</Text></Group>
  </Stack>
</Block>
