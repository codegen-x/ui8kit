<!-- One group of the Filters sheet: a group of toggle buttons: checkboxes (several values) or radios (one value), preselected from the draft. -->
<script lang="ts">
  import { Box, Checkbox, Label, Radio, Text } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";

  let { name, legend, options, selected, multiple, onchange, field }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; selected: string[]; multiple: boolean;
    onchange: (values: string[]) => void;
    /** the theme field it edits (lib/global-theme.ts FIELDS), as data-field */
    field?: string;
  } = $props();

  function toggle(v: string, on: boolean): void {
    if (!multiple) { onchange([v]); return; }
    onchange(on ? [...selected, v] : selected.filter((x) => x !== v));
  }
</script>

<!-- the kit Box has no fieldset: a group (checkboxes) or radiogroup (radios) named by its heading -->
<Box class="mg-fieldset" role={multiple ? "group" : "radiogroup"} aria-labelledby={"mg-filter-" + name + "-label"} data-testid="filter-group" data-name={name} data-field={field}>
  <Text tag="span" weight="semibold" class="mg-flegend" id={"mg-filter-" + name + "-label"}>{legend}{#if multiple}<Text tag="span" class="mg-gcount">{ui.feed.sheet.selected.replace("{n}", String(selected.length))}</Text>{/if}</Text>
  <Box class="mg-options">
    {#each options as o (o.value)}
      <Label class="mg-option">
        {#if multiple}
          <Checkbox name={name + "[]"} value={o.value} checked={selected.includes(o.value)} onchange={(e: Event) => toggle(o.value, (e.currentTarget as HTMLInputElement).checked)} />
        {:else}
          <Radio name={name} value={o.value} checked={selected.includes(o.value)} onchange={() => toggle(o.value, true)} />
        {/if}
        <Text tag="span">{o.label}</Text>
      </Label>
    {/each}
  </Box>
</Box>
