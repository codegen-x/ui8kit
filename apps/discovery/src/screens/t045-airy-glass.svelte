<!-- Airy glass: a soft glow over the whole screen, a single small frosted card in the middle with headline and button. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={2} class="absolute inset-0 opacity-80" />
  <TopBar {c} layout="bare" action="ghost" mark="circle" />
  <Stack align="center" justify="center" class="relative flex-1">
    <Box class="flex w-[560px] flex-col items-center gap-6 rounded bg-background/50 p-12 text-center inset-ring inset-ring-foreground/10 backdrop-blur-xl">
      <Text size="sm" class="text-muted-foreground">{c.eyebrow}</Text>
      <Title as={1} weight="semibold" class="text-4xl leading-tight tracking-tight">{c.title}</Title>
      <Text class="text-muted-foreground">{c.accent}</Text>
      <Button>{c.cta}</Button>
    </Box>
  </Stack>
</Block>
