<!-- A group as a single native select (the kit Select), for long lists such as font pairs; the heading is its label. -->
<script lang="ts">
  import { Box, Label, Select, Text } from "@codegen-x/svelte-compose";

  let { name, legend, options, value, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; value: string; onchange: (value: string) => void;
    /** the theme field it edits, as data-field */ field?: string;
  } = $props();
  const id = $derived("filter-" + name);
</script>

<Box class="w-full min-w-0 py-4 [[data-filter-group]+&]:border-t [[data-filter-group]+&]:border-border" data-filter-group data-testid="filter-group" data-name={name} data-field={field}>
  <Label for={id} class="mb-2 flex w-full items-baseline justify-between gap-2 text-sm text-foreground"><Text tag="span" weight="semibold">{legend}</Text></Label>
  <Select {id} {name} size="sm" class="w-full" {options} {value} onchange={(e: Event) => onchange((e.currentTarget as HTMLSelectElement).value)} data-testid={"filter-select-" + name} />
</Box>
