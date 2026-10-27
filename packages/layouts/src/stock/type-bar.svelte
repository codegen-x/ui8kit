<!-- The type bar: one radio group styled as tabs (arrow keys move between types natively); each accessible name carries its count. -->
<script lang="ts">
  import { Fieldset, Label, Legend, Radio, Text } from "@codegen-x/svelte-compose";
  import type { StockText, TypeView } from "./text";

  let { t, types, type, ontype }: { t: StockText; types: TypeView[]; type: string; ontype: (id: string) => void } = $props();
</script>

<Fieldset variant="inline" class="gap-2" data-testid="type-bar">
  <Legend class="sr-only">{t.filters.types}</Legend>
  {#each types as ty (ty.id)}
    <Label class="inline-flex h-8 cursor-pointer items-center gap-2 rounded px-4 text-sm inset-ring inset-ring-border has-checked:bg-primary has-checked:text-primary-foreground has-checked:inset-ring-primary has-focus-visible:ring-2 has-focus-visible:ring-ring" data-testid={"type-" + (ty.id || "all")}>
      <Radio class="sr-only" name="stock-type" value={ty.id} checked={ty.id === type} onchange={() => ontype(ty.id)} />
      <Text tag="span" weight="medium">{ty.label}</Text>
      <Text tag="span" class="tabular-nums opacity-80">{ty.count}</Text>
    </Label>
  {/each}
</Fieldset>
