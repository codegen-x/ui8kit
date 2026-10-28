<!-- Every field of the global theme (@ui8kit/theme-model/global-theme FIELDS) as one control: mode, skin, font, default radius, and
     radius, density and shadows per element. Both panels of the Theme sheet render it (view "sheet": compact selects; view "design":
     radio groups), so both cover every field; values come from the app's controller and go back through it. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, Button, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { DENSITIES, densityOf, fieldValue, setDensity, viewFields, type Field, type FieldGroup, type ThemeView } from "@ui8kit/theme-model/global-theme";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import type { Density } from "@ui8kit/theme-model/design";
  import OptionGroup from "../magazine/option-group.svelte";
  import OptionSelect from "../magazine/option-select.svelte";
  import { pickerOf, type PickerKind } from "./pickers";
  import type { ThemeSheetText } from "./text";

  let { ctl, text, idp, view, afterSite }: {
    ctl: ThemeController; text: ThemeSheetText; /** name prefix: unique per use on a page */ idp: string; view: ThemeView;
    /** shown after the site fields */ afterSite?: Snippet;
  } = $props();
  const T = $derived(text.theme);
  const D = $derived(text.design);
  const t = $derived(ctl.value);
  const rows = $derived(viewFields(view));
  const SHORT: Record<FieldGroup, string> = { site: "", radius: "er", density: "ed", shadow: "es" };
  const heading = (g: FieldGroup): string => (g === "radius" ? D.elementRadius : g === "density" ? D.elementDensity : g === "shadow" ? D.elementShadow : "");
  const nameOf = (f: Field) => (f.group === "site" ? `${idp}-${f.id}` : `${idp}-${SHORT[f.group]}-${f.element}`);
  const legend = (f: Field) => (f.group === "site" ? (T as unknown as Record<string, string>)[f.id] ?? f.id : D.elements[f.element!] ?? f.element!);
  const pos = (p: string) => D.positions[p] ?? p;
  const unsetLabel = (f: Field) => (f.group === "site" ? T.default : f.id === "radius-badge" ? D.pill : f.group === "radius" ? `${D.follow} (${t.radius ?? 8} px)` : D.follow);
  const valueLabel = (f: Field, v: string | number) => (f.id === "mode" ? (v === "dark" ? T.dark : T.light) : typeof v === "number" ? `${v} px` : f.group === "density" ? pos(v) : v);
  // a custom palette (the colour wheel) shows in the skin select as "Custom" (over the skin it keeps the neutrals of); picking a
  // skin there returns to that skin's own colours
  const CUSTOM = "custom";
  const custom = (f: Field): boolean => f.id === "skin" && !!t.palette;
  const options = (f: Field) => [...(custom(f) ? [{ value: CUSTOM, label: text.palette.custom }] : []), ...(f.nullable ? [{ value: "", label: unsetLabel(f) }] : []), ...f.values.map((v) => ({ value: String(v), label: valueLabel(f, v) }))];
  const current = (f: Field) => { if (custom(f)) return CUSTOM; const v = fieldValue({ mode: ctl.mode, theme: t }, f.id); return v === null ? "" : String(v); };
  const change = (f: Field, raw: string) => {
    if (raw === CUSTOM) return;
    const v = raw === "" ? null : f.values.find((x) => String(x) === raw) ?? null;
    if (custom(f)) ctl.setTheme({ skin: typeof v === "string" ? v : null, palette: undefined });
    else ctl.setField(f.id, v);
  };
  const density = $derived(densityOf(t.tokens));
  // the skin and font selects of the narrow panel open their picker (a wide panel) from an icon button on their row
  const ICON: Record<PickerKind, string> = { skins: "layers", fonts: "type" };
  const browse = (k: PickerKind): string => (k === "skins" ? T.browseSkins : T.browseFonts);
  const togglePicker = (k: PickerKind): void => { ctl.wide = ctl.wide === k ? null : k; };
  const starts = (i: number) => rows[i]!.field.group !== "site" && rows[i]!.field.group !== rows[i - 1]?.field.group;
</script>

<Stack gap="0" class="ui8-theme-fields" data-testid={idp + "-fields"} data-view={view}>
  {#each rows as r, i (r.field.id)}
    {#if starts(i)}
      <Title as={3} size="sm" class="ui8-theme-fields-heading">{heading(r.field.group)}</Title>
      {#if r.field.group === "density"}
        <OptionGroup name={idp + "-density"} field="density-all" legend={T.densityAll} multiple={false} options={DENSITIES.map((d) => ({ value: d, label: pos(d) }))} selected={density ? [density] : []} onchange={(v) => ctl.setTheme({ tokens: setDensity(t.tokens, v[0] as Density) })} />
      {/if}
    {/if}
    {#if r.control === "select" && view === "sheet" && pickerOf(r.field.id)}
      {@const k = pickerOf(r.field.id)!}
      <OptionSelect name={nameOf(r.field)} field={r.field.id} legend={legend(r.field)} options={options(r.field)} value={current(r.field)} onchange={(v) => change(r.field, v)}>
        {#snippet action()}
          <Button variant={ctl.wide === k ? "secondary" : "outline"} size="sm" layout="icon" aria-label={browse(k)} title={browse(k)} onclick={() => togglePicker(k)} data-testid={"pick-" + k}><LucideIcon name={ICON[k]} /></Button>
        {/snippet}
      </OptionSelect>
    {:else if r.control === "select"}
      <OptionSelect name={nameOf(r.field)} field={r.field.id} legend={legend(r.field)} options={options(r.field)} value={current(r.field)} onchange={(v) => change(r.field, v)} />
    {:else}
      <OptionGroup name={nameOf(r.field)} field={r.field.id} legend={legend(r.field)} multiple={false} options={options(r.field)} selected={[current(r.field)]} onchange={(v) => change(r.field, v[0] ?? "")} />
    {/if}
    {#if r.field.id === "skin" && view === "sheet"}
      <Box class="ui8-theme-fields-palette">
        <Button variant={ctl.wide === "palette" ? "secondary" : "outline"} size="sm" class="ui8-theme-fields-palette-open" onclick={() => (ctl.wide = ctl.wide === "palette" ? null : "palette")} data-testid="palette-open"><LucideIcon name="palette" /><Text tag="span">{text.palette.open}</Text></Button>
      </Box>
    {/if}
    {#if r.field.id === "radius" && afterSite}{@render afterSite()}{/if}
  {/each}
</Stack>
