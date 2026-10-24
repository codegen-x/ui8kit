<!-- Poster on a pane: a glow field, one big frosted plate in the centre carrying a huge headline and the action. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={1} class="absolute inset-0" />
  <TopBar {c} layout="center" action="default" />
  <Stack align="center" justify="center" class="relative flex-1 px-16">
    <Box class="flex max-w-5xl flex-col items-center gap-8 rounded bg-background/40 px-16 py-16 text-center inset-ring inset-ring-foreground/10 backdrop-blur-2xl">
      <Title as={1} weight="bold" class="text-8xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
      <Button size="lg">{c.cta}</Button>
    </Box>
  </Stack>
</Block>
