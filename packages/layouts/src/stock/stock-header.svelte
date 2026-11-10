<!-- The header of Stock: the brand, the search field, then Collections and Compare (links to their pages, each with its count),
     the language and the Theme sheet. -->
<script lang="ts">
  import { Badge, Block, Button, Group, Label, LucideIcon, Select, SelectOption, Text, Title } from "@codegen-x/svelte-compose";
  import SearchField from "./search-field.svelte";
  import { fmt, type Option, type StockText, type SuggestView, type TypeView } from "./text";

  let { t, q, locale, locales, kept = 0, compare, collectionsHref = "#/collections", compareHref = "#/compare", current = "", onsearch, onlocale, ontheme, suggest, onpick, types, type, ontype }: {
    t: StockText; q: string; locale: string; locales: Option[];
    /** the items of the active collection and the items picked for Compare */
    kept?: number; compare: number;
    collectionsHref?: string; compareHref?: string;
    /** the page the header sits on ("collections", "compare"): its link is shown selected */
    current?: string;
    onsearch: (q: string) => void; onlocale: (id: string) => void; ontheme: () => void;
    suggest?: (draft: string) => SuggestView[]; onpick?: (s: SuggestView) => void;
    /** the asset-type select of the search field, with counts (the storefront only) */
    types?: TypeView[]; type?: string; ontype?: (id: string) => void;
  } = $props();
</script>

<Block tag="header" class="sticky top-0 z-20 bg-background inset-ring inset-ring-border" data-testid="stock-header">
  <Group gap="4" align="center" class="mx-auto w-full max-w-screen-2xl flex-wrap px-4 py-2 md:flex-nowrap">
    <Title as={1} size="lg" weight="bold" class="shrink-0" data-testid="brand">{t.brand}</Title>
    <SearchField {t} {q} {onsearch} {suggest} {onpick} {types} {type} {ontype} />
    <Group gap="2" align="center" class="ml-auto shrink-0" role="group" aria-label={t.header.actions}>
      <Button href={collectionsHref} variant={current === "collections" ? "secondary" : "ghost"} size="sm" class="gap-2" aria-label={t.header.collections + " " + fmt(t.header.count, { n: kept })} data-testid="collections">
        <LucideIcon name="heart" size={16} /><Text tag="span" class="hidden md:inline">{t.header.collections}</Text><Badge size="sm" variant={kept ? "default" : "secondary"} aria-hidden="true">{fmt(t.header.count, { n: kept })}</Badge>
      </Button>
      <Button href={compareHref} variant={current === "compare" ? "secondary" : "ghost"} size="sm" class="gap-2" aria-label={t.header.compare + " " + fmt(t.header.count, { n: compare })} data-testid="compare">
        <LucideIcon name="git-compare" size={16} /><Text tag="span" class="hidden md:inline">{t.header.compare}</Text><Badge size="sm" variant={compare ? "default" : "secondary"} aria-hidden="true">{fmt(t.header.count, { n: compare })}</Badge>
      </Button>
      <Label class="sr-only" for="stock-locale">{t.header.locale}</Label>
      <Select id="stock-locale" size="sm" class="w-32" value={locale} onchange={(e: Event) => onlocale((e.currentTarget as HTMLSelectElement).value)} data-testid="locale">
        {#each locales as l (l.id)}<SelectOption value={l.id}>{l.label}</SelectOption>{/each}
      </Select>
      <Button variant="outline" size="sm" class="gap-2" onclick={ontheme} data-testid="theme-open"><LucideIcon name="palette" size={16} /><Text tag="span" class="hidden md:inline">{t.header.theme}</Text></Button>
    </Group>
  </Group>
</Block>
