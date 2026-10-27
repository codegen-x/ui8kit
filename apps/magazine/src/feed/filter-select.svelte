<!-- One group of the Filters sheet as a single native select, for long lists such as the font pairs
     (@ui8kit/layouts/magazine/option-select). -->
<script lang="ts">
  import OptionSelect from "@ui8kit/layouts/magazine/option-select.svelte";

  let { name, legend, options, value, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; value: string; onchange: (value: string) => void;
    /** the theme field it edits (@ui8kit/theme-model/global-theme FIELDS), as data-field */
    field?: string;
  } = $props();
</script>

<OptionSelect {name} {legend} {options} {value} {onchange} {field} />
