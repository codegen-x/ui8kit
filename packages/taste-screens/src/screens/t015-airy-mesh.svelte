<!-- Airy: the headline low at the start, a small mesh card high at the end, one quiet link; wide empty middle. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <TopBar {c} layout="bare" action="ghost" mark="none" />
  <Box class="absolute top-32 right-16 h-72 w-96 overflow-hidden rounded">
    <Mesh v={1} class="h-full w-full" />
  </Box>
  <Stack gap="6" justify="end" class="flex-1 px-16 pb-24">
    <Title as={1} weight="regular" class="max-w-3xl text-6xl leading-tight tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-lg text-muted-foreground">{c.lead}</Text>
    <Button variant="link" class="px-0">{c.cta}</Button>
  </Stack>
</Block>
