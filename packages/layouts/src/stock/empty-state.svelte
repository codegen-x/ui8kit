<!-- Nothing matched: say so, and offer the filters whose removal brings results back (with how many). -->
<script lang="ts">
  import { Button, Group, Stack, Text } from "@codegen-x/svelte-compose";
  import { fmt, type RelaxView, type StockText } from "./text";

  let { t, relax, onremove }: { t: StockText; relax: RelaxView[]; onremove: (key: string) => void } = $props();
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
</Stack>
