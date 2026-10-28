<!-- A group as a single native select (the kit Select), for long lists such as font pairs; the heading is its label. An optional
     action (an icon button, such as the Theme sheet's skin and font pickers) sits on the select's row, after it. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, Group, Label, Select, Text } from "@codegen-x/svelte-compose";

  let { name, legend, options, value, onchange, field, action }: {
    name: string; legend: string; options: Array<{ value: string; label: string }>; value: string; onchange: (value: string) => void;
    /** the theme field it edits, as data-field */ field?: string;
    /** shown on the select's row, after it */ action?: Snippet;
  } = $props();
  const id = $derived("filter-" + name);
</script>

{#snippet control()}
  <Select {id} {name} size="sm" class="ui8-option-select" {options} {value} onchange={(e: Event) => onchange((e.currentTarget as HTMLSelectElement).value)} data-testid={"filter-select-" + name} />
{/snippet}

<Box class="ui8-option-group" data-filter-group data-testid="filter-group" data-name={name} data-field={field}>
  <Label for={id} class="ui8-option-legend"><Text tag="span" weight="semibold">{legend}</Text></Label>
  {#if action}
    <Group gap="2" align="center" class="ui8-option-select-row">{@render control()}{@render action()}</Group>
  {:else}
    {@render control()}
  {/if}
</Box>
