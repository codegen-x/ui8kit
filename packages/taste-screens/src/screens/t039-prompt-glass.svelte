<!-- Prompt: a chat card on glass: two message bubbles above a textarea and a send action, the headline over it. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Stack, Text, Textarea, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={3} class="absolute inset-0" />
  <TopBar {c} layout="split" action="outline" />
  <Stack gap="8" align="center" class="relative flex-1 justify-center px-16">
    <Title as={1} weight="bold" class="max-w-4xl text-center text-6xl leading-none tracking-tight">{c.title}</Title>
    <Card class="w-[760px] gap-4 shadow-lg">
      <Box class="max-w-md self-end rounded bg-primary px-4 py-2 text-primary-foreground"><Text size="sm">{c.items[0]!.text}</Text></Box>
      <Box class="max-w-md rounded bg-muted px-4 py-2"><Text size="sm">{c.lead}</Text></Box>
      <Textarea placeholder={c.input} rows={3} />
      <Group justify="between"><Text size="xs" class="text-muted-foreground">{c.note}</Text><Button>{c.cta}</Button></Group>
    </Card>
  </Stack>
</Block>
