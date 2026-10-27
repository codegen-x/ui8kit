<!-- One group of toggle buttons: checkboxes (several values) or radios (one value), named by its heading; the native control stays
     (semantics, keyboard), laid over its label and transparent, so the label is the button. The count line comes in as text. Two
     groups in a row (data-filter-group) are divided by a rule. -->
<script lang="ts">
  import { Box, Checkbox, Label, Radio, Text } from "@codegen-x/svelte-compose";

  let { name, legend, count = "", options, selected, multiple, onchange, field }: {
    name: string; legend: string; /** "n selected", shown for several values */ count?: string;
    options: Array<{ value: string; label: string }>; selected: string[]; multiple: boolean;
    onchange: (values: string[]) => void; /** the theme field it edits, as data-field */ field?: string;
  } = $props();
  const labelId = $derived("filter-" + name + "-label");

  function toggle(v: string, on: boolean): void {
    if (!multiple) { onchange([v]); return; }
    onchange(on ? [...selected, v] : selected.filter((x) => x !== v));
  }
</script>

<Box class="ui8-option-group" role={multiple ? "group" : "radiogroup"} aria-labelledby={labelId} data-filter-group data-testid="filter-group" data-name={name} data-field={field}>
  <Text tag="span" weight="semibold" class="ui8-option-legend" id={labelId}>{legend}{#if multiple}<Text tag="span" class="ui8-option-count">{count}</Text>{/if}</Text>
  <Box class="ui8-option-list">
    {#each options as o (o.value)}
      <Label class="ui8-option">
        {#if multiple}
          <Checkbox class="ui8-option-input" name={name + "[]"} value={o.value} checked={selected.includes(o.value)} onchange={(e: Event) => toggle(o.value, (e.currentTarget as HTMLInputElement).checked)} />
        {:else}
          <Radio class="ui8-option-input" {name} value={o.value} checked={selected.includes(o.value)} onchange={() => toggle(o.value, true)} />
        {/if}
        <Text tag="span">{o.label}</Text>
      </Label>
    {/each}
  </Box>
</Box>
