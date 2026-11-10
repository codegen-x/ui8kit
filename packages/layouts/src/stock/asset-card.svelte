<!-- The shell of an asset card: the preview frame (the live render comes in as a snippet), the title (a link to the detail page),
     what it is, the way to every variant of its spec, and (when the app passes them) the two toggles of the card: keep it in the
     active collection and pick it for Compare (aria-pressed buttons; Compare refuses a fifth item and says why in its name). The card's edge is a real border (border-border), not the kit Card's inset ring: an inset ring is a
     box-shadow painted under the children, so the flush, opaque preview frame would cover it everywhere but the text part. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Button, Card, Group, Link, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import PreviewFrame from "../preview/preview-frame.svelte";
  import { fmt, type CardView, type StockText } from "./text";

  let { t, card, preview, onvariants, collection = "", saved = false, compared = false, compareMax = 4, compareFull = false, onsave, oncompare }: {
    t: StockText; card: CardView; preview: Snippet; onvariants: (spec: string) => void;
    /** the title of the active collection, `saved` the card is in it, `onsave` toggles it (absent: no toggle) */
    collection?: string; saved?: boolean; onsave?: () => void;
    /** `compared` the card is picked for Compare, `compareFull` Compare holds `compareMax` items already, `oncompare` toggles it */
    compared?: boolean; compareMax?: number; compareFull?: boolean; oncompare?: () => void;
  } = $props();
  const saveLabel = $derived(fmt(saved ? t.card.unsave : t.card.save, { name: collection }));
  const compareLabel = $derived(compared ? t.card.uncompare : compareFull ? fmt(t.card.full, { n: compareMax }) : t.card.compare);
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
      <Group gap="2" align="center" class="shrink-0">
        {#if card.variants > 1}
          <Button variant="link" size="sm" class="shrink-0 px-0" onclick={() => onvariants(card.spec)} data-testid="card-variants">{fmt(t.card.variants, { n: card.variants })}</Button>
        {/if}
        {#if onsave || oncompare}
          <Group gap="2" align="center" data-testid="card-tools">
            {#if oncompare}
              <Button variant={compared ? "secondary" : "ghost"} size="sm" class="size-8 p-0" pressed={compared} disabled={compareFull && !compared} aria-label={compareLabel} title={compareLabel} onclick={oncompare} data-testid="card-compare">
                <LucideIcon name="git-compare" size={16} />
              </Button>
            {/if}
            {#if onsave}
              <Button variant={saved ? "secondary" : "ghost"} size="sm" class="size-8 p-0" pressed={saved} aria-label={saveLabel} title={saveLabel} onclick={onsave} data-testid="card-save">
                <LucideIcon name="heart" size={16} class={saved ? "fill-current text-primary" : ""} />
              </Button>
            {/if}
          </Group>
        {/if}
      </Group>
    </Group>
  </Stack>
</Card>
