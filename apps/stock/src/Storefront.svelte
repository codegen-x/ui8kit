<!-- The storefront of Stock: the layouts of @ui8kit/layouts with the index, the engine, the route (#/search?…&page=), the language
     and the Theme. -->
<script lang="ts">
  import { AssetCard, FacetColumn, FilterBar, LivePreview, Results, StockFrame, StockHeader, Text, ThemeSheet } from "./lib/parts";
  import { paginate, parseSearch, prepare, relaxations, search, searchHash, setFacet, toggleValue, type SearchState } from "@ui8kit/facet-search";
  import { textIn } from "@ui8kit/facet-search/model";
  import type { CardView } from "@ui8kit/layouts/stock/text";
  import indexJson from "../content/assets.v0.json";
  import { LOCALE_OPTIONS, TEXTS, isLocale } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import type { Asset, Index } from "./lib/model";
  import { loadPreview } from "./lib/preview";
  import { themeCtl } from "./lib/theme-ctl.svelte";
  import { TYPE, cardView, chipViews, facetViews, quickViews, relaxViews, removeKey, resetFilters, selectedCount, typeViews } from "./lib/view";

  const PER_PAGE = 24;
  // what the storefront shows where the theme sets nothing: the kit's own skin (no data-skin), Inter, the kit radius (10 px)
  const FALLBACK = { skin: "", font: "inter", radius: 10 } as const;
  const index = indexJson as unknown as Index;
  const engine = prepare(index);
  const vocab = { facets: index.facets, sorts: index.sorts };
  const byId = new Map(index.assets.map((a) => [a.id, a]));

  let { query }: { query: string } = $props();
  const s = $derived<SearchState>(parseSearch(query, vocab));
  const locale = $derived(visit.locale);
  $effect(() => { visit.back = searchHash(s, vocab); });

  const t = $derived(TEXTS[locale]);
  const out = $derived(search(engine, s));
  const pg = $derived(paginate(out.results, s.page, PER_PAGE));
  const cards = $derived(pg.items.map((a) => cardView(index, a, s.variants === "all" ? 1 : (out.variantsOf.get(a.group) ?? 1), locale)));
  const relax = $derived(out.results.length === 0 ? relaxViews(index, relaxations(engine, s), locale, t) : []);
  const sorts = $derived(index.sorts.map((x) => ({ id: x.id, label: textIn(x.label, locale) })));

  function go(next: SearchState): void {
    const flip = next.page !== s.page;
    const h = searchHash(next, vocab);
    if (location.hash !== h) location.hash = h;
    if (flip) window.scrollTo({ top: 0 });
  }
  const href = (page: number): string => searchHash({ ...s, page }, vocab);
  const toggle = (facet: string, value: string): void => go(toggleValue(s, facet, value));
  const ontype = (id: string): void => go(setFacet(s, TYPE, id ? [id] : []));
  const onvariants = (spec: string): void => go({ ...s, spec, variants: "all", page: 1 });
  const refOf = (c: CardView): Asset | undefined => byId.get(c.key);
</script>

<StockFrame>
  {#snippet header()}
    <StockHeader {t} q={s.q} {locale} locales={LOCALE_OPTIONS} compare={0}
      onsearch={(q) => go({ ...s, q, page: 1 })} onlocale={(id) => { if (isLocale(id)) visit.locale = id; }} ontheme={() => (themeCtl.open = true)} />
  {/snippet}
  {#snippet bar()}
    <FilterBar {t} types={typeViews(index, out, locale, t)} type={s.filters[TYPE]?.[0] ?? ""} quick={quickViews(index, s, out, locale)} {ontype} onquick={toggle} />
  {/snippet}
  {#snippet aside()}
    <FacetColumn {t} groups={facetViews(index, s, out, locale)} selected={selectedCount(s)} ontoggle={toggle} />
  {/snippet}
  {#snippet main()}
    <Results {t} total={out.results.length} chips={chipViews(index, s, locale, t)} {sorts} sort={out.sort} {cards} {relax} page={pg.page} pages={pg.pages} {href}
      onremove={(key) => go(removeKey(s, key))} onreset={() => go(resetFilters(s))} onsort={(id) => go({ ...s, sort: id, page: 1 })}>
      {#snippet card(c: CardView)}
        <AssetCard {t} card={c} {onvariants}>
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
    </Results>
  {/snippet}
  {#snippet overlay()}
    <ThemeSheet ctl={themeCtl} text={t.sheet} id="stock-theme" titleId="stock-theme-title" fallback={FALLBACK} dismissible />
  {/snippet}
</StockFrame>
