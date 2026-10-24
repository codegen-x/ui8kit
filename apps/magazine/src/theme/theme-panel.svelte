<!-- The narrow panel of the Theme sheet: mode, skin, font, default radius (with Reset) and density for the whole site; the footer
     opens the wide Design system panel and resets the theme. -->
<script lang="ts">
  import { Box, Button, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import { FONT_IDS } from "@ui8kit/taste-data/font-ids";
  import { RADII, SKIN_IDS } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import { DENSITIES, densityOf, isDefault, NO_THEME, setDensity } from "../lib/global-theme";
  import { gtheme, setTheme } from "../lib/global-theme.svelte";
  import type { Density } from "../lib/design";
  import { theme } from "../lib/theme.svelte";
  import FilterGroup from "../feed/filter-group.svelte";
  import FilterSelect from "../feed/filter-select.svelte";

  const T = ui.theme;
  const t = $derived(gtheme.value);
  const withDefault = (ids: readonly string[]) => [{ value: "", label: T.default }, ...ids.map((v) => ({ value: v, label: v }))];
  const pos = (p: string) => (ui.design.positions as Record<string, string>)[p] ?? p;
  const density = $derived(densityOf(t.tokens));
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
    <FilterGroup name="theme-mode" legend={T.mode} multiple={false} options={[{ value: "light", label: T.light }, { value: "dark", label: T.dark }]} selected={[theme.dark ? "dark" : "light"]} onchange={(v) => { if ((v[0] === "dark") !== theme.dark) toggleTheme(); }} />
    <FilterSelect name="theme-skin" legend={T.skin} options={withDefault(SKIN_IDS)} value={t.skin ?? ""} onchange={(v) => setTheme({ skin: v || null })} />
    <FilterSelect name="theme-font" legend={T.font} options={withDefault(FONT_IDS)} value={t.font ?? ""} onchange={(v) => setTheme({ font: v || null })} />
    <FilterGroup name="theme-radius" legend={T.radius} multiple={false} options={RADII.map((r) => ({ value: String(r), label: r + " px" }))} selected={t.radius === null ? [] : [String(t.radius)]} onchange={(v) => setTheme({ radius: Number(v[0]) })} />
    <Box class="mg-treset">
      <Button variant="outline" size="sm" disabled={t.radius === null} onclick={() => setTheme({ radius: null })} data-testid="theme-radius-reset">{T.resetRadius}</Button>
    </Box>
    <FilterGroup name="theme-density" legend={T.density} multiple={false} options={DENSITIES.map((d) => ({ value: d, label: pos(d) }))} selected={density ? [density] : []} onchange={(v) => setTheme({ tokens: setDensity(t.tokens, v[0] as Density) })} />
  </Stack>
  <Group gap="2" class="mg-sheet-foot">
    <Button variant="outline" disabled={isDefault(t)} onclick={() => setTheme(NO_THEME)} data-testid="theme-reset">{T.resetAll}</Button>
    <Button class="mg-grow" variant={gtheme.wide ? "secondary" : "default"} onclick={() => (gtheme.wide = !gtheme.wide)} data-testid="theme-ds">{gtheme.wide ? T.hideDesignSystem : T.designSystem}</Button>
  </Group>
</Stack>
