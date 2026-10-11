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
  import { family } from "@ui8kit/taste-data/fonts";
  import { parseStyleKey, encodePicks, type StyleKey } from "@ui8kit/taste-data/picks";
  import { cliLine, presetOf } from "@ui8kit/taste-data/preset";
  import { relatedOf } from "@ui8kit/taste-data/recommend";
  import { seriesOf } from "@ui8kit/taste-data/series";
  import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";
  import { TASTES } from "@ui8kit/taste-data/tastes";
  import TasteFrame from "@ui8kit/panorama/taste-frame.svelte";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import ui from "../../content/ui.json";
  import { skinTokens } from "../lib/tokens";
  import { theme } from "../lib/theme.svelte";
  import Card from "./card.svelte";

  let { key }: { key: StyleKey } = $props();
  const parts = $derived(parseStyleKey(key));
  const taste = $derived(parts ? TASTES.find((t) => t.id === parts.screen) : undefined);
  const pattern = $derived(parts ? COMPOSITION_OF[parts.screen] : undefined);
  const series = $derived(seriesOf(key));
  const related = $derived(relatedOf(key));
  const preset = $derived(presetOf(key));
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
  $effect(() => { if (parts) tokens = { light: skinTokens(parts.skin, false), dark: skinTokens(parts.skin, true) }; });
  $effect(() => { void key; window.scrollTo(0, 0); copied = ""; });

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
      <button class="mg-btn" type="button" aria-pressed={theme.dark} onclick={() => toggleTheme()} data-testid="style-theme">{ui.style.theme}: {theme.dark ? ui.style.dark : ui.style.light}</button>
    </div>
    <p class="mg-note" data-testid="style-key">{key}</p>

    <section class="mg-sec" aria-label={ui.style.preview}>
      <div class="mg-big" bind:this={box} data-testid="style-preview" data-skin={parts.skin} style:height={`${width * 0.75}px`}>
        {#if taste}
          <div class="mg-live" style:transform={`scale(${width / 1440})`} inert aria-hidden="true">
            <TasteFrame screen={SCREENS[parts.screen]!} deck={deckAt(taste.deck)} skin={parts.skin as SkinId} fonts={parts.fonts as FontPair} radius={parts.radius as Radius} />
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

    <section class="mg-sec" data-testid="style-tokens">
      <h2 class="mg-h2">{ui.style.tokens}</h2>
      <h3 class="mg-h3">{ui.style.skinTokens}: {parts.skin}</h3>
      {#each ([{ mode: "light", list: tokens.light }, { mode: "dark", list: tokens.dark }]) as { mode, list } (mode)}
        <div class="mg-swatches" data-mode={mode}>
          <span class="mg-swatch-mode">{mode === "light" ? ui.style.light : ui.style.dark}</span>
          {#each list as t (t.name)}
            <span class="mg-swatch" title={`--${t.name}: ${t.value}`}><span class="mg-chip" style:background={t.css}></span><span class="mg-swatch-name">{t.name}</span><code>{t.value}</code></span>
          {/each}
        </div>
      {/each}
      <h3 class="mg-h3">{ui.style.font}</h3>
      <p class="mg-specimen" style:font-family={`${family((parts.fonts as FontPair).body)}, sans-serif`} data-testid="style-font"><strong>{parts.fonts.body}</strong> <span>{ui.style.specimen}</span></p>
      {#if !sameFont}
        <p class="mg-specimen" style:font-family={`${family((parts.fonts as FontPair).display)}, sans-serif`}><span class="mg-note">{ui.style.headingFont}:</span> <strong>{parts.fonts.display}</strong> <span>{ui.style.specimen}</span></p>
      {/if}
      <h3 class="mg-h3">{ui.style.radius}</h3>
      <p class="mg-radius"><span class="mg-radius-box" style:border-radius={`${parts.radius}px`}></span> <code data-testid="style-radius">{parts.radius}px</code></p>
    </section>

    <section class="mg-sec" data-testid="style-preset">
      <h2 class="mg-h2">{ui.style.preset}</h2>
      <p><button class="mg-btn mg-btn-primary" type="button" onclick={copy} data-testid="copy-preset">{ui.style.copy}</button>
        <span class="mg-note" role="status" data-testid="copy-status">{copied === "ok" ? ui.style.copied : copied === "fail" ? ui.style.copyFailed : ""}</span></p>
      <pre class="mg-pre" data-testid="preset-json">{json}</pre>
      {#if preset}<p class="mg-note">{ui.style.cli}: <code>{cliLine(preset)}</code> <button class="mg-btn" type="button" disabled>{ui.style.cliLater}</button></p>{/if}
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
</main>
