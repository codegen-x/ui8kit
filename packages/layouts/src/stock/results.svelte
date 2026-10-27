<!-- The primary content: the count and the applied filters, the sort, the way to hide the facet column, the refinements of the
     current results, the cards of the current page, the pages. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Button, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import AppliedChips from "./applied-chips.svelte";
  import CardGrid from "./card-grid.svelte";
  import EmptyState from "./empty-state.svelte";
  import Pagination from "./pagination.svelte";
  import RefineRow from "./refine-row.svelte";
  import SortSelect from "./sort-select.svelte";
  import type { CardView, ChipView, Option, RefineView, RelaxView, StockText } from "./text";

  let { t, total, chips, sorts, sort, cards, relax, page, pages, href, card, onremove, onreset, onsort,
    refine = [], popular = [], ontoggle, onpopular, filters = true, onfilters }: {
    t: StockText; total: number; chips: ChipView[]; sorts: Option[]; sort: string; cards: CardView[]; relax: RelaxView[];
    page: number; pages: number; href: (page: number) => string; card: Snippet<[CardView]>;
    onremove: (key: string) => void; onreset: () => void; onsort: (id: string) => void;
    refine?: RefineView[]; popular?: RefineView[]; ontoggle?: (facet: string, value: string) => void;
    /** a popular value under an empty result: a fresh start on it */
    onpopular?: (facet: string, value: string) => void;
    /** the facet column is shown (lg and up); `onfilters` hides or shows it */
    filters?: boolean; onfilters?: () => void;
  } = $props();
</script>

<Block tag="main" id="main-content" aria-labelledby="stock-results-title" class={"min-w-0 " + (filters ? "lg:col-span-9" : "lg:col-span-12")} data-testid="results">
  <Stack gap="4" align="stretch">
    <Title as={2} class="sr-only" id="stock-results-title">{t.results.title}</Title>
    <Group gap="4" align="start" justify="between" class="flex-wrap">
      <Group gap="2" align="center" class="min-w-0 flex-wrap">
        {#if onfilters}
          <Button variant="outline" size="sm" class="hidden gap-2 lg:inline-flex" aria-controls="stock-facets" onclick={onfilters} data-testid="filters-toggle">
            <LucideIcon name={filters ? "panel-left-close" : "sliders-horizontal"} size={16} /><Text tag="span">{filters ? t.facets.hide : t.facets.show}</Text>
          </Button>
        {/if}
        <AppliedChips {t} {total} {chips} {onremove} {onreset} />
      </Group>
      <SortSelect {t} {sorts} {sort} {onsort} />
    </Group>
    {#if ontoggle && cards.length > 0}<RefineRow label={t.results.refine} items={refine} {ontoggle} />{/if}
    {#if cards.length === 0}
      <EmptyState {t} {relax} {onremove} {popular} ontoggle={onpopular} onclear={chips.length > 0 ? onreset : undefined} />
    {:else}
      <CardGrid {cards} {card} wide={!filters} />
      <Pagination {t} {page} {pages} {href} />
    {/if}
  </Stack>
</Block>
