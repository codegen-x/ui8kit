<!-- The header of Stock: the brand, the search field, then Collections, Compare (not built yet: shown disabled), the language and
     the Theme sheet. -->
<script lang="ts">
  import { Block, Button, Group, Label, LucideIcon, Select, SelectOption, Text, Title } from "@codegen-x/svelte-compose";
  import SearchField from "./search-field.svelte";
  import { fmt, type Option, type StockText, type SuggestView } from "./text";

  let { t, q, locale, locales, compare, onsearch, onlocale, ontheme, suggest, onpick }: {
    t: StockText; q: string; locale: string; locales: Option[]; compare: number;
    onsearch: (q: string) => void; onlocale: (id: string) => void; ontheme: () => void;
    suggest?: (draft: string) => SuggestView[]; onpick?: (s: SuggestView) => void;
  } = $props();
</script>

<Block tag="header" class="sticky top-0 z-20 bg-background inset-ring inset-ring-border" data-testid="stock-header">
  <Group gap="4" align="center" class="mx-auto w-full max-w-screen-2xl flex-wrap px-4 py-2 md:flex-nowrap">
    <Title as={1} size="lg" weight="bold" class="shrink-0" data-testid="brand">{t.brand}</Title>
    <SearchField {t} {q} {onsearch} {suggest} {onpick} />
    <Group gap="2" align="center" class="ml-auto shrink-0" role="group" aria-label={t.header.actions}>
      <Button variant="ghost" size="sm" class="gap-2" disabled title={t.header.soon} data-testid="collections"><LucideIcon name="heart" size={16} /><Text tag="span" class="hidden md:inline">{t.header.collections}</Text></Button>
      <Button variant="ghost" size="sm" class="gap-2" disabled title={t.header.soon} aria-label={fmt(t.header.compare, { n: compare })} data-testid="compare"><LucideIcon name="git-compare" size={16} /><Text tag="span" class="hidden md:inline">{fmt(t.header.compare, { n: compare })}</Text></Button>
      <Label class="sr-only" for="stock-locale">{t.header.locale}</Label>
      <Select id="stock-locale" size="sm" class="w-32" value={locale} onchange={(e: Event) => onlocale((e.currentTarget as HTMLSelectElement).value)} data-testid="locale">
        {#each locales as l (l.id)}<SelectOption value={l.id}>{l.label}</SelectOption>{/each}
      </Select>
      <Button variant="outline" size="sm" class="gap-2" onclick={ontheme} data-testid="theme-open"><LucideIcon name="palette" size={16} /><Text tag="span" class="hidden md:inline">{t.header.theme}</Text></Button>
    </Group>
  </Group>
</Block>
