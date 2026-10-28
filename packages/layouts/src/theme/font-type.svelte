<!-- The header of the Fonts panel: on the left the selected font set as a heading, body text and a quote (they follow the font size
     and the width live); on the right the fine controls. Size: every text size in % (80..120 in 5% steps, minus and plus beside the
     range; the spacing stays). Width: the font's Width axis (wdth), only for a font that has one, over its own range in whole
     percents. Each control has its own reset; the defaults (100%, the font's own width) are not stored (@ui8kit/theme-model/type). -->
<script lang="ts">
  import { Box, Button, Group, Label, LucideIcon, Range, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import { DEFAULT_SCALE, FONT_SCALES, SCALE_STEP, widthAxis } from "@ui8kit/theme-model/type";
  import type { ThemePanelText } from "./text";

  let { ctl, text, font }: { ctl: ThemeController; text: ThemePanelText["fontType"]; /** the font the site shows now */ font: FontId } = $props();
  const scale = $derived(ctl.value.fontScale ?? DEFAULT_SCALE);
  const axis = $derived(widthAxis(ctl.value.font));
  const width = $derived(axis ? ctl.value.fontWidth ?? axis.default : null);
  const MIN = FONT_SCALES[0], MAX = FONT_SCALES[FONT_SCALES.length - 1]!;
  // the defaults are written as "unset": 100% and the font's own width never reach storage
  const setScale = (v: number): void => ctl.setTheme({ fontScale: v === DEFAULT_SCALE ? undefined : Math.min(MAX, Math.max(MIN, v)) });
  const setWidth = (v: number): void => ctl.setTheme({ fontWidth: axis && v !== axis.default ? v : undefined });
  const face = $derived(`--font-sans:${family(font)},sans-serif;--taste-heading:${family(font)},sans-serif`);
</script>

<Box class="ui8-font-type" data-testid="font-type">
  <Stack gap="2" class="ui8-font-type-sample" style={face} data-testid="font-type-sample">
    <Title as={3} class="ui8-font-type-h">{text.heading}</Title>
    <Text class="ui8-font-type-body">{text.body}</Text>
    <Text tag="blockquote" class="ui8-font-type-quote">{text.quote}</Text>
  </Stack>
  <Stack gap="4" class="ui8-font-type-controls">
    <Box class="ui8-font-type-control">
      <Group gap="2" justify="between" align="center">
        <Label for="ui8-font-scale" class="ui8-palette-label">{text.size}</Label>
        <Text tag="span" class="ui8-palette-muted" data-testid="font-scale-value">{scale}%</Text>
      </Group>
      <Group gap="2" align="center" class="ui8-font-type-row">
        <Button variant="outline" size="sm" class="ui8-font-type-step" aria-label={text.smaller} disabled={scale <= MIN} onclick={() => setScale(scale - SCALE_STEP)} data-testid="font-scale-down"><LucideIcon name="minus" size={16} /></Button>
        <Range id="ui8-font-scale" min={String(MIN)} max={String(MAX)} step={String(SCALE_STEP)} value={scale} oninput={(e: Event) => setScale(Number((e.currentTarget as HTMLInputElement).value))} data-testid="font-scale-range" />
        <Button variant="outline" size="sm" class="ui8-font-type-step" aria-label={text.larger} disabled={scale >= MAX} onclick={() => setScale(scale + SCALE_STEP)} data-testid="font-scale-up"><LucideIcon name="plus" size={16} /></Button>
      </Group>
      <Button variant="ghost" size="sm" class="ui8-font-type-reset" disabled={scale === DEFAULT_SCALE} onclick={() => setScale(DEFAULT_SCALE)} data-testid="font-scale-reset">{text.resetSize}</Button>
    </Box>
    {#if axis && width !== null}
      <Box class="ui8-font-type-control" data-testid="font-width">
        <Group gap="2" justify="between" align="center">
          <Label for="ui8-font-width" class="ui8-palette-label">{text.width}</Label>
          <Text tag="span" class="ui8-palette-muted" data-testid="font-width-value">{width}%</Text>
        </Group>
        <Range id="ui8-font-width" min={String(axis.min)} max={String(axis.max)} step="1" value={width} oninput={(e: Event) => setWidth(Number((e.currentTarget as HTMLInputElement).value))} data-testid="font-width-range" />
        <Text class="ui8-palette-muted">{text.widthRange.replace("{min}", String(axis.min)).replace("{max}", String(axis.max))}</Text>
        <Button variant="ghost" size="sm" class="ui8-font-type-reset" disabled={width === axis.default} onclick={() => setWidth(axis.default)} data-testid="font-width-reset">{text.resetWidth}</Button>
      </Box>
    {:else}
      <Text class="ui8-palette-muted" data-testid="font-width-none">{text.noWidth}</Text>
    {/if}
  </Stack>
</Box>
