<!-- A strip of cards: a heading, an optional note and a horizontal row of cards that scrolls when it does not fit. The cards come in
     as children; `label` names the region when the heading repeats on the page. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Box, Text, Title } from "@codegen-x/svelte-compose";

  let { title, note = "", label, children, ...rest }: { title: string; note?: string; label?: string; children: Snippet; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Block tag="section" class="mb-8" aria-label={label} {...rest}>
  <Title as={2} size="base" class="mb-2">{title}</Title>
  {#if note}<Text class="mb-4 text-sm text-muted-foreground">{note}</Text>{/if}
  <Box class="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">{@render children()}</Box>
</Block>
