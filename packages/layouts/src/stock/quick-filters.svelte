<!-- Quick filters: single facet values promoted above the results, as toggle chips (checkboxes). -->
<script lang="ts">
  import { Checkbox, Fieldset, Label, Legend, Text } from "@codegen-x/svelte-compose";
  import type { QuickView, StockText } from "./text";

  let { t, quick, ontoggle }: { t: StockText; quick: QuickView[]; ontoggle: (facet: string, value: string) => void } = $props();
</script>

{#if quick.length > 0}
  <Fieldset variant="inline" class="gap-2" data-testid="quick-filters">
    <Legend class="sr-only">{t.filters.quick}</Legend>
    {#each quick as qf (qf.facet + ":" + qf.value)}
      <Label class="inline-flex h-8 cursor-pointer items-center gap-2 rounded px-4 text-sm inset-ring inset-ring-border has-checked:bg-secondary has-checked:inset-ring-primary has-focus-visible:ring-2 has-focus-visible:ring-ring">
        <Checkbox class="sr-only" checked={qf.checked} onchange={() => ontoggle(qf.facet, qf.value)} data-testid={"quick-" + qf.facet + "-" + qf.value} />
        <Text tag="span">{qf.label}</Text>
        <Text tag="span" class="tabular-nums text-muted-foreground">{qf.count}</Text>
      </Label>
    {/each}
  </Fieldset>
{/if}
