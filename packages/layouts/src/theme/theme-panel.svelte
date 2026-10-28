<!-- The narrow panel of the Theme sheet: every field of the theme (theme-fields, view "sheet"; the skin and font selects open their
     picker), export/import; the footer opens the wide Design system panel (the same fields as radio groups, with the specimen) and
     resets the theme. -->
<script lang="ts">
  import { Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { isDefault } from "@ui8kit/theme-model/global-theme";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import ThemeFields from "./theme-fields.svelte";
  import ThemeIo from "./theme-io.svelte";
  import type { ThemeSheetText } from "./text";

  let { ctl, text, titleId }: { ctl: ThemeController; text: ThemeSheetText; /** the id of the panel's heading (the dialog's name) */ titleId: string } = $props();
  const T = $derived(text.theme);
  const t = $derived(ctl.value);
</script>

<Stack gap="0" class="ui8-theme-panel" data-testid="theme-panel">
  <Box class="ui8-theme-head">
    <Group gap="2" justify="between" align="center">
      <Title as={2} size="base" id={titleId}>{T.title}</Title>
      <Button variant="ghost" size="sm" onclick={() => (ctl.open = false)} data-testid="theme-close">{T.close}</Button>
    </Group>
    <Text class="ui8-theme-note">{T.note}</Text>
  </Box>
  <Stack gap="0" class="ui8-theme-body" data-testid="theme-body">
    <ThemeFields {ctl} {text} idp="theme" view="sheet">
      {#snippet afterSite()}
        <Box class="ui8-theme-panel-radius">
          <Button variant="outline" size="sm" disabled={t.radius === null} onclick={() => ctl.setTheme({ radius: null })} data-testid="theme-radius-reset">{T.resetRadius}</Button>
        </Box>
      {/snippet}
    </ThemeFields>
    <ThemeIo {ctl} text={T.io} idp="theme" />
  </Stack>
  <Group gap="2" class="ui8-theme-foot">
    <Button variant="outline" disabled={isDefault(t)} onclick={() => ctl.reset()} data-testid="theme-reset">{T.resetAll}</Button>
    <Button class="ui8-theme-panel-ds" variant={ctl.wide === "ds" ? "secondary" : "default"} onclick={() => (ctl.wide = ctl.wide === "ds" ? null : "ds")} data-testid="theme-ds">{ctl.wide === "ds" ? T.hideDesignSystem : T.designSystem}</Button>
  </Group>
</Stack>
