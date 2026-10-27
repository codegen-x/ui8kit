<!--
  Design system tab: a playground for one predefined design. The specimen (tokens, type scale, radii, spacing, buttons, badges, cards,
  alerts, inputs) is one live frame whose skin, single font and radius are CSS variables, so the SKIN and FONT controls re-skin it, the
  style preview and the templates at once with no rebuild. The style's identity key stays as it is until "Save as collection item".
  Every control edits the global theme (lib/global-theme.svelte.ts, the same model as the Theme sheet): mode, skin, font, radius and
  the per-element tokens, with the same export/import (@ui8kit/layouts/theme/theme-io.svelte).
-->
<script lang="ts">
  import { family, FONT_IDS, type FontId } from "@ui8kit/taste-data/fonts";
  import { SKIN_IDS, RADII, type SkinId } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import type { Tokens } from "@ui8kit/theme-model/design";
  import DsElementTokens from "./ds-element-tokens.svelte";
  import DsSpecimen from "@ui8kit/layouts/theme/ds-specimen.svelte";
  import FilterGroup from "../feed/filter-group.svelte";
  import { currentMode, setMode, themeCtl } from "../lib/global-theme.svelte";
  import ThemeIo from "@ui8kit/layouts/theme/theme-io.svelte";
  import type { Token } from "@ui8kit/theme-model/tokens";

  type Props = {
    skin: SkinId;
    font: FontId;
    radius: number;
    own: { skin: string; font: string; radius: number };
    changed: boolean;
    tokens: { light: Token[]; dark: Token[] };
    /** the per-element overrides (only changed keys) */
    tokenValues: Tokens;
    json: string;
    saved: boolean;
    copied: "" | "ok" | "fail";
    onskin: (s: SkinId) => void;
    onfont: (f: FontId) => void;
    onradius: (r: number) => void;
    ontoken: (key: string, value: number | string | null) => void;
    onreset: () => void;
    onsave: () => void;
    oncopy: () => void;
  };
  let { skin, font, radius, own, changed, tokens, tokenValues, json, saved, copied, onskin, onfont, onradius, ontoken, onreset, onsave, oncopy }: Props = $props();

</script>

<div data-testid="style-design">
  <section class="mg-sec" aria-labelledby="ds-controls" data-testid="ds-controls">
    <h2 class="mg-h2" id="ds-controls">{ui.design.controls}</h2>
    <p class="mg-note">{ui.design.note}</p>

    <FilterGroup name="ds-mode" field="mode" legend={ui.theme.mode} multiple={false} options={[{ value: "light", label: ui.theme.light }, { value: "dark", label: ui.theme.dark }]} selected={[currentMode()]} onchange={(v) => setMode(v[0] === "dark" ? "dark" : "light")} />

    <h3 class="mg-h3" id="ds-skin-label">{ui.design.skin}: <span data-testid="ds-skin-now">{skin}</span></h3>
    <div class="mg-choices" role="radiogroup" aria-labelledby="ds-skin-label" data-testid="ds-skins" data-field="skin">
      {#each SKIN_IDS as s (s)}
        <button class="mg-choice" type="button" role="radio" aria-checked={skin === s} onclick={() => onskin(s)} data-testid={"ds-skin-" + s} data-skin-choice={s}>
          <span class="mg-choice-dot" data-skin={s} aria-hidden="true"></span>{s}{#if s === own.skin}<span class="mg-choice-own"> · {ui.design.own}</span>{/if}
        </button>
      {/each}
    </div>

    <h3 class="mg-h3" id="ds-font-label">{ui.design.font}: <span data-testid="ds-font-now">{font}</span></h3>
    <div class="mg-choices" role="radiogroup" aria-labelledby="ds-font-label" data-testid="ds-fonts" data-field="font">
      {#each FONT_IDS as f (f)}
        <button class="mg-choice" type="button" role="radio" aria-checked={font === f} onclick={() => onfont(f)} style:font-family={`${family(f)}, sans-serif`} data-testid={"ds-font-" + f}>
          {f}{#if f === own.font}<span class="mg-choice-own"> · {ui.design.own}</span>{/if}
        </button>
      {/each}
    </div>

    <h3 class="mg-h3" id="ds-radius-label">{ui.design.radius}: <span data-testid="ds-radius-now">{radius}px</span></h3>
    <div class="mg-choices" role="radiogroup" aria-labelledby="ds-radius-label" data-testid="ds-radii" data-field="radius">
      {#each RADII as r (r)}
        <button class="mg-choice mg-tile" type="button" role="radio" aria-checked={radius === r} onclick={() => onradius(r)} data-testid={"ds-radius-" + r} data-default={r === own.radius ? "1" : "0"} aria-label={`${r}px${r === own.radius ? ", " + ui.design.own : ""}`}>
          <span class="mg-tile-box" style:border-radius={`${r}px`} aria-hidden="true"></span>
          <span>{r}px{#if r === own.radius}<span class="mg-tile-own"> · {ui.design.own}</span>{/if}</span>
        </button>
      {/each}
    </div>

    <DsElementTokens {radius} {tokenValues} {ontoken} />

    <p class="mg-actions">
      <button class="mg-btn" type="button" onclick={onreset} disabled={!changed} data-testid="ds-reset">{ui.design.reset}</button>
      <button class="mg-btn mg-btn-primary" type="button" onclick={onsave} data-testid="ds-save">{ui.design.save}</button>
      <button class="mg-btn" type="button" onclick={oncopy} data-testid="ds-copy">{ui.design.copy}</button>
      <span class="mg-note" role="status" data-testid="ds-status">{saved ? ui.design.saved : copied === "ok" ? ui.style.copied : copied === "fail" ? ui.style.copyFailed : changed ? ui.design.changed : ui.design.unchanged}</span>
    </p>
    <pre class="mg-pre" data-testid="ds-json">{json}</pre>
    <ThemeIo ctl={themeCtl} text={ui.theme.io} idp="ds" />
  </section>

  <section class="mg-sec" aria-labelledby="ds-specimen">
    <h2 class="mg-h2" id="ds-specimen">{ui.design.specimen}</h2>
    <DsSpecimen text={ui.design} modes={ui.style} {skin} {font} {radius} {tokens} {tokenValues} />
  </section>
</div>
