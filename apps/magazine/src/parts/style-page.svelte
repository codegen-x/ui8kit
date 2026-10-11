<!--
  #/style/<key>: one exact style, big. A desktop-width live preview (the real screen, CSS-scaled, no iframe), the series (the same
  skin, font and radius on one screen per layout family), the composition pattern, the tokens, the preset (a stub for `npx cgenx`)
  and the nearest related styles. The theme button is the page's theme: snapshots and the live preview follow it together.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import { deckAt } from "@ui8kit/taste-data/copy";
  import { COMPOSITION_OF } from "@ui8kit/taste-data/compositions";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import { parseStyleKey, encodePicks, styleKey, type StyleKey } from "@ui8kit/taste-data/picks";
  import { cliLine, presetOf } from "@ui8kit/taste-data/preset";
  import { relatedOf } from "@ui8kit/taste-data/recommend";
  import { seriesOf } from "@ui8kit/taste-data/series";
  import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";
  import { TASTES } from "@ui8kit/taste-data/tastes";
  import TasteFrame from "@ui8kit/panorama/taste-frame.svelte";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import ui from "../../content/ui.json";
  import { hearted, toggleHeart } from "../lib/collections.svelte";
  import DesignSystem from "./design-system.svelte";
  import { skinTokens } from "../lib/tokens";
  import type { StyleTab } from "../lib/state.svelte";
  import { TEMPLATES, type TemplateId } from "../templates/registry";
  import TemplateStage from "../templates/stage.svelte";
  import { theme } from "../lib/theme.svelte";
  import { effective } from "../lib/design";
  import Card from "./card.svelte";
  import Heart from "./heart.svelte";

  let { key, tab = "overview" }: { key: StyleKey; tab?: StyleTab } = $props();
  let tplId = $state<TemplateId>("classic");
  // the playground: a skin and a font chosen on the Design system tab. They are page state, not part of the key (the key is the style's
  // identity and changes only on "Save as collection item"); the preview, the templates and the specimen read the effective values.
  let ovSkin = $state<SkinId | null>(null);
  let ovFont = $state<FontId | null>(null);
  let ovRadius = $state<number | null>(null);
  let saved = $state(false);
  // the key a "Save as collection item" just opened: its page shows the Saved message (the key change below clears the other flags)
  let savedFor: string | null = null;
  const tpl = $derived(TEMPLATES.find((t) => t.id === tplId)!);
  const tabHref = (t: StyleTab) => "#/style/" + encodePicks([key]) + (t === "overview" ? "" : "/" + t);
  const tabLabels: Record<StyleTab, string> = { overview: ui.style.tabs.overview, templates: ui.style.tabs.templates, design: ui.style.tabs.design };
  function tplKey(e: KeyboardEvent): void {
    const i = TEMPLATES.findIndex((t) => t.id === tplId);
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TEMPLATES.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault();
    tplId = TEMPLATES[(n + TEMPLATES.length) % TEMPLATES.length]!.id;
    queueMicrotask(() => document.getElementById("tpl-tab-" + tplId)?.focus());
  }
  const parts = $derived(parseStyleKey(key));
  const taste = $derived(parts ? TASTES.find((t) => t.id === parts.screen) : undefined);
  const deck = $derived(taste ? deckAt(taste.deck) : undefined);
  const pattern = $derived(parts ? COMPOSITION_OF[parts.screen] : undefined);
  const series = $derived(seriesOf(key));
  const related = $derived(relatedOf(key));
  const eff = $derived(parts ? effective(parts, { skin: ovSkin, font: ovFont, radius: ovRadius }) : null);
  const skin = $derived((eff?.skin ?? "sky") as SkinId);
  const font = $derived((ovFont ?? parts?.fonts.body ?? "inter") as FontId);
  const fonts = $derived((eff?.fonts ?? { display: "inter", body: "inter" }) as FontPair);
  const radius = $derived(eff?.radius ?? 0);
  const changed = $derived(eff?.changed ?? false);
  const nextKey = $derived(eff?.key ?? key);
  const preset = $derived(presetOf(nextKey));
  const json = $derived(preset ? JSON.stringify(preset, null, 2) : "");
  const sameFont = $derived(parts ? parts.fonts.display === parts.fonts.body : true);

  let box = $state<HTMLElement | null>(null);
  let width = $state(960);
  let tokens = $state<{ light: ReturnType<typeof skinTokens>; dark: ReturnType<typeof skinTokens> }>({ light: [], dark: [] });
  let copied = $state<"" | "ok" | "fail">("");

  onMount(() => {
    const ro = new ResizeObserver(() => { width = box?.clientWidth || width; });
    if (box) ro.observe(box);
    return () => ro.disconnect();
  });
  // the tokens of this skin in both themes (read once the skin changes), and back to the top when another style opens
  $effect(() => { if (parts) tokens = { light: skinTokens(skin, false), dark: skinTokens(skin, true) }; });
  // `route` is a new object on every hash change (a tab switch too): a derived string only notifies when the key itself changes
  const sameKey = $derived(key);
  $effect(() => { void sameKey; window.scrollTo(0, 0); copied = ""; ovSkin = null; ovFont = null; ovRadius = null; saved = savedFor === sameKey; savedFor = null; });

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(json);
      copied = "ok";
    } catch {
      // no clipboard permission (an insecure page, a locked-down browser): the old way
      const ta = document.createElement("textarea");
      ta.value = json; ta.style.cssText = "position:fixed;left:-9999px"; document.body.appendChild(ta); ta.select();
      copied = document.execCommand("copy") ? "ok" : "fail";
      ta.remove();
    }
  }
  function reset(): void { ovSkin = null; ovFont = null; ovRadius = null; saved = false; copied = ""; }
  /** the changed style becomes a collection item under its own key; only now does the identity change */
  function save(): void {
    if (!parts) return;
    const k = nextKey;
    if (!hearted(k)) toggleHeart(k);
    saved = true;
    savedFor = k;
    if (k !== key) location.hash = "#/style/" + encodePicks([k]) + "/design";
  }
  const title = (p: NonNullable<typeof parts>) => `${p.screen} · ${p.skin} · ${p.fonts.display === p.fonts.body ? p.fonts.display : p.fonts.display + " + " + p.fonts.body} · r${p.radius}`;
  const famLabel = (f: string) => (ui.style.families as Record<string, string>)[f] ?? f;
  const patLabel = (f: string) => (ui.style.patterns as Record<string, string>)[f] ?? f;
</script>

<main id="main-content" class="mg-main" data-testid="magazine-style">
  <p class="mg-crumbs"><a class="mg-link" href="#/">{ui.style.back}</a></p>
  {#if !parts}
    <h1 class="mg-h1" data-testid="style-key">{ui.style.invalid}</h1>
  {:else}
    <div class="mg-titlebar">
      <h1 class="mg-h1" data-testid="style-title">{title(parts)}</h1>
      <span class="mg-spacer"></span>
      <Heart big on={hearted(key)} onclick={() => toggleHeart(key)} />
      <button class="mg-btn" type="button" aria-pressed={theme.dark} onclick={() => toggleTheme()} data-testid="style-theme">{ui.style.theme}: {theme.dark ? ui.style.dark : ui.style.light}</button>
    </div>
    <p class="mg-note" data-testid="style-key">{key}</p>

    <div class="mg-tabs" role="tablist" aria-label={ui.style.tabs.label} data-testid="style-tabs">
      {#each ["overview", "templates", "design"] as t (t)}
        <a class="mg-tab" role="tab" id={"style-tab-" + t} aria-selected={tab === t} aria-controls="style-panel" tabindex={tab === t ? 0 : -1} href={tabHref(t as StyleTab)} data-testid={"tab-" + t}>{tabLabels[t as StyleTab]}</a>
      {/each}
    </div>
    <div id="style-panel" role="tabpanel" aria-labelledby={"style-tab-" + tab}>
    {#if tab === "templates"}
      <section class="mg-sec" data-testid="style-templates">
        <h2 class="mg-h2">{ui.style.templates.heading}</h2>
        <p class="mg-note">{ui.style.templates.note}</p>
        <div class="mg-tpl-tabs" role="tablist" aria-label={ui.style.templates.label} data-testid="template-tabs">
          {#each TEMPLATES as t (t.id)}
            <button class="mg-tpl-tab" type="button" role="tab" id={"tpl-tab-" + t.id} aria-selected={tplId === t.id} tabindex={tplId === t.id ? 0 : -1} onclick={() => (tplId = t.id)} onkeydown={tplKey} data-testid={"tpl-" + t.id}>{t.label}</button>
          {/each}
        </div>
        <p class="mg-tpl-meta"><strong data-testid="tpl-name">{tpl.label}</strong><span class="mg-note">{tpl.note}</span><span class="mg-note" data-testid="tpl-landmarks">{ui.style.templates.landmarks}: {tpl.landmarks}</span></p>
        {#if deck}
          <TemplateStage template={tpl} c={deck} skin={skin} font={font} radius={radius} label={`${tpl.label}, ${skin}`} />
        {/if}
      </section>
    {:else if tab === "design"}
      <DesignSystem {skin} {font} {radius} own={{ skin: parts.skin, font: parts.fonts.body, radius: parts.radius }} {changed} {tokens} {json} {saved} {copied}
        onskin={(v) => { ovSkin = v; saved = false; copied = ""; }} onfont={(v) => { ovFont = v; saved = false; copied = ""; }} onradius={(v) => { ovRadius = v; saved = false; copied = ""; }} onreset={reset} onsave={save} oncopy={copy} />
    {:else}
    <section class="mg-sec" aria-label={ui.style.preview}>
      <div class="mg-big" bind:this={box} data-testid="style-preview" data-skin={skin} style:height={`${width * 0.75}px`}>
        {#if taste}
          <div class="mg-live" style:transform={`scale(${width / 1440})`} inert aria-hidden="true">
            <TasteFrame screen={SCREENS[parts.screen]!} deck={deckAt(taste.deck)} skin={skin} fonts={fonts} radius={radius as Radius} />
          </div>
        {/if}
      </div>
    </section>

    <section class="mg-sec" data-testid="style-series">
      <h2 class="mg-h2">{ui.style.series}</h2>
      <p class="mg-note">{ui.style.seriesNote}</p>
      <div class="mg-grid">
        {#each series as item (item.key)}
          <Card card={item} caption={famLabel(item.family)} />
        {/each}
      </div>
    </section>

    <section class="mg-sec" data-testid="style-composition">
      <h2 class="mg-h2">{ui.style.composition}</h2>
      {#if pattern}
        <p class="mg-pattern"><strong data-testid="pattern-label">{patLabel(pattern.primary)}</strong>{#if pattern.secondary} <span class="mg-note">· {ui.style.secondary} {patLabel(pattern.secondary)}</span>{/if}{#if pattern.weak} <span class="mg-note">· {ui.style.weak}</span>{/if}</p>
        <p class="mg-note">{pattern.note}</p>
      {:else}
        <p class="mg-note">{ui.style.none}</p>
      {/if}
    </section>

    <section class="mg-sec" data-testid="style-related">
      <h2 class="mg-h2">{ui.style.related}</h2>
      <div class="mg-grid">
        {#each related as c (c.key)}
          <Card card={c} />
        {/each}
      </div>
    </section>
    {/if}
    </div>
  {/if}
</main>
