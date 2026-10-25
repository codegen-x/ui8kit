<!-- Every field of the global theme (lib/global-theme.ts FIELDS) as one control: mode, skin, font, default radius, and radius,
     density and shadow per element. Both panels of the Theme sheet render it (view "sheet": compact selects; view "design": radio
     groups), so both cover every field; values come from the controller (lib/global-theme.svelte.ts) and go back through it. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Stack, Title } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { DENSITIES, densityOf, fieldValue, setDensity, viewFields, type Field, type FieldGroup, type ThemeView } from "../lib/global-theme";
  import type { Density } from "../lib/design";
  import { currentMode, gtheme, setField, setTheme } from "../lib/global-theme.svelte";
  import FilterGroup from "../feed/filter-group.svelte";
  import FilterSelect from "../feed/filter-select.svelte";

  let { idp, view, afterSite }: { /** name prefix: unique per use on a page */ idp: string; view: ThemeView; /** shown after the site fields */ afterSite?: Snippet } = $props();
  const T = ui.theme;
  const D = ui.design;
  const t = $derived(gtheme.value);
  const rows = $derived(viewFields(view));
  const SHORT: Record<FieldGroup, string> = { site: "", radius: "er", density: "ed", shadow: "es" };
  const HEADING: Record<FieldGroup, string> = { site: "", radius: D.elementRadius, density: D.elementDensity, shadow: D.elementShadow };
  const nameOf = (f: Field) => (f.group === "site" ? `${idp}-${f.id}` : `${idp}-${SHORT[f.group]}-${f.element}`);
  const legend = (f: Field) => (f.group === "site" ? (T as Record<string, unknown>)[f.id] as string : (D.elements as Record<string, string>)[f.element!] ?? f.element!);
  const pos = (p: string) => (D.positions as Record<string, string>)[p] ?? p;
  const unsetLabel = (f: Field) => (f.group === "site" ? T.default : f.id === "radius-badge" ? D.pill : f.group === "radius" ? `${D.follow} (${t.radius ?? 8} px)` : D.follow);
  const valueLabel = (f: Field, v: string | number) => (f.id === "mode" ? (v === "dark" ? T.dark : T.light) : typeof v === "number" ? `${v} px` : f.group === "density" ? pos(v) : v);
  const options = (f: Field) => [...(f.nullable ? [{ value: "", label: unsetLabel(f) }] : []), ...f.values.map((v) => ({ value: String(v), label: valueLabel(f, v) }))];
  const current = (f: Field) => { const v = fieldValue({ mode: currentMode(), theme: t }, f.id); return v === null ? "" : String(v); };
  const change = (f: Field, raw: string) => setField(f.id, raw === "" ? null : f.values.find((v) => String(v) === raw) ?? null);
  const density = $derived(densityOf(t.tokens));
  const starts = (i: number) => rows[i]!.field.group !== "site" && rows[i]!.field.group !== rows[i - 1]?.field.group;
</script>

<Stack gap="0" class="mg-tfields" data-testid={idp + "-fields"} data-view={view}>
  {#each rows as r, i (r.field.id)}
    {#if starts(i)}
      <Title as={3} class="mg-h3">{HEADING[r.field.group]}</Title>
      {#if r.field.group === "density"}
        <FilterGroup name={idp + "-density"} field="density-all" legend={T.densityAll} multiple={false} options={DENSITIES.map((d) => ({ value: d, label: pos(d) }))} selected={density ? [density] : []} onchange={(v) => setTheme({ tokens: setDensity(t.tokens, v[0] as Density) })} />
      {/if}
    {/if}
    {#if r.control === "select"}
      <FilterSelect name={nameOf(r.field)} field={r.field.id} legend={legend(r.field)} options={options(r.field)} value={current(r.field)} onchange={(v) => change(r.field, v)} />
    {:else}
      <FilterGroup name={nameOf(r.field)} field={r.field.id} legend={legend(r.field)} multiple={false} options={options(r.field)} selected={[current(r.field)]} onchange={(v) => change(r.field, v[0] ?? "")} />
    {/if}
    {#if r.field.id === "radius" && afterSite}{@render afterSite()}{/if}
  {/each}
</Stack>
