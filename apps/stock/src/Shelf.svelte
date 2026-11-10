<!-- The Collections page and the Compare page of Stock (#/collections, #/compare): the layouts of @ui8kit/layouts/stock with the
     shelf of this device (lib/collection.svelte.ts), the index, the install objects, the language and the Theme. Open in BuildY
     hands the active collection to the BuildY chat as a buildy-collection:v1 link, or downloads the file when the link is too long. -->
<script lang="ts">
  import { CollectionPage, ComparePage, DetailFrame, LivePreview, PreviewFrame, StockHeader, Text, ThemeSheet } from "./lib/parts";
  import { emptySearch, searchHash } from "@ui8kit/facet-search";
  import { fmt, type CompareView, type KeptView } from "@ui8kit/layouts/stock/text";
  import indexJson from "../content/assets.v0.json";
  import installJson from "../content/install.v0.json";
  import { LOCALE_OPTIONS, TEXTS, isLocale } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import { activeOf, addCollection, buildyLink, clearCompare, deleteCollection, fileName, MAX_COMPARE, moveItem, newCollection, removeItem, rename, setActive, setNote, toDoc, toggleCompare } from "./lib/collection";
  import { keep, shelf, titleFor } from "./lib/collection.svelte";
  import type { InstallIndex } from "./lib/install";
  import type { Index } from "./lib/model";
  import { loadPreview } from "./lib/preview";
  import { compareRows, compareViews, keptViews } from "./lib/shelf-view";
  import { stock, themeCtl } from "./lib/theme-ctl.svelte";

  let { page }: { page: "collections" | "compare" } = $props();
  const FALLBACK = { skin: "", font: "inter", radius: 10 } as const;
  const index = indexJson as unknown as Index;
  const inst = installJson as unknown as InstallIndex;
  const vocab = { facets: index.facets, sorts: index.sorts };
  const byId = new Map(index.assets.map((a) => [a.id, a]));

  const t = $derived(TEXTS[visit.locale]);
  const active = $derived(activeOf(shelf.value));
  const items = $derived(keptViews(index, active.items, visit.locale));
  const doc = $derived(toDoc(active, { assetsDigest: index.digest }, stock.state.theme.skin, location.origin + "/"));
  const link = $derived(buildyLink(doc));
  const compared = $derived(compareViews(index, shelf.value.compare, visit.locale));
  const rows = $derived(compareRows(index, inst, shelf.value.compare, visit.locale, t));
  let status = $state("");

  const search = (q: string): void => { location.hash = searchHash({ ...emptySearch(), q }, vocab); };
  const now = (): Date => new Date();
  function download(): void {
    const blob = new Blob([JSON.stringify(doc, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName(active.title);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function onopen(): void {
    if (link.fits) { status = t.collection.opened; return; }
    download();
    status = t.collection.tooLong;
  }
  const slug = (key: string): string => key.replace(/[^a-z0-9]+/gi, "-");
</script>

{#snippet live(key: string, prefix: string)}
  {@const a = byId.get(key)}
  <PreviewFrame id={prefix + slug(key)}>
    {#if a?.preview}
      {#await loadPreview(a.preview, prefix + slug(key))}
        <Text tag="span" class="sr-only" data-preview-pending>{t.card.loading}</Text>
      {:then shown}
        <LivePreview parts={shown.parts} ctx={shown.ctx} />
      {:catch}
        <Text tag="p" class="p-8 text-muted-foreground">{t.card.failed}</Text>
      {/await}
    {:else}
      <Text tag="p" class="p-8 text-muted-foreground">{t.card.none}</Text>
    {/if}
  </PreviewFrame>
{/snippet}

<DetailFrame>
  {#snippet header()}
    <StockHeader {t} q="" locale={visit.locale} locales={LOCALE_OPTIONS} kept={active.items.length} compare={shelf.value.compare.length} current={page}
      onsearch={search} onlocale={(l) => { if (isLocale(l)) visit.locale = l; }} ontheme={() => (themeCtl.open = true)} />
  {/snippet}
  {#snippet main()}
    {#if page === "collections"}
      <CollectionPage {t} back={visit.back} collections={shelf.value.collections.map((c) => ({ id: c.id, label: c.title }))} active={active.id} name={active.title}
        {items} openHref={link.fits ? link.href : ""} {status}
        onpick={(id) => { status = ""; keep(setActive(shelf.value, id)); }}
        onrename={(title) => keep(rename(shelf.value, active.id, title, now()))}
        oncreate={() => { status = ""; keep(addCollection(shelf.value, titleFor(shelf.value.collections.length + 1), now())); }}
        ondelete={() => { if (!window.confirm(fmt(t.collection.confirmRemove, { name: active.title }))) return; status = ""; keep(deleteCollection(shelf.value, active.id, () => newCollection(titleFor(1), now()))); }}
        {onopen} onexport={download}
        onmove={(key, by) => keep(moveItem(shelf.value, active.id, key, by, now()))}
        ondrop={(key) => keep(removeItem(shelf.value, active.id, key, now()))}
        onnote={(key, note) => keep(setNote(shelf.value, active.id, key, note, now()))}>
        {#snippet thumb(it: KeptView)}{@render live(it.key, "cl-")}{/snippet}
      </CollectionPage>
    {:else}
      <ComparePage {t} back={visit.back} items={compared} {rows} max={MAX_COMPARE}
        ondrop={(key) => keep(toggleCompare(shelf.value, key))} onclear={() => keep(clearCompare(shelf.value))}>
        {#snippet thumb(it: CompareView)}{@render live(it.key, "cp-")}{/snippet}
      </ComparePage>
    {/if}
  {/snippet}
  {#snippet overlay()}
    <ThemeSheet ctl={themeCtl} text={t.sheet} id="stock-theme" titleId="stock-theme-title" fallback={FALLBACK} dismissible />
  {/snippet}
</DetailFrame>
