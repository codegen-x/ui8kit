<!--
  Design system tab: a playground for one predefined design. The specimen (tokens, type scale, radii, spacing, buttons, badges, cards,
  alerts, inputs) is one live frame whose skin, single font and radius are CSS variables, so the SKIN and FONT controls re-skin it, the
  style preview and the templates at once with no rebuild. The style's identity key stays as it is until "Save as collection item".
-->
<script lang="ts">
  import { Alert, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@ui8kit/svelte-ui";
  import { family, FONT_IDS, type FontId } from "@ui8kit/taste-data/fonts";
  import { SKIN_IDS, RADII, type SkinId } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import type { Token } from "../lib/tokens";

  type Props = {
    skin: SkinId;
    font: FontId;
    radius: number;
    own: { skin: string; font: string };
    changed: boolean;
    tokens: { light: Token[]; dark: Token[] };
    json: string;
    saved: boolean;
    copied: "" | "ok" | "fail";
    onskin: (s: SkinId) => void;
    onfont: (f: FontId) => void;
    onreset: () => void;
    onsave: () => void;
    oncopy: () => void;
  };
  let { skin, font, radius, own, changed, tokens, json, saved, copied, onskin, onfont, onreset, onsave, oncopy }: Props = $props();

  const style = $derived(`--radius:${radius}px;--font-sans:${family(font)},sans-serif;--taste-heading:${family(font)},sans-serif`);
  // the type scale: sizes in px, line heights on the 8px grid
  const SCALE = [
    { name: "Display", size: 48, line: 56, weight: 700 },
    { name: "Heading 1", size: 32, line: 40, weight: 700 },
    { name: "Heading 2", size: 24, line: 32, weight: 600 },
    { name: "Heading 3", size: 20, line: 24, weight: 600 },
    { name: "Body", size: 16, line: 24, weight: 400 },
    { name: "Small", size: 14, line: 24, weight: 400 },
    { name: "Caption", size: 12, line: 16, weight: 400 },
  ];
  const SPACING = [8, 16, 24, 32, 48, 64];
</script>

<div data-testid="style-design">
  <section class="mg-sec" aria-labelledby="ds-controls">
    <h2 class="mg-h2" id="ds-controls">{ui.design.controls}</h2>
    <p class="mg-note">{ui.design.note}</p>

    <h3 class="mg-h3" id="ds-skin-label">{ui.design.skin}: <span data-testid="ds-skin-now">{skin}</span></h3>
    <div class="mg-choices" role="radiogroup" aria-labelledby="ds-skin-label" data-testid="ds-skins">
      {#each SKIN_IDS as s (s)}
        <button class="mg-choice" type="button" role="radio" aria-checked={skin === s} onclick={() => onskin(s)} data-testid={"ds-skin-" + s} data-skin-choice={s}>
          <span class="mg-choice-dot" data-skin={s} aria-hidden="true"></span>{s}{#if s === own.skin}<span class="mg-choice-own"> · {ui.design.own}</span>{/if}
        </button>
      {/each}
    </div>

    <h3 class="mg-h3" id="ds-font-label">{ui.design.font}: <span data-testid="ds-font-now">{font}</span></h3>
    <div class="mg-choices" role="radiogroup" aria-labelledby="ds-font-label" data-testid="ds-fonts">
      {#each FONT_IDS as f (f)}
        <button class="mg-choice" type="button" role="radio" aria-checked={font === f} onclick={() => onfont(f)} style:font-family={`${family(f)}, sans-serif`} data-testid={"ds-font-" + f}>
          {f}{#if f === own.font}<span class="mg-choice-own"> · {ui.design.own}</span>{/if}
        </button>
      {/each}
    </div>

    <p class="mg-actions">
      <button class="mg-btn" type="button" onclick={onreset} disabled={!changed} data-testid="ds-reset">{ui.design.reset}</button>
      <button class="mg-btn mg-btn-primary" type="button" onclick={onsave} data-testid="ds-save">{ui.design.save}</button>
      <button class="mg-btn" type="button" onclick={oncopy} data-testid="ds-copy">{ui.design.copy}</button>
      <span class="mg-note" role="status" data-testid="ds-status">{saved ? ui.design.saved : copied === "ok" ? ui.style.copied : copied === "fail" ? ui.style.copyFailed : changed ? ui.design.changed : ui.design.unchanged}</span>
    </p>
    <pre class="mg-pre" data-testid="ds-json">{json}</pre>
  </section>

  <section class="mg-sec" aria-labelledby="ds-specimen">
    <h2 class="mg-h2" id="ds-specimen">{ui.design.specimen}</h2>
    <div class="ds-box" data-testid="ds-specimen">
      <div class="ds-frame" data-skin={skin} {style}>
        <div class="ds-block">
          <h3 class="ds-h">{ui.design.tokens}</h3>
          {#each ([{ mode: "light", list: tokens.light }, { mode: "dark", list: tokens.dark }]) as { mode, list } (mode)}
            <div class="ds-swatches" data-mode={mode}>
              <span class="ds-label">{mode === "light" ? ui.style.light : ui.style.dark}</span>
              {#each list as t (t.name)}
                <span class="ds-swatch" title={`--${t.name}: ${t.value}`}><span class="ds-chip" style:background={t.css}></span><span>{t.name}</span><code>{t.value}</code></span>
              {/each}
            </div>
          {/each}
        </div>

        <div class="ds-block">
          <h3 class="ds-h">{ui.design.type}</h3>
          {#each SCALE as r (r.name)}
            <div class="ds-type"><span class="ds-label">{r.name} · {r.size}/{r.line}</span><span style:font-size={`${r.size}px`} style:line-height={`${r.line}px`} style:font-weight={r.weight}>{ui.design.sample}</span></div>
          {/each}
        </div>

        <div class="ds-block ds-two">
          <div>
            <h3 class="ds-h">{ui.design.radii}</h3>
            <div class="ds-row">
              {#each RADII as r (r)}
                <span class="ds-radius"><span class="ds-radius-box" class:ds-on={r === radius} style:border-radius={`${r}px`}></span><span class="ds-label">{r}px{r === radius ? " · " + ui.design.current : ""}</span></span>
              {/each}
            </div>
          </div>
          <div>
            <h3 class="ds-h">{ui.design.spacing}</h3>
            <div class="ds-row ds-bars">
              {#each SPACING as n (n)}<span class="ds-space"><span class="ds-bar" style:width={`${n}px`}></span><span class="ds-label">{n}</span></span>{/each}
            </div>
          </div>
        </div>

        <div class="ds-block">
          <h3 class="ds-h">{ui.design.buttons}</h3>
          <div class="ds-row">
            <Button>{ui.design.primary}</Button>
            <Button variant="secondary">{ui.design.secondary}</Button>
            <Button variant="outline">{ui.design.outline}</Button>
            <Button variant="ghost">{ui.design.ghost}</Button>
            <Button variant="destructive" class="ds-danger">{ui.design.destructive}</Button>
            <Button size="sm">{ui.design.small}</Button>
            <Button size="lg">{ui.design.large}</Button>
            <Button disabled>{ui.design.disabled}</Button>
          </div>
          <h3 class="ds-h">{ui.design.badges}</h3>
          <div class="ds-row">
            <Badge>{ui.design.primary}</Badge><Badge variant="secondary">{ui.design.secondary}</Badge><Badge variant="outline">{ui.design.outline}</Badge><Badge variant="destructive" class="ds-danger">{ui.design.destructive}</Badge>
          </div>
        </div>

        <div class="ds-block ds-two">
          <Card>
            <CardHeader><CardTitle>{ui.design.cardTitle}</CardTitle><CardDescription>{ui.design.cardText}</CardDescription></CardHeader>
            <CardContent><div class="ds-row"><Button size="sm">{ui.design.primary}</Button><Button size="sm" variant="outline">{ui.design.outline}</Button></div></CardContent>
          </Card>
          <div class="ds-stack">
            <Alert>{ui.design.alertInfo}</Alert>
            <Alert variant="success">{ui.design.alertOk}</Alert>
            <Alert variant="warning">{ui.design.alertWarn}</Alert>
            <Alert variant="destructive" role="alert" class="ds-danger">{ui.design.alertError}</Alert>
          </div>
        </div>

        <div class="ds-block">
          <h3 class="ds-h">{ui.design.inputs}</h3>
          <div class="ds-form">
            <div class="ds-field"><Label for="ds-name">{ui.design.fieldName}</Label><Input id="ds-name" placeholder={ui.design.placeholder} /></div>
            <div class="ds-field"><Label for="ds-mail">{ui.design.fieldMail}</Label><Input id="ds-mail" type="email" placeholder="name@example.com" /></div>
            <div class="ds-field"><Label for="ds-off">{ui.design.fieldOff}</Label><Input id="ds-off" disabled placeholder={ui.design.disabled} /></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
