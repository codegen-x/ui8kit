<!-- The narrow panel of the Theme sheet: every field of the theme (theme-fields, view "sheet"), export/import; the footer opens the
     wide Design system panel (the same fields as radio groups, with the specimen) and resets the theme. -->
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

<Stack gap="0" class="h-full min-h-0 w-80 flex-none bg-background *:w-full max-sm:w-screen max-sm:in-data-[wide=1]:hidden" data-testid="theme-panel">
  <Box class="flex-none border-b border-border bg-background p-4">
    <Group gap="2" justify="between" align="center">
      <Title as={2} size="base" id={titleId}>{T.title}</Title>
      <Button variant="ghost" size="sm" onclick={() => (ctl.open = false)} data-testid="theme-close">{T.close}</Button>
    </Group>
    <Text class="mt-2 text-sm leading-normal text-muted-foreground">{T.note}</Text>
  </Box>
  <Stack gap="0" class="min-h-0 flex-auto scroll-py-6 overflow-y-auto overscroll-contain px-4 *:w-full" data-testid="theme-body">
    <ThemeFields {ctl} {text} idp="theme" view="sheet">
      {#snippet afterSite()}
        <Box class="pb-4">
          <Button variant="outline" size="sm" disabled={t.radius === null} onclick={() => ctl.setTheme({ radius: null })} data-testid="theme-radius-reset">{T.resetRadius}</Button>
        </Box>
      {/snippet}
    </ThemeFields>
    <ThemeIo {ctl} text={T.io} idp="theme" />
  </Stack>
  <Group gap="2" class="flex-none border-t border-border bg-background p-4">
    <Button variant="outline" disabled={isDefault(t)} onclick={() => ctl.reset()} data-testid="theme-reset">{T.resetAll}</Button>
    <Button class="flex-1" variant={ctl.wide ? "secondary" : "default"} onclick={() => (ctl.wide = !ctl.wide)} data-testid="theme-ds">{ctl.wide ? T.hideDesignSystem : T.designSystem}</Button>
  </Group>
</Stack>
