<!-- Airy: one centred line of headline with a dotted rule beneath it, and nothing else but a quiet link. -->
<script lang="ts">
  import { Block, Button, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="ghost" mark="none" />
  <Stack gap="8" align="center" justify="center" class="flex-1 px-16 text-center">
    <Title as={1} weight="medium" class="text-5xl tracking-tight">{c.title}</Title>
    <Dots v={5} class="h-8 w-96" />
    <Text class="max-w-md text-muted-foreground">{c.accent}</Text>
    <Button variant="link">{c.cta}</Button>
  </Stack>
</Block>
