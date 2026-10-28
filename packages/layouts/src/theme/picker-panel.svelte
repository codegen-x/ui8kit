<!-- A wide panel of the Theme sheet: the skin picker or the font picker. Every choice ("Default" first) as a 4:3 card, its face drawn
     in the skin or font it stands for (the rest as the site shows it now); a card writes the same field as the select beside the
     picker's button, so the two always agree. The cards are one radio group (native keyboard: arrows move and pick). The font
     picker's header holds the samples and the size and width controls (font-type). On narrow screens the panel replaces the Theme
     panel; Back returns. -->
<script lang="ts">
  import { Badge, Box, Button, Group, Label, Radio, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import FontType from "./font-type.svelte";
  import { CHOICES, PICKER_FIELD, SWATCHES, type PickerKind } from "./pickers";
  import type { ThemeSheetText } from "./text";

  let { ctl, text, kind, fallback }: {
    ctl: ThemeController; text: ThemeSheetText; kind: PickerKind;
    /** what the site shows where the theme sets nothing (what the "Default" card and the other field show) */
    fallback: { skin: string; font: FontId; radius: number };
  } = $props();
  const T = $derived(text.theme);
  const field = $derived(PICKER_FIELD[kind]);
  const current = $derived(ctl.value[field] ?? null);
  const title = $derived(kind === "skins" ? T.skinsTitle : T.fontsTitle);
  const titleId = $derived("ui8-picker-" + kind + "-title");
  const skin = $derived(ctl.value.skin ?? fallback.skin);
  const font = $derived((ctl.value.font ?? fallback.font) as FontId);
  const radius = $derived(ctl.value.radius ?? fallback.radius);
  const skinOf = (v: string | null): string => (kind === "skins" ? v ?? fallback.skin : skin);
  const fontOf = (v: string | null): FontId => (kind === "fonts" ? ((v ?? fallback.font) as FontId) : font);
  // a skin card returns to that skin's own colours: the model drops a custom palette whenever a skin is chosen (patchTheme)
  const pick = (v: string | null): void => ctl.setField(field, v);
  const faceStyle = (v: string | null): string => {
    const f = family(fontOf(v));
    return `--radius:${radius}px;--font-sans:${f},sans-serif;--taste-heading:${f},sans-serif`;
  };
</script>

<Stack gap="0" class="ui8-picker-panel" data-testid={"picker-" + kind}>
  <Box class="ui8-theme-head">
    <Group gap="2" align="center">
      <Button variant="ghost" size="sm" class="ui8-ds-panel-back" onclick={() => (ctl.wide = null)} data-testid="picker-back">{T.back}</Button>
      <Title as={2} size="base" id={titleId}>{title}</Title>
    </Group>
    <Text class="ui8-theme-note">{kind === "skins" ? T.skinsNote : T.fontsNote}</Text>
    {#if kind === "fonts"}<FontType {ctl} text={T.fontType} {font} />{/if}
  </Box>
  <Box class="ui8-theme-body" data-testid="picker-body">
    <Box class="ui8-picker-grid" role="radiogroup" aria-labelledby={titleId}>
      {#each CHOICES[kind] as v (v ?? "")}
        <Label class="group ui8-picker-card" data-testid={"pick-card-" + (v ?? "default")}>
          <Radio class="ui8-picker-input" name={"ui8-pick-" + kind} value={v ?? ""} checked={current === v} onchange={() => pick(v)} />
          <Box class="ui8-picker-face" data-skin={skinOf(v)} style={faceStyle(v)} aria-hidden="true">
            {#if kind === "skins"}
              <Stack gap="2">
                <Text tag="span" weight="semibold" class="ui8-picker-title">{T.sampleTitle}</Text>
                <Text tag="span" class="ui8-picker-text">{T.sampleText}</Text>
                <Group gap="2" align="center">
                  <Box class="ui8-picker-button">{T.sampleButton}</Box>
                  <Badge variant="secondary">{T.sampleBadge}</Badge>
                </Group>
                <Box class="ui8-picker-surface">{T.sampleCard}</Box>
                <Group gap="2">
                  {#each SWATCHES as c (c)}<Box class="ui8-picker-swatch" style={`background:var(--${c})`}></Box>{/each}
                </Group>
              </Stack>
            {:else}
              <Stack gap="2" justify="center" class="ui8-picker-font">
                <Text tag="span" weight="semibold" class="ui8-picker-font-h">{T.fontHeading}</Text>
                <Text tag="span" class="ui8-picker-text">{T.fontSub}</Text>
              </Stack>
            {/if}
          </Box>
          <Text tag="span" class="ui8-picker-name">{v ?? T.default}</Text>
        </Label>
      {/each}
    </Box>
  </Box>
</Stack>
