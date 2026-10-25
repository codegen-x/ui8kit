<!-- The wide panel of the Theme sheet: the Design system of the whole site: every field of the theme (theme-fields.svelte, view
     "design": the same fields as the narrow panel, as radio groups), export/import and the specimen (the same specimen as the style
     page's Design system tab). On narrow screens it replaces the Theme panel; Back returns. -->
<script lang="ts">
  import { Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { FontId } from "@ui8kit/taste-data/fonts";
  import ui from "../../content/ui.json";
  import { gtheme, setTheme } from "../lib/global-theme.svelte";
  import { skinTokens } from "../lib/tokens";
  import DsSpecimen from "../parts/ds-specimen.svelte";
  import ThemeFields from "./theme-fields.svelte";
  import ThemeIo from "./theme-io.svelte";

  const T = ui.theme;
  const t = $derived(gtheme.value);
  // the values the site shows where the theme sets nothing: the app skin and font, radius 8
  const skin = $derived(t.skin ?? "sky");
  const font = $derived((t.font ?? "inter") as FontId);
  const radius = $derived(t.radius ?? 8);
  let swatches = $state<{ light: ReturnType<typeof skinTokens>; dark: ReturnType<typeof skinTokens> }>({ light: [], dark: [] });
  $effect(() => { swatches = { light: skinTokens(skin, false), dark: skinTokens(skin, true) }; });
</script>

<Stack gap="0" class="mg-tpanel mg-tpanel-wide" data-testid="ds-panel">
  <Box class="mg-sheet-head">
    <Group gap="2" justify="between" align="center">
      <Group gap="2" align="center">
        <Button variant="ghost" size="sm" class="mg-back" onclick={() => (gtheme.wide = false)} data-testid="ds-back">{T.back}</Button>
        <Title as={2} class="mg-h2">{T.dsTitle}</Title>
      </Group>
    </Group>
    <Text class="mg-note">{T.dsNote}</Text>
  </Box>
  <Stack gap="0" class="mg-sheet-body" data-testid="ds-body">
    <ThemeFields idp="gt" view="design" />
    <ThemeIo idp="gt" />
    <DsSpecimen idp="gt" {skin} {font} {radius} tokens={swatches} tokenValues={t.tokens} />
  </Stack>
  <Group gap="2" class="mg-sheet-foot">
    <Button variant="outline" disabled={Object.keys(t.tokens).length === 0} onclick={() => setTheme({ tokens: {} })} data-testid="ds-tokens-reset">{T.dsReset}</Button>
  </Group>
</Stack>
