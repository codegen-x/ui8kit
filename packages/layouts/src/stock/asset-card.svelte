<!-- The shell of an asset card: the preview frame (the live render comes in as a snippet), the title, what it is, a draft badge when
     its labels come from hand-made tables, and the way to every variant of its spec. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Button, Card, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import PreviewFrame from "../preview/preview-frame.svelte";
  import { fmt, type CardView, type StockText } from "./text";

  let { t, card, preview, onvariants }: { t: StockText; card: CardView; preview: Snippet; onvariants: (spec: string) => void } = $props();
</script>

<Card class="h-full gap-0 overflow-hidden p-0" data-testid="asset-card" data-asset={card.key}>
  {#if card.preview}
    <PreviewFrame id={"pv-" + card.key.replace(/[^a-z0-9]+/gi, "-")}>{@render preview()}</PreviewFrame>
  {:else}
    <Text tag="p" class="flex aspect-16/10 items-center justify-center bg-muted text-sm text-muted-foreground">{t.card.none}</Text>
  {/if}
  <Stack gap="2" align="stretch" class="p-4">
    <Group gap="2" align="center" justify="between">
      <Title as={3} size="sm" class="min-w-0 truncate">{card.title}</Title>
      <Badge size="sm" variant="secondary">{card.kind}</Badge>
    </Group>
    <Text tag="p" size="sm" class="truncate text-muted-foreground">{card.subtitle}</Text>
    <Group gap="2" align="center" justify="between">
      {#if card.draft}<Badge size="sm" variant="outline" data-testid="card-draft">{t.card.draft}</Badge>{/if}
      {#if card.variants > 1}
        <Button variant="link" size="sm" class="ml-auto px-0" onclick={() => onvariants(card.spec)} data-testid="card-variants">{fmt(t.card.variants, { n: card.variants })}</Button>
      {/if}
    </Group>
  </Stack>
</Card>
