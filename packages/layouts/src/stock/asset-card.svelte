<!-- The shell of an asset card: the preview frame (the live render comes in as a snippet), the title (a link to the detail page),
     what it is, and the way to every variant of its spec. The card's edge is a real border (border-border), not the kit Card's inset ring: an inset ring is a
     box-shadow painted under the children, so the flush, opaque preview frame would cover it everywhere but the text part. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Button, Card, Group, Link, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import PreviewFrame from "../preview/preview-frame.svelte";
  import { fmt, type CardView, type StockText } from "./text";

  let { t, card, preview, onvariants }: { t: StockText; card: CardView; preview: Snippet; onvariants: (spec: string) => void } = $props();
</script>

<Card class="group h-full gap-0 overflow-hidden border border-border p-0 inset-ring-0 transition-colors hover:border-primary focus-within:border-primary" data-testid="asset-card" data-asset={card.key}>
  {#if card.preview}
    <PreviewFrame id={"pv-" + card.key.replace(/[^a-z0-9]+/gi, "-")}>{@render preview()}</PreviewFrame>
  {:else}
    <Text tag="p" class="flex aspect-16/10 items-center justify-center bg-muted text-sm text-muted-foreground">{t.card.none}</Text>
  {/if}
  <Stack gap="2" align="stretch" class="p-4">
    <Group gap="2" align="center" justify="between">
      <Title as={3} size="sm" class="min-w-0 truncate"><Link href={card.href} size="sm" class="block truncate" data-testid="card-open">{card.title}</Link></Title>
      <Badge size="sm" variant="secondary">{card.kind}</Badge>
    </Group>
    <Text tag="p" size="sm" class="truncate text-muted-foreground">{card.subtitle}</Text>
    <Group gap="2" align="center" justify="between" class="min-h-8">
      {#if card.meta?.length}
        <Text tag="p" size="sm" class="min-w-0 truncate text-xs text-muted-foreground opacity-80 group-hover:opacity-100" data-testid="card-meta">{card.meta.join(" · ")}</Text>
      {:else}<Text tag="span" class="sr-only"></Text>{/if}
      {#if card.variants > 1}
        <Button variant="link" size="sm" class="shrink-0 px-0" onclick={() => onvariants(card.spec)} data-testid="card-variants">{fmt(t.card.variants, { n: card.variants })}</Button>
      {/if}
    </Group>
  </Stack>
</Card>
