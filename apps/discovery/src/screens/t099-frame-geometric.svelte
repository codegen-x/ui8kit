<!-- Frame, tilted: a large tablet frame turned slightly, showing a geometric gallery; the headline overlaps its corner. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col overflow-hidden">
  <TopBar {c} layout="split" action="default" />
  <Card class="absolute top-48 -right-24 h-[720px] w-[1000px] rotate-[-8deg] gap-0 rounded-[40px] bg-foreground p-5 shadow-lg">
    <Geometric v={4} cols={4} rows={3} class="flex-1 overflow-hidden rounded-[24px]" />
  </Card>
  <Stack gap="8" justify="end" class="relative flex-1 px-16 pb-16">
    <Box class="flex max-w-2xl flex-col gap-6 rounded bg-background p-10 shadow-lg">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Box>
  </Stack>
</Block>
