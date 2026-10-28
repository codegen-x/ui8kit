<!-- A wide panel of the Theme sheet: the custom palette. Three live cards on top; below, the colour wheel (palette-wheel) on the left
     and the harmonies (palette-harmonies) with the hue, saturation and lightness ranges on the right. Any change writes the theme's
     palette, which rewrites only the skin's colour tokens (@ui8kit/theme-model/palette) for the whole site, its previews included;
     the skin select then shows "Custom", and Reset returns to the skin's own colours. Under the tools, 16 well-known combinations
     (palette-presets) apply a whole palette at once, at the contrast level chosen (AA 4.5:1 or AAA 7:1, under the ranges). Opening
     the panel changes nothing. -->
<script lang="ts">
  import { Box, Button, Group, Label, Range, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import { contrastLevel, DEFAULT_PALETTE, withContrast, type ContrastLevel, type Palette } from "@ui8kit/theme-model/palette";
  import OptionGroup from "../magazine/option-group.svelte";
  import PaletteHarmonies from "./palette-harmonies.svelte";
  import PalettePresets from "./palette-presets.svelte";
  import PaletteSamples from "./palette-samples.svelte";
  import PaletteWheel from "./palette-wheel.svelte";
  import type { ThemeSheetText } from "./text";

  let { ctl, text }: { ctl: ThemeController; text: ThemeSheetText } = $props();
  const T = $derived(text.palette);
  const p = $derived(ctl.value.palette ?? DEFAULT_PALETTE);
  const set = (patch: Partial<Palette>): void => ctl.setTheme({ palette: { ...p, ...patch } });
  const RANGES = [
    { key: "h", max: 359, unit: "°" },
    { key: "s", max: 100, unit: "%" },
    { key: "l", max: 100, unit: "%" },
  ] as const;
  // the contrast level: AA (the default) or AAA for every text pair of the palette; none selected while the skin's own colours show
  const levels = $derived([{ value: "AA", label: T.contrast.aa }, { value: "AAA", label: T.contrast.aaa }]);
  const setLevel = (v: string): void => ctl.setTheme({ palette: withContrast(p, v as ContrastLevel) });
  const rangeLabel = (k: "h" | "s" | "l"): string => (k === "h" ? T.hue : k === "s" ? T.saturation : T.lightness);
</script>

<Stack gap="0" class="ui8-palette-panel" data-testid="picker-palette">
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button variant="ghost" size="sm" class="ui8-ds-panel-back" onclick={() => (ctl.wide = null)} data-testid="picker-back">{text.theme.back}</Button>
      <Title as={2} size="base">{T.title}</Title>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Box class="ui8-theme-body" data-testid="palette-body">
    <PaletteSamples text={T.samples} />
    <Box class="ui8-palette-main">
      <PaletteWheel palette={p} onchange={(v) => ctl.setTheme({ palette: v })} label={T.wheel} />
      <Stack gap="4" class="ui8-palette-controls">
        <PaletteHarmonies value={ctl.value.palette?.harmony ?? null} onchange={(harmony) => set({ harmony })} text={T} />
        {#each RANGES as r (r.key)}
          <Box class="ui8-palette-range">
            <Group gap="2" justify="between" align="center">
              <Label for={"ui8-palette-" + r.key} class="ui8-palette-label">{rangeLabel(r.key)}</Label>
              <Text tag="span" class="ui8-palette-muted" data-testid={"palette-value-" + r.key}>{p[r.key] + r.unit}</Text>
            </Group>
            <Range id={"ui8-palette-" + r.key} min="0" max={r.max} step="1" value={p[r.key]} oninput={(e: Event) => set({ [r.key]: Number((e.currentTarget as HTMLInputElement).value) })} data-testid={"palette-range-" + r.key} />
          </Box>
        {/each}
        <Box data-testid="palette-contrast">
          <OptionGroup name="ui8-palette-contrast" legend={T.contrast.legend} multiple={false} options={levels} selected={ctl.value.palette ? [contrastLevel(ctl.value.palette)] : []} onchange={(v) => setLevel(v[0] ?? "AA")} />
          <Text class="ui8-palette-muted">{T.contrast.note}</Text>
        </Box>
        <Button variant="outline" disabled={!ctl.value.palette} onclick={() => ctl.setTheme({ palette: undefined })} data-testid="palette-reset">{T.reset}</Button>
      </Stack>
    </Box>
    <PalettePresets current={ctl.value.palette ?? null} mode={ctl.mode} skin={ctl.value.skin} onpick={(v) => ctl.setTheme({ palette: withContrast(v, contrastLevel(p)) })} text={T.presets} />
  </Box>
</Stack>
