<!-- Prompt: a mesh field, the headline, and one large input with an action as the whole call to action; chips below. -->
<script lang="ts">
  import { Block, Box, Button, Group, Input, Stack, Text, Title, TopicChips } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { topics } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Mesh v={2} class="absolute inset-0 opacity-70" />
  <TopBar {c} layout="start" action="secondary" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Box class="w-full max-w-3xl rounded bg-background p-2 shadow-lg">
      <Group gap="2">
        <Input size="lg" variant="ghost" class="flex-1 bg-transparent" placeholder={c.input} />
        <Button size="lg">{c.cta}</Button>
      </Group>
    </Box>
    <TopicChips topics={topics(c)} />
  </Stack>
</Block>
