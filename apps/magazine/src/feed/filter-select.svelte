<!-- One group of the Filters sheet as a single native select (the kit Select): for long lists such as the font pairs. -->
<script lang="ts">
  import { Box, Label, Select, Text } from "@codegen-x/svelte-compose";

  let { name, legend, options, value, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; value: string; onchange: (value: string) => void;
    /** the theme field it edits (@ui8kit/theme-model/global-theme FIELDS), as data-field */
    field?: string;
  } = $props();
</script>

<Box class="mg-fieldset" data-testid="filter-group" data-name={name} data-field={field}>
  <Label for={"mg-filter-" + name} class="mg-flegend"><Text tag="span" weight="semibold">{legend}</Text></Label>
  <Select id={"mg-filter-" + name} name={name} size="sm" class="mg-select" {options} {value} onchange={(e: Event) => onchange((e.currentTarget as HTMLSelectElement).value)} data-testid={"filter-select-" + name} />
</Box>
