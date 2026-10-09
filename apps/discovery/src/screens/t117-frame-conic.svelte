<!-- Frame pair: a code window and an overlapping picture window with a colour wheel; copy centred above them. -->
<script lang="ts">
  import { Block, Box, Button, Card, CodeWindow, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
  const lines = $derived([...c.items.map((it, i) => ({ id: `c${i}`, text: it.title.toLowerCase(), kind: "command" })), { id: "note", text: c.note, kind: "output" }]);
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Stack gap="6" align="center" class="px-16 pt-8 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Box class="relative mx-auto mt-12 h-[480px] w-[1040px]">
    <Box class="absolute top-0 left-0 w-[600px] shadow-lg"><CodeWindow title={c.brand} prompt="$" {lines} /></Box>
    <Card class="absolute top-16 right-0 h-[400px] w-[520px] gap-0 overflow-hidden p-0 shadow-lg">
      <Group gap="2" class="h-10 bg-muted px-4"><Box class="size-3 rounded-full bg-border" /><Box class="size-3 rounded-full bg-border" /><Box class="size-3 rounded-full bg-border" /></Group>
      <Conic v={1} class="flex-1" />
    </Card>
  </Box>
</Block>
