<!-- Poster block: a fine-line stripes field, the headline set in one solid primary block at the centre. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Stripes v={1} class="absolute inset-0 opacity-40" />
  <TopBar {c} layout="split" action="default" mark="bar" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1">
    <Box class="bg-primary px-16 py-12 text-primary-foreground">
      <Title as={1} weight="bold" class="max-w-4xl text-center text-8xl leading-none tracking-tight text-primary-foreground uppercase">{c.title}</Title>
    </Box>
    <Text size="xl" class="max-w-xl bg-background px-4 text-center">{c.lead}</Text>
    <Button size="lg" variant="outline">{c.cta}</Button>
  </Stack>
</Block>
