<!-- The harmonies of the palette panel as square buttons (one native radio group): each draws its arrangement on a small wheel
     (the base dot in the primary colour, the others in the text colour; monochromatic: one hue at three lightnesses, along one
     radius), with its name and its angles under it. -->
<script lang="ts">
  import { Box, Label, Radio, Text } from "@codegen-x/svelte-compose";
  import { HARMONIES, MONO_STEPS, OFFSETS, wheelPoint, type Harmony } from "@ui8kit/theme-model/palette";
  import type { PaletteText } from "./text";

  // value: the harmony of the custom palette; null while the skin's own colours show (a preset skin): then no button is selected
  let { value, onchange, text }: { value: Harmony | null; onchange: (h: Harmony) => void; text: PaletteText } = $props();
  const legendId = "ui8-palette-harmony-legend";
  const dots = (h: Harmony): Array<{ x: number; y: number }> =>
    h === "monochromatic" ? MONO_STEPS.map((d) => wheelPoint(0, 55 + d * 1.6)) : OFFSETS[h].map((o) => wheelPoint(o, 72));
  // the small wheel's outline: a hairline of the border colour (the diagram is clipped round)
  const RIM = "background:radial-gradient(circle closest-side,transparent 86%,var(--border) 90%)";
  const dotStyle = (p: { x: number; y: number }): string => `left:${50 + p.x * 50}%;top:${50 + p.y * 50}%`;
</script>

<Box class="ui8-palette-harmonies-wrap">
  <Text tag="span" weight="semibold" class="ui8-palette-label" id={legendId}>{text.harmony}</Text>
  <Box class="ui8-palette-harmonies" role="radiogroup" aria-labelledby={legendId}>
    {#each HARMONIES as h (h)}
      <Label class="group ui8-palette-harmony" data-testid={"harmony-" + h}>
        <Radio class="ui8-picker-input" name="ui8-palette-harmony" value={h} checked={value === h} onchange={() => onchange(h)} />
        <Box class="ui8-palette-diagram" style={RIM} aria-hidden="true">
          {#each dots(h) as p, i (i)}<Box class={i === 0 ? "ui8-palette-dot ui8-palette-dot-base" : "ui8-palette-dot"} style={dotStyle(p)}></Box>{/each}
        </Box>
        <Text tag="span" weight="semibold" class="ui8-palette-harmony-name">{text.harmonies[h].name}</Text>
        <Text tag="span" class="ui8-palette-harmony-hint">{text.harmonies[h].hint}</Text>
      </Label>
    {/each}
  </Box>
</Box>
