<!-- The detail page of a block variant or a screen page (#/asset/<id>): the layouts of @ui8kit/layouts/stock/detail with the
     index, the preview recipes, the language and the Theme (the shared Theme sheet works here too; the mode switch of the preview is
     the Theme's mode). -->
<script lang="ts">
  import { AssetCard, Block, DetailFrame, DetailMain, LivePreview, Link, StockHeader, Text, ThemeSheet, Title } from "./lib/parts";
  import { emptySearch, searchHash } from "@ui8kit/facet-search";
  import { DEVICES } from "@ui8kit/layouts/preview/device";
  import { fmt, type CardView } from "@ui8kit/layouts/stock/text";
  import indexJson from "../content/assets.v0.json";
  import recipesJson from "../content/previews.v0.json";
  import { detailView, similar } from "./lib/detail";
  import { LOCALE_OPTIONS, TEXTS, isLocale } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import type { Index, Previews } from "./lib/model";
  import { loadPreview } from "./lib/preview";
  import { frameHash } from "./lib/route";
  import { stock, themeCtl } from "./lib/theme-ctl.svelte";
  import { cardView } from "./lib/view";

  let { id }: { id: string } = $props();
  // what the page shows where the theme sets nothing (as the storefront)
  const FALLBACK = { skin: "", font: "inter", radius: 10 } as const;
  const index = indexJson as unknown as Index;
  const recipes = recipesJson as unknown as Previews;
  const vocab = { facets: index.facets, sorts: index.sorts };
  const byId = new Map(index.assets.map((a) => [a.id, a]));
  const asset = $derived(byId.get(id));

  const t = $derived(TEXTS[visit.locale]);
  const view = $derived(asset ? detailView(index, recipes, asset, visit.locale) : null);
  const cards = $derived(asset ? similar(index, asset).map((a) => cardView(index, a, 1, visit.locale)) : []);
  // the widest device that fits the window first (a phone sees the phone frame); the switch changes it
  let deviceId = $state<string>(DEVICES.find((d) => d.width <= window.innerWidth)?.id ?? "phone");
  const device = $derived(DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0]!);

  const search = (patch: Partial<ReturnType<typeof emptySearch>>): void => { location.hash = searchHash({ ...emptySearch(), ...patch }, vocab); };
  const refOf = (c: CardView) => byId.get(c.key);
</script>

<DetailFrame>
  {#snippet header()}
    <StockHeader {t} q="" locale={visit.locale} locales={LOCALE_OPTIONS} compare={0}
      onsearch={(q) => search({ q })} onlocale={(l) => { if (isLocale(l)) visit.locale = l; }} ontheme={() => (themeCtl.open = true)} />
  {/snippet}
  {#snippet main()}
    {#if view}
      <DetailMain {t} {view} back={visit.back} devices={DEVICES} {device} ondevice={(d) => (deviceId = d)}
        mode={stock.state.mode} onmode={(m) => themeCtl.setField("mode", m)} src={frameHash(view.key)} similar={cards}>
        {#snippet card(c: CardView)}
          <AssetCard {t} card={c} onvariants={(spec) => search({ spec, variants: "all" })}>
            {#snippet preview()}
              {@const a = refOf(c)}
              {#if a?.preview}
                {#await loadPreview(a.preview, "pv-" + c.key.replace(/[^a-z0-9]+/gi, "-"))}
                  <Text tag="span" class="sr-only">{t.card.loading}</Text>
                {:then shown}
                  <LivePreview parts={shown.parts} ctx={shown.ctx} />
                {:catch}
                  <Text tag="p" class="p-8 text-muted-foreground">{t.card.failed}</Text>
                {/await}
              {/if}
            {/snippet}
          </AssetCard>
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
