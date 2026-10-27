<!-- Nothing matched: say so, offer the filters whose removal brings results back (with how many), what to try, a way to clear every
     filter, and the most carried values of the catalog as a way back in. -->
<script lang="ts">
  import { Button, Group, List, ListItem, Stack, Text } from "@codegen-x/svelte-compose";
  import RefineRow from "./refine-row.svelte";
  import { fmt, type RefineView, type RelaxView, type StockText } from "./text";

  let { t, relax, onremove, popular = [], ontoggle, onclear }: {
    t: StockText; relax: RelaxView[]; onremove: (key: string) => void;
    popular?: RefineView[]; ontoggle?: (facet: string, value: string) => void; onclear?: () => void;
  } = $props();
</script>

<Stack gap="4" align="start" class="py-16" data-testid="results-empty">
  <Text tag="p" weight="semibold">{t.results.empty}</Text>
  {#if relax.length > 0}
    <Group gap="2" align="center" class="flex-wrap">
      {#each relax as r (r.key)}
        <Button variant="outline" size="sm" onclick={() => onremove(r.key)}>{fmt(t.results.relax, { filter: r.label, n: r.count })}</Button>
      {/each}
    </Group>
  {/if}
  <List tag="ul" class="list-disc space-y-2 pl-6 text-sm text-muted-foreground" data-testid="results-tips">
    {#each t.results.tips as tip (tip)}<ListItem>{tip}</ListItem>{/each}
  </List>
  {#if onclear}<Button variant="secondary" size="sm" onclick={onclear} data-testid="results-clear">{t.results.clear}</Button>{/if}
  {#if ontoggle}<RefineRow label={t.results.browse} items={popular} {ontoggle} testid="popular" />{/if}
</Stack>
