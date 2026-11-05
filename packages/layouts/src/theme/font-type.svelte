<!-- The header of the Fonts panel: on the left the selected font set as a heading, body text and a quote (they follow the font size
     and the width live); on the right the fine controls. Size: every text size in % (80..120 in 5% steps, minus and plus beside the
     range; the spacing stays). Width: the font's Width axis (wdth), only for a font that has one, over its own range in whole
     percents. Each control has its own reset; the defaults (100%, the font's own width) are not stored (@ui8kit/theme-model/type). -->
<script lang="ts">
  import { Box, Button, Group, Label, LucideIcon, Range, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { themeFamily, themeHeadingWeight } from "@ui8kit/app-shared/runtime/theme-fonts";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import { DEFAULT_FONT_WEIGHT, DEFAULT_SCALE, DEFAULT_TRACKING, FONT_SCALES, FONT_WEIGHTS, SCALE_STEP, TRACKING_STEP, TRACKINGS, widthAxis } from "@ui8kit/theme-model/type";
  import type { ThemePanelText } from "./text";

  let { ctl, text, font, headingFont }: { ctl: ThemeController; text: ThemePanelText["fontType"]; /** the font the site shows now */ font: string; headingFont: string } = $props();
  const bodyWeight = $derived(ctl.value.fontWeight ?? DEFAULT_FONT_WEIGHT);
  const headingWeight = $derived(ctl.value.headingWeight ?? themeHeadingWeight(ctl.value.headingFont ?? ctl.value.font) ?? 600);
  const tracking = $derived(ctl.value.tracking ?? DEFAULT_TRACKING);
  const scale = $derived(ctl.value.fontScale ?? DEFAULT_SCALE);
  const axis = $derived(widthAxis(ctl.value.font));
  const width = $derived(axis ? ctl.value.fontWidth ?? axis.default : null);
  const MIN = FONT_SCALES[0], MAX = FONT_SCALES[FONT_SCALES.length - 1]!;
  // the defaults are written as "unset": 100% and the font's own width never reach storage
  const setWeight = (kind: "fontWeight" | "headingWeight", v: number): void => ctl.setTheme({ [kind]: FONT_WEIGHTS.includes(v as (typeof FONT_WEIGHTS)[number]) ? v : undefined });
  const setTracking = (v: number): void => ctl.setTheme({ tracking: TRACKINGS.includes(v as (typeof TRACKINGS)[number]) && v !== DEFAULT_TRACKING ? v : undefined });
  const trackingLabel = (v: number): string => `${v > 0 ? "+" : ""}${v.toFixed(3).replace(/0$/, "")}em`;
  const setScale = (v: number): void => ctl.setTheme({ fontScale: v === DEFAULT_SCALE ? undefined : Math.min(MAX, Math.max(MIN, v)) });
  const setWidth = (v: number): void => ctl.setTheme({ fontWidth: axis && v !== axis.default ? v : undefined });
  const face = $derived(`--font-sans:${themeFamily(font)},sans-serif;font-weight:${bodyWeight};--tracking-normal:${tracking}em;--taste-heading:${themeFamily(headingFont)},sans-serif;--taste-heading-weight:${headingWeight}`);
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
    <Box class="ui8-font-type-control">
      <Group gap="2" justify="between" align="center"><Label for="ui8-font-weight" class="ui8-palette-label">{text.weight}</Label><Text tag="span" class="ui8-palette-muted" data-testid="font-weight-value">{bodyWeight}</Text></Group>
      <Range id="ui8-font-weight" min={String(FONT_WEIGHTS[0])} max={String(FONT_WEIGHTS[FONT_WEIGHTS.length - 1])} step="100" value={bodyWeight} oninput={(e: Event) => setWeight("fontWeight", Number((e.currentTarget as HTMLInputElement).value))} data-testid="font-weight-range" />
      <Button variant="ghost" size="sm" class="ui8-font-type-reset" disabled={ctl.value.fontWeight === undefined} onclick={() => ctl.setTheme({ fontWeight: undefined })} data-testid="font-weight-reset">{text.resetWeight}</Button>
    </Box>
    <Box class="ui8-font-type-control">
      <Group gap="2" justify="between" align="center"><Label for="ui8-heading-weight" class="ui8-palette-label">{text.headingWeight}</Label><Text tag="span" class="ui8-palette-muted" data-testid="heading-weight-value">{headingWeight}</Text></Group>
      <Range id="ui8-heading-weight" min={String(FONT_WEIGHTS[0])} max={String(FONT_WEIGHTS[FONT_WEIGHTS.length - 1])} step="100" value={headingWeight} oninput={(e: Event) => setWeight("headingWeight", Number((e.currentTarget as HTMLInputElement).value))} data-testid="heading-weight-range" />
      <Text class="ui8-palette-muted">{text.weightNote}</Text>
      <Button variant="ghost" size="sm" class="ui8-font-type-reset" disabled={ctl.value.headingWeight === undefined} onclick={() => ctl.setTheme({ headingWeight: undefined })} data-testid="heading-weight-reset">{text.resetHeadingWeight}</Button>
    </Box>
    <Box class="ui8-font-type-control">
      <Group gap="2" justify="between" align="center"><Label for="ui8-font-tracking" class="ui8-palette-label">{text.tracking}</Label><Text tag="span" class="ui8-palette-muted" data-testid="font-tracking-value">{trackingLabel(tracking)}</Text></Group>
      <Group gap="2" align="center" class="ui8-font-type-row">
        <Button variant="outline" size="sm" class="ui8-font-type-step" aria-label={text.tighter} disabled={tracking <= TRACKINGS[0]} onclick={() => setTracking(tracking - TRACKING_STEP)} data-testid="font-tracking-down"><LucideIcon name="minus" size={16} /></Button>
        <Range id="ui8-font-tracking" min={String(TRACKINGS[0])} max={String(TRACKINGS[TRACKINGS.length - 1])} step={String(TRACKING_STEP)} value={tracking} oninput={(e: Event) => setTracking(Number((e.currentTarget as HTMLInputElement).value))} data-testid="font-tracking-range" />
        <Button variant="outline" size="sm" class="ui8-font-type-step" aria-label={text.wider} disabled={tracking >= TRACKINGS[TRACKINGS.length - 1]} onclick={() => setTracking(tracking + TRACKING_STEP)} data-testid="font-tracking-up"><LucideIcon name="plus" size={16} /></Button>
      </Group>
      <Button variant="ghost" size="sm" class="ui8-font-type-reset" disabled={ctl.value.tracking === undefined} onclick={() => setTracking(DEFAULT_TRACKING)} data-testid="font-tracking-reset">{text.resetTracking}</Button>
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
