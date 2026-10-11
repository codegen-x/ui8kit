<!-- Prompt on an inverse field: a conic spotlight from the top, the headline and the kit PromptComposer centred. -->
<script lang="ts">
  import { Block, PromptComposer, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col bg-foreground text-background">
  <Conic v={2} class="absolute inset-0 opacity-70" />
  <TopBar {c} layout="split" tone="inverse" action="secondary" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="semibold" class="max-w-4xl text-7xl leading-none tracking-tight text-background">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-background/70">{c.lead}</Text>
    <PromptComposer label={c.input} attachLabel={c.tags[0]} modelLabel={c.tags[1]} send={c.cta} />
  </Stack>
</Block>
