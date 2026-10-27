<!-- The sort order: a labelled select. -->
<script lang="ts">
  import { Group, Label, Select, SelectOption } from "@codegen-x/svelte-compose";
  import type { Option, StockText } from "./text";

  let { t, sorts, sort, onsort }: { t: StockText; sorts: Option[]; sort: string; onsort: (id: string) => void } = $props();
</script>

<Group gap="2" align="center" class="shrink-0">
  <Label for="stock-sort" class="text-sm text-muted-foreground">{t.results.sort}</Label>
  <Select id="stock-sort" size="sm" class="w-48" value={sort} onchange={(e: Event) => onsort((e.currentTarget as HTMLSelectElement).value)} data-testid="sort">
    {#each sorts as s (s.id)}<SelectOption value={s.id}>{s.label}</SelectOption>{/each}
  </Select>
</Group>
