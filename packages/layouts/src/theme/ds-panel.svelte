<!-- The wide panel of the Theme sheet: the Design system of the whole site: every field of the theme (theme-fields, view "design":
     the same fields as the narrow panel, as radio groups), export/import and the specimen. On narrow screens it replaces the Theme
     panel; Back returns. -->
<script lang="ts">
  import { Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { FontId } from "@ui8kit/taste-data/fonts";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import { skinTokens, type Token } from "@ui8kit/theme-model/tokens";
  import DsSpecimen from "./ds-specimen.svelte";
  import ThemeFields from "./theme-fields.svelte";
  import ThemeIo from "./theme-io.svelte";
  import type { ThemeSheetText } from "./text";

  let { ctl, text, fallback }: {
    ctl: ThemeController; text: ThemeSheetText;
    /** what the site shows where the theme sets nothing (the app's skin and font, the default radius) */
    fallback: { skin: string; font: FontId; radius: number };
  } = $props();
  const T = $derived(text.theme);
  const t = $derived(ctl.value);
  const skin = $derived(t.skin ?? fallback.skin);
  const font = $derived((t.font ?? fallback.font) as FontId);
  const radius = $derived(t.radius ?? fallback.radius);
  let swatches = $state<{ light: Token[]; dark: Token[] }>({ light: [], dark: [] });
  $effect(() => { swatches = { light: skinTokens(skin, false), dark: skinTokens(skin, true) }; });
</script>

<Stack gap="0" class="ui8-ds-panel" data-testid="ds-panel">
  <Box class="ui8-theme-head">
    <Group gap="2" justify="between" align="center">
      <Group gap="2" align="center">
        <Button variant="ghost" size="sm" class="ui8-ds-panel-back" onclick={() => (ctl.wide = null)} data-testid="ds-back">{T.back}</Button>
        <Title as={2} size="base">{T.dsTitle}</Title>
      </Group>
    </Group>
    <Text class="ui8-theme-note">{T.dsNote}</Text>
  </Box>
  <Stack gap="0" class="ui8-theme-body" data-testid="ds-body">
    <ThemeFields {ctl} {text} idp="gt" view="design" />
    <ThemeIo {ctl} text={T.io} idp="gt" />
    <DsSpecimen text={text.design} modes={text.style} idp="gt" {skin} {font} {radius} tokens={swatches} tokenValues={t.tokens} class="ui8-ds-panel-specimen" />
  </Stack>
  <Group gap="2" class="ui8-theme-foot">
    <Button variant="outline" disabled={Object.keys(t.tokens).length === 0} onclick={() => ctl.setTheme({ tokens: {} })} data-testid="ds-tokens-reset">{T.dsReset}</Button>
  </Group>
</Stack>
