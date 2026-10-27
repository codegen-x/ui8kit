<!-- The page map: the blocks of a page top to bottom, each a small schematic of its composition (one row of a six-column grid:
     central, two columns, editorial, bento, diagonal, axial, card grid) with its name; a block with no composition label says so. -->
<script lang="ts">
  import { Box, List, ListItem, Text } from "@codegen-x/svelte-compose";
  import type { MapRow, StockText } from "../text";

  let { t, rows, point, onpoint }: { t: StockText; rows: MapRow[]; point: number | null; onpoint: (i: number | null) => void } = $props();
</script>

<List tag="ol" class="ui8-map" data-testid="page-map">
  {#each rows as r, i (r.key)}
    <ListItem class="ui8-map-row" data-point={point === i ? "1" : "0"} onmouseenter={() => onpoint(i)} onmouseleave={() => onpoint(null)}>
      <Box class="ui8-map-schema" aria-hidden="true" data-composition={r.composition || "none"}>
        {#if r.composition === "central"}
          <Box class="ui8-map-cell ui8-map-center"></Box>
        {:else if r.composition === "two-column"}
          <Box class="ui8-map-cell ui8-map-half"></Box><Box class="ui8-map-cell ui8-map-half"></Box>
        {:else if r.composition === "editorial"}
          <Box class="ui8-map-cell ui8-map-wide"></Box><Box class="ui8-map-cell ui8-map-narrow"></Box>
        {:else if r.composition === "bento"}
          <Box class="ui8-map-cell ui8-map-wide ui8-map-tall"></Box><Box class="ui8-map-cell ui8-map-narrow ui8-map-short"></Box><Box class="ui8-map-cell ui8-map-narrow ui8-map-short"></Box>
        {:else if r.composition === "diagonal"}
          <Box class="ui8-map-cell ui8-map-half ui8-map-short"></Box><Box class="ui8-map-cell ui8-map-half ui8-map-late ui8-map-short"></Box>
        {:else if r.composition === "axial"}
          <Box class="ui8-map-cell ui8-map-axis"></Box>
        {:else if r.composition === "grid"}
          <Box class="ui8-map-cell ui8-map-third"></Box><Box class="ui8-map-cell ui8-map-third"></Box><Box class="ui8-map-cell ui8-map-third"></Box>
        {:else}
          <Box class="ui8-map-cell ui8-map-empty"></Box>
        {/if}
      </Box>
      <Text tag="span" size="sm" class="ui8-map-name">{r.title}</Text>
      {#if r.composition}
        <Text tag="span" size="xs" class="ui8-map-label">{r.compositionLabel}</Text>
      {:else}
        <Text tag="span" size="xs" class="ui8-summary-none" data-state="no-label">{t.detail.passport.noLabel}</Text>
      {/if}
    </ListItem>
  {/each}
</List>
