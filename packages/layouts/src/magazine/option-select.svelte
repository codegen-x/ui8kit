<!-- A group as a single native select (the kit Select), for long lists such as font pairs; the heading is its label. -->
<script lang="ts">
  import { Box, Label, Select, Text } from "@codegen-x/svelte-compose";

  let { name, legend, options, value, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; value: string; onchange: (value: string) => void;
    /** the theme field it edits, as data-field */ field?: string;
  } = $props();
  const id = $derived("filter-" + name);
</script>

<Box class="ui8-option-group" data-filter-group data-testid="filter-group" data-name={name} data-field={field}>
  <Label for={id} class="ui8-option-legend"><Text tag="span" weight="semibold">{legend}</Text></Label>
  <Select {id} {name} size="sm" class="ui8-option-select" {options} {value} onchange={(e: Event) => onchange((e.currentTarget as HTMLSelectElement).value)} data-testid={"filter-select-" + name} />
</Box>
