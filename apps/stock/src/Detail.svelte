<!-- The detail page of a block variant or a screen page (#/asset/<id>, ?view=full&device=… with the full-screen preview open): the
     layouts of @ui8kit/layouts/stock/detail with the index, the preview recipes, the pattern definitions, the language and the
     Theme (the shared Theme sheet works here too; the mode switch of the preview is the Theme's mode). -->
<script lang="ts">
  import { AssetCard, Block, DetailFrame, DetailMain, LivePreview, Link, PreviewFrame, StockHeader, Text, ThemeSheet, Title } from "./lib/parts";
  import { emptySearch, searchHash } from "@ui8kit/facet-search";
  import { DEVICES } from "@ui8kit/layouts/preview/device";
  import { fmt, type CardView, type PassportLink, type RelatedView } from "@ui8kit/layouts/stock/text";
  import indexJson from "../content/assets.v0.json";
  import recipesJson from "../content/previews.v0.json";
  import termsJson from "../content/terms/pattern.v0.json";
  import { detailView, sameBlocks, samePattern, similar, type Definitions } from "./lib/detail";
  import { LOCALE_OPTIONS, TEXTS, isLocale } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import type { Asset, Index, Previews } from "./lib/model";
  import { loadPreview } from "./lib/preview";
  import { assetHash, frameHash, type Device, type Full } from "./lib/route";
  import { stock, themeCtl } from "./lib/theme-ctl.svelte";
  import { cardView } from "./lib/view";

  let { id, full }: { id: string; full?: Full } = $props();
  // what the page shows where the theme sets nothing (as the storefront)
  const FALLBACK = { skin: "", font: "inter", radius: 10 } as const;
  const index = indexJson as unknown as Index;
  const recipes = recipesJson as unknown as Previews;
  const defs: Definitions = Object.fromEntries(termsJson.terms.map((x) => [x.id, x.definition as Definitions[string]]));
  const vocab = { facets: index.facets, sorts: index.sorts };
  const byId = new Map(index.assets.map((a) => [a.id, a]));
  const groupSize = new Map<string, number>();
  for (const a of index.assets) groupSize.set(a.group, (groupSize.get(a.group) ?? 0) + 1);
  const asset = $derived(byId.get(id));

  const t = $derived(TEXTS[visit.locale]);
  const view = $derived(asset ? detailView(index, recipes, asset, visit.locale, defs) : null);
  const card = (a: Asset): CardView => cardView(index, a, groupSize.get(a.group) ?? 1, visit.locale);
  // the related rows: the same composition pattern, the same blocks, then similar by the shared labels (no asset twice)
  const related = $derived.by((): RelatedView[] => {
    if (!asset) return [];
    const seen = new Set<string>([asset.group]);
    const pat = samePattern(index, asset, 4, seen);
    const blocks = sameBlocks(index, recipes, asset, 4, seen);
    const sim = similar(index, asset, 8).filter((x) => !seen.has(x.group)).slice(0, 4);
    const r = t.detail.related;
    const screen = asset.type === "screen";
    return [
      { id: "pattern", title: r.pattern, cards: pat.map(card), none: (asset.labels["pattern"] ?? []).length ? r.none : r.patternNone },
      { id: "blocks", title: screen ? r.blocks : r.usedBy, cards: blocks.map(card), none: r.none },
      { id: "similar", title: r.similar, cards: sim.map(card), none: r.none },
    ];
  });
  const fullDevice = $derived(full ? DEVICES.find((d) => d.id === full.device) ?? DEVICES[0]! : null);

  const search = (patch: Partial<ReturnType<typeof emptySearch>>): void => { location.hash = searchHash({ ...emptySearch(), ...patch }, vocab); };
  /** the full-screen preview at a device, or closed (null); the URL holds it, so Back closes it too */
  function onfull(d: string | null): void {
    const next = d === null ? assetHash(id) : assetHash(id, { device: d as Device });
    if (location.hash !== next) location.hash = next;
  }
  const slug = (key: string): string => key.replace(/[^a-z0-9]+/gi, "-");
</script>

{#snippet live(a: Asset | undefined, prefix: string)}
  {#if a?.preview}
    {#await loadPreview(a.preview, prefix)}
      <Text tag="span" class="sr-only">{t.card.loading}</Text>
    {:then shown}
      <LivePreview parts={shown.parts} ctx={shown.ctx} />
    {:catch}
      <Text tag="p" class="p-8 text-muted-foreground">{t.card.failed}</Text>
    {/await}
  {/if}
{/snippet}

<DetailFrame>
  {#snippet header()}
    <StockHeader {t} q="" locale={visit.locale} locales={LOCALE_OPTIONS} compare={0}
      onsearch={(q) => search({ q })} onlocale={(l) => { if (isLocale(l)) visit.locale = l; }} ontheme={() => (themeCtl.open = true)} />
  {/snippet}
  {#snippet main()}
    {#if view}
      <DetailMain {t} {view} back={visit.back} devices={DEVICES} full={fullDevice} {onfull}
        mode={stock.state.mode} onmode={(m) => themeCtl.setField("mode", m)} src={frameHash(view.key)} {related}>
        {#snippet card(c: CardView)}
          <AssetCard {t} card={c} onvariants={(spec) => search({ spec, variants: "all" })}>
            {#snippet preview()}{@render live(byId.get(c.key), "pv-" + slug(c.key))}{/snippet}
          </AssetCard>
        {/snippet}
        {#snippet thumb(l: PassportLink)}
          <PreviewFrame id={"th-" + slug(l.key)}>{@render live(byId.get(l.asset), "th-" + slug(l.key))}</PreviewFrame>
        {/snippet}
      </DetailMain>
    {:else}
      <Block tag="main" id="main-content" aria-labelledby="detail-missing-title" class="mx-auto w-full max-w-screen-2xl px-4 pt-8 pb-16" data-testid="detail-missing">
        <Title as={1} size="2xl" weight="bold" id="detail-missing-title">{t.detail.missing.title}</Title>
        <Text tag="p" class="mt-4 text-muted-foreground">{fmt(t.detail.missing.text, { id })}</Text>
        <Link href={visit.back} size="sm" variant="muted" class="mt-4">{t.detail.back}</Link>
      </Block>
    {/if}
  {/snippet}
  {#snippet overlay()}
    <ThemeSheet ctl={themeCtl} text={t.sheet} id="stock-theme" titleId="stock-theme-title" fallback={FALLBACK} dismissible />
  {/snippet}
</DetailFrame>
