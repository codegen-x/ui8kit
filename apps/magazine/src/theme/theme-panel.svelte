<!-- The narrow panel of the Theme sheet: every field of the theme (theme-fields.svelte, view "sheet"), export/import; the footer opens
     the wide Design system panel (the same fields as radio groups, with the specimen) and resets the theme. -->
<script lang="ts">
  import { Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { isDefault } from "@ui8kit/theme-model/global-theme";
  import { gtheme, resetTheme, setTheme } from "../lib/global-theme.svelte";
  import ThemeFields from "./theme-fields.svelte";
  import ThemeIo from "./theme-io.svelte";

  const T = ui.theme;
  const t = $derived(gtheme.value);
</script>

<Stack gap="0" class="mg-tpanel mg-tpanel-narrow" data-testid="theme-panel">
  <Box class="mg-sheet-head">
    <Group gap="2" justify="between" align="center">
      <Title as={2} class="mg-h2" id="mg-theme-title">{T.title}</Title>
      <Button variant="ghost" size="sm" onclick={() => (gtheme.open = false)} data-testid="theme-close">{T.close}</Button>
    </Group>
    <Text class="mg-note">{T.note}</Text>
  </Box>
  <Stack gap="0" class="mg-sheet-body" data-testid="theme-body">
    <ThemeFields idp="theme" view="sheet">
      {#snippet afterSite()}
        <Box class="mg-treset">
          <Button variant="outline" size="sm" disabled={t.radius === null} onclick={() => setTheme({ radius: null })} data-testid="theme-radius-reset">{T.resetRadius}</Button>
        </Box>
      {/snippet}
    </ThemeFields>
    <ThemeIo idp="theme" />
  </Stack>
  <Group gap="2" class="mg-sheet-foot">
    <Button variant="outline" disabled={isDefault(t)} onclick={resetTheme} data-testid="theme-reset">{T.resetAll}</Button>
    <Button class="mg-grow" variant={gtheme.wide ? "secondary" : "default"} onclick={() => (gtheme.wide = !gtheme.wide)} data-testid="theme-ds">{gtheme.wide ? T.hideDesignSystem : T.designSystem}</Button>
  </Group>
</Stack>
