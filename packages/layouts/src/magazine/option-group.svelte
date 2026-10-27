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

<Box class="w-full min-w-0 py-4 [[data-filter-group]+&]:border-t [[data-filter-group]+&]:border-border" role={multiple ? "group" : "radiogroup"} aria-labelledby={labelId} data-filter-group data-testid="filter-group" data-name={name} data-field={field}>
  <Text tag="span" weight="semibold" class="mb-2 flex w-full items-baseline justify-between gap-2 text-sm text-foreground" id={labelId}>{legend}{#if multiple}<Text tag="span" class="text-xs font-normal text-muted-foreground">{count}</Text>{/if}</Text>
  <Box class="flex flex-wrap gap-2">
    {#each options as o (o.value)}
      <Label class="relative inline-flex h-8 cursor-pointer items-center rounded border border-transparent px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring">
        {#if multiple}
          <Checkbox class="absolute inset-0 m-0 size-full cursor-pointer opacity-0" name={name + "[]"} value={o.value} checked={selected.includes(o.value)} onchange={(e: Event) => toggle(o.value, (e.currentTarget as HTMLInputElement).checked)} />
        {:else}
          <Radio class="absolute inset-0 m-0 size-full cursor-pointer opacity-0" {name} value={o.value} checked={selected.includes(o.value)} onchange={() => toggle(o.value, true)} />
        {/if}
        <Text tag="span">{o.label}</Text>
      </Label>
    {/each}
  </Box>
</Box>
