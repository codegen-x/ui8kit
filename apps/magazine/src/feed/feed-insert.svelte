<!-- A marketplace insert between feed sections: a banner for another category (templates, design system, series, video). -->
<script lang="ts">
  import { Block, Button, Text, Title } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import type { Insert } from "../lib/feed";

  let { insert }: { insert: Insert } = $props();
  const c = $derived(ui.feed.inserts[insert.kind]);
</script>

<Block tag="aside" class="mg-insert" aria-label={c.eyebrow} data-testid="feed-insert" data-kind={insert.kind}>
  <Text class="mg-eyebrow">{c.eyebrow}</Text>
  <Title as={2} class="mg-h2">{c.title}</Title>
  <Text class="mg-note">{c.body}</Text>
  <Button variant="secondary" href={insert.href}>{c.cta}</Button>
</Block>
