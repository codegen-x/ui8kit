<!-- Prompt as a thread: a striped rail at the start; a short message thread and a composer fill the rest of the screen. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Input, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full">
  <Stripes v={7} class="w-80" />
  <Stack gap="8" align="stretch" class="flex-1 px-24 py-16">
    <Group justify="between"><Group gap="2"><Box class="size-6 rounded bg-primary" /><Text weight="bold">{c.brand}</Text></Group><Button variant="outline">{c.secondary}</Button></Group>
    <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
    <Stack gap="4" align="stretch" justify="end" class="flex-1">
      <Box class="max-w-xl self-end rounded bg-primary px-6 py-4 text-primary-foreground">{c.input}</Box>
      <Box class="max-w-2xl rounded bg-muted px-6 py-4">{c.lead}</Box>
      <Box class="max-w-xl self-end rounded bg-primary px-6 py-4 text-primary-foreground">{c.items[0]!.title}</Box>
      <Box class="max-w-2xl rounded bg-muted px-6 py-4">{c.items[0]!.text} {c.accent}</Box>
    </Stack>
    <Card class="gap-0 p-2 shadow-lg"><Group gap="2"><Input size="lg" variant="ghost" placeholder={c.input} class="flex-1" /><Button size="lg">{c.cta}</Button></Group></Card>
  </Stack>
</Block>
