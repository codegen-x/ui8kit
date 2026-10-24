<!-- Frame: headline above a browser window whose page is a conic sunburst with a centred card. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <TopBar {c} layout="split" action="default" />
  <Stack gap="6" align="center" class="px-16 pt-12 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-6xl leading-tight tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button>{c.cta}</Button><Button variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Card class="mx-32 mt-12 flex-1 gap-0 overflow-hidden p-0 shadow-lg">
    <Group gap="2" class="h-10 px-4">
      <Box class="size-3 rounded-full bg-destructive" /><Box class="size-3 rounded-full bg-chart-4" /><Box class="size-3 rounded-full bg-chart-2" />
    </Group>
    <Box class="relative flex-1">
      <Conic v={0} class="absolute inset-0" />
      <Card class="absolute top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 gap-4">
        <Text weight="semibold">{c.items[0]!.title}</Text>
        <Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text>
        <Button size="sm" class="self-start">{c.cta}</Button>
      </Card>
    </Box>
  </Card>
</Block>
