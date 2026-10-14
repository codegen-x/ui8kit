<!-- One group of the Filters sheet: a fieldset of checkboxes (several values) or radios (one value), preselected from the draft. -->
<script lang="ts">
  import { Box, Checkbox, Label, Radio, Text } from "@ui8kit/svelte-ui";
  import ui from "../../content/ui.json";

  let { name, legend, options, selected, multiple, onchange }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; selected: string[]; multiple: boolean;
    onchange: (values: string[]) => void;
  } = $props();

  function toggle(v: string, on: boolean): void {
    if (!multiple) { onchange([v]); return; }
    onchange(on ? [...selected, v] : selected.filter((x) => x !== v));
  }
</script>

<Box tag="fieldset" class="mg-fieldset" data-testid="filter-group" data-name={name}>
  <Text tag="legend" weight="semibold" class="mg-legend">{legend}<Text tag="span" class="mg-count">{ui.feed.sheet.selected.replace("{n}", String(selected.length))}</Text></Text>
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
