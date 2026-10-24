<!-- The per-element tokens of the Design system: radius, density and shadow of badge, button, card, alert and media (lib/design.ts),
     one radio group per element and token (native radios, the toggle buttons of the Filters sheet). Shared by the style page's
     Design system tab and the global Theme sheet (src/theme). -->
<script lang="ts">
  import { Stack, Title } from "@codegen-x/svelte-compose";
  import { RADII } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import { DENSITIES, DENSITY_ELEMENTS, ELEMENTS, SHADOW_ELEMENTS, SHADOWS, type Tokens } from "../lib/design";
  import FilterGroup from "../feed/filter-group.svelte";

  let { radius, tokenValues, ontoken, idp = "ds" }: { radius: number; tokenValues: Tokens; ontoken: (key: string, value: number | string | null) => void; /** name prefix: unique per use on a page */ idp?: string } = $props();
  const label = (e: string) => (ui.design.elements as Record<string, string>)[e] ?? e;
  const pos = (p: string) => (ui.design.positions as Record<string, string>)[p] ?? p;
  const OWN = "own";
  const radiusOptions = (e: string) => [{ value: OWN, label: e === "badge" ? ui.design.pill : `${ui.design.follow} (${radius} px)` }, ...RADII.map((r) => ({ value: String(r), label: r + " px" }))];
  const shadowOptions = [{ value: OWN, label: ui.design.follow }, ...SHADOWS.map((s) => ({ value: s, label: s }))];
  const densityOptions = DENSITIES.map((d) => ({ value: d, label: pos(d) }));
  const now = (key: string, fallback: string) => [String(tokenValues[key] ?? fallback)];
</script>

<Stack gap="0" class="ds-tokens" data-testid={idp + "-element-tokens"}>
  <Title as={3} class="mg-h3">{ui.design.elementRadius}</Title>
  {#each ELEMENTS as e (e)}
    <FilterGroup name={`${idp}-er-${e}`} legend={label(e)} multiple={false} options={radiusOptions(e)} selected={now("radius-" + e, OWN)} onchange={(v) => ontoken("radius-" + e, v[0] === OWN ? null : Number(v[0]))} />
  {/each}
  <Title as={3} class="mg-h3">{ui.design.elementDensity}</Title>
  {#each DENSITY_ELEMENTS as e (e)}
    <FilterGroup name={`${idp}-ed-${e}`} legend={label(e)} multiple={false} options={densityOptions} selected={now("density-" + e, "default")} onchange={(v) => ontoken("density-" + e, v[0]!)} />
  {/each}
  <Title as={3} class="mg-h3">{ui.design.elementShadow}</Title>
  {#each SHADOW_ELEMENTS as e (e)}
    <FilterGroup name={`${idp}-es-${e}`} legend={label(e)} multiple={false} options={shadowOptions} selected={now("shadow-" + e, OWN)} onchange={(v) => ontoken("shadow-" + e, v[0] === OWN ? null : v[0]!)} />
  {/each}
</Stack>
