<!-- Frame: a laptop (screen and base) with a mesh wallpaper and one small window open; the headline sits above it. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Group justify="between" align="end" class="px-16 pt-8">
    <Title as={1} weight="bold" class="max-w-3xl text-6xl leading-none tracking-tight">{c.title}</Title>
    <Stack gap="4" class="max-w-sm"><Text class="text-muted-foreground">{c.lead}</Text><Button class="self-start">{c.cta}</Button></Stack>
  </Group>
  <Stack gap="0" align="center" justify="end" class="flex-1">
    <Card class="h-[560px] w-[960px] gap-0 rounded-t-[24px] rounded-b-none bg-foreground p-4 pb-0">
      <Box class="relative flex-1 overflow-hidden rounded-t">
        <Mesh v={0} class="absolute inset-0" />
        <Card class="absolute top-16 left-16 w-80 gap-2 p-6 shadow-lg"><Text weight="semibold">{c.items[0]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text></Card>
      </Box>
    </Card>
    <Box class="h-6 w-[1120px] rounded-b bg-muted-foreground" />
  </Stack>
</Block>
