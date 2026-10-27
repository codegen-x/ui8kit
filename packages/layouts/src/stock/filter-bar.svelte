<!-- The filter bar under the header: the type tabs and the quick filters, one landmark (region). -->
<script lang="ts">
  import { Block, Group } from "@codegen-x/svelte-compose";
  import QuickFilters from "./quick-filters.svelte";
  import TypeBar from "./type-bar.svelte";
  import type { QuickView, StockText, TypeView } from "./text";

  let { t, types, type, quick, ontype, onquick }: {
    t: StockText; types: TypeView[]; type: string; quick: QuickView[];
    ontype: (id: string) => void; onquick: (facet: string, value: string) => void;
  } = $props();
</script>

<Block tag="section" aria-label={t.filters.region} class="mx-auto w-full max-w-screen-2xl px-4 py-4" data-testid="filter-bar">
  <Group gap="4" align="center" class="flex-wrap">
    <TypeBar {t} {types} {type} {ontype} />
    <QuickFilters {t} {quick} ontoggle={onquick} />
  </Group>
</Block>
