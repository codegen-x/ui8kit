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

<Stack gap="0" class="h-full min-h-0 w-180 min-w-0 shrink border-r border-border bg-background *:w-full max-sm:w-screen max-sm:max-w-none max-sm:border-r-0" data-testid="ds-panel">
  <Box class="flex-none border-b border-border bg-background p-4">
    <Group gap="2" justify="between" align="center">
      <Group gap="2" align="center">
        <Button variant="ghost" size="sm" class="sm:hidden" onclick={() => (ctl.wide = false)} data-testid="ds-back">{T.back}</Button>
        <Title as={2} size="base">{T.dsTitle}</Title>
      </Group>
    </Group>
    <Text class="mt-2 text-sm leading-normal text-muted-foreground">{T.dsNote}</Text>
  </Box>
  <Stack gap="0" class="min-h-0 flex-auto scroll-py-6 overflow-y-auto overscroll-contain px-4 *:w-full" data-testid="ds-body">
    <ThemeFields {ctl} {text} idp="gt" view="design" />
    <ThemeIo {ctl} text={T.io} idp="gt" />
    <DsSpecimen text={text.design} modes={text.style} idp="gt" {skin} {font} {radius} tokens={swatches} tokenValues={t.tokens} class="mb-4" />
  </Stack>
  <Group gap="2" class="flex-none border-t border-border bg-background p-4">
    <Button variant="outline" disabled={Object.keys(t.tokens).length === 0} onclick={() => ctl.setTheme({ tokens: {} })} data-testid="ds-tokens-reset">{T.dsReset}</Button>
  </Group>
</Stack>
