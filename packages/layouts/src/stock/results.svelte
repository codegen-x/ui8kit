<!-- The primary content: the count and the applied filters, the sort, the cards of the current page, the pages. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block, Group, Stack, Title } from "@codegen-x/svelte-compose";
  import AppliedChips from "./applied-chips.svelte";
  import CardGrid from "./card-grid.svelte";
  import EmptyState from "./empty-state.svelte";
  import Pagination from "./pagination.svelte";
  import SortSelect from "./sort-select.svelte";
  import type { CardView, ChipView, Option, RelaxView, StockText } from "./text";

  let { t, total, chips, sorts, sort, cards, relax, page, pages, href, card, onremove, onreset, onsort }: {
    t: StockText; total: number; chips: ChipView[]; sorts: Option[]; sort: string; cards: CardView[]; relax: RelaxView[];
    page: number; pages: number; href: (page: number) => string; card: Snippet<[CardView]>;
    onremove: (key: string) => void; onreset: () => void; onsort: (id: string) => void;
  } = $props();
</script>

<Block tag="main" id="main-content" aria-labelledby="stock-results-title" class="min-w-0 lg:col-span-9" data-testid="results">
  <Stack gap="4" align="stretch">
    <Title as={2} class="sr-only" id="stock-results-title">{t.results.title}</Title>
    <Group gap="4" align="start" justify="between" class="flex-wrap">
      <AppliedChips {t} {total} {chips} {onremove} {onreset} />
      <SortSelect {t} {sorts} {sort} {onsort} />
    </Group>
    {#if cards.length === 0}
      <EmptyState {t} {relax} {onremove} />
    {:else}
      <CardGrid {cards} {card} />
      <Pagination {t} {page} {pages} {href} />
    {/if}
  </Stack>
</Block>
