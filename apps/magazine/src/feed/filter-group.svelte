<!-- One group of the Filters sheet (and of the Theme panels): toggle buttons, checkboxes (several values) or radios (one value),
     preselected from the draft; the group is @ui8kit/layouts/magazine/option-group. -->
<script lang="ts">
  import OptionGroup from "@ui8kit/layouts/magazine/option-group.svelte";
  import ui from "../../content/ui.json";

  let { name, legend, options, selected, multiple, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; selected: string[]; multiple: boolean;
    onchange: (values: string[]) => void;
    /** the theme field it edits (@ui8kit/theme-model/global-theme FIELDS), as data-field */
    field?: string;
  } = $props();
</script>

<OptionGroup {name} {legend} count={ui.feed.sheet.selected.replace("{n}", String(selected.length))} {options} {selected} {multiple} {onchange} {field} />
