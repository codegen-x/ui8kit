<!-- Frame: a code window floating on a flat-shapes field at the end; command lines come from the deck. -->
<script lang="ts">
  import { Block, Box, Button, CodeWindow, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
  const lines = $derived(c.items.flatMap((it, i) => [
    { id: `c${i}`, text: it.title.toLowerCase(), kind: "command" },
    { id: `o${i}`, text: it.text, kind: "output" },
  ]));
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="secondary" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 pb-16">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative h-full overflow-hidden rounded">
      <Flat v={0} class="absolute inset-0" />
      <Box class="absolute inset-x-12 top-1/2 -translate-y-1/2 shadow-lg">
        <CodeWindow title={c.brand} prompt="$" {lines} />
      </Box>
    </Box>
  </Grid>
</Block>
