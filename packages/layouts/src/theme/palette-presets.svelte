<!-- The well-known colour combinations under the palette tools: 16 cards of vertical stripes, each the colours that preset gives
     the site in the mode now (its chart colours: every colour of its harmony), with its name. One native radio group: a card
     applies its harmony, hue, saturation and lightness, and the skin select shows "Custom palette". -->
<script lang="ts">
  import { Box, Label, Radio, Text } from "@codegen-x/svelte-compose";
  import { paletteTokens, PRESETS, samePalette, type Palette } from "@ui8kit/theme-model/palette";
  import type { PaletteText } from "./text";

  let { current, mode, onpick, text }: {
    /** the custom palette now (none: no card is selected) */ current: Palette | null; mode: "light" | "dark";
    onpick: (p: Palette) => void; text: PaletteText["presets"];
  } = $props();
  const titleId = "ui8-palette-presets-title";
  const CHARTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;
  const stripes = (p: Palette): string[] => { const t = paletteTokens(p, mode); return CHARTS.map((c) => `background:${t[c]}`); };
</script>

<Box class="ui8-palette-presets-wrap" data-testid="palette-presets">
  <Text tag="span" weight="semibold" class="ui8-palette-label" id={titleId}>{text.title}</Text>
  <Text class="ui8-palette-muted">{text.note}</Text>
  <Box class="ui8-palette-presets" role="radiogroup" aria-labelledby={titleId}>
    {#each PRESETS as pr (pr.id)}
      <Label class="group ui8-palette-preset" data-testid={"preset-" + pr.id}>
        <Radio class="ui8-picker-input" name="ui8-palette-preset" value={pr.id} checked={samePalette(current, pr.palette)} onchange={() => onpick(pr.palette)} />
        <Box class="ui8-palette-stripes" aria-hidden="true">
          {#each stripes(pr.palette) as st, i (i)}<Box class="ui8-palette-stripe" style={st}></Box>{/each}
        </Box>
        <Text tag="span" class="ui8-palette-preset-name">{text.names[pr.id] ?? pr.id}</Text>
      </Label>
    {/each}
  </Box>
</Box>
