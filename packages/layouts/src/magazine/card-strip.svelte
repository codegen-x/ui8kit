<!-- A strip of cards: a heading, an optional note and a horizontal row of cards that scrolls when it does not fit. The cards come in
     as children; `label` names the region when the heading repeats on the page. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Box, Text, Title } from "@codegen-x/svelte-compose";

  let { title, note = "", label, children, ...rest }: { title: string; note?: string; label?: string; children: Snippet; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Block tag="section" class="ui8-card-strip" aria-label={label} {...rest}>
  <Title as={2} size="base" class="ui8-card-strip-title">{title}</Title>
  {#if note}<Text class="ui8-card-strip-note">{note}</Text>{/if}
  <Box class="ui8-card-strip-row">{@render children()}</Box>
</Block>
