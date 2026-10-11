<!-- The magazine frame: a header (title, link to Discovery, the ball, theme), the sphere (one canvas, see parts/sphere.svelte) and the views of the hash. -->
<script lang="ts">
  import { Block, NavActions } from "@ui8kit/svelte-ui";
  import { ui as shared } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import ui from "../content/ui.json";
  import { resetAll } from "./lib/collections.svelte";
  import { ctl, loadPicks, mag, parseRoute } from "./lib/state.svelte";
  import Collection from "./parts/collection.svelte";
  import Packs from "./parts/packs.svelte";
  import Presets from "./parts/presets.svelte";
  import Home from "./parts/home.svelte";
  import Sphere from "./parts/sphere.svelte";
  import StylePage from "./parts/style-page.svelte";

  const first = loadPicks();
  mag.picks = first.picks;
  mag.phase = first.picks.length === 0 ? "empty" : first.source === "url" ? "flying" : "ball";
  let hash = $state(location.hash);
  const route = $derived(parseRoute(hash));
  let asking = $state(false);
  function reset(): void { resetAll(); asking = false; location.assign(location.pathname); }
</script>

<svelte:window onhashchange={() => (hash = location.hash)} />

<Block class="mg-root">
  <header class="mg-header" data-phase={mag.phase}>
    <a class="mg-title" href="#/">{ui.title}</a>
    <span class="mg-spacer"></span>
    {#if mag.phase !== "empty"}
      <nav class="mg-nav" aria-label="Magazine">
        <a class="mg-link" href="#/packs" data-testid="nav-packs">{ui.nav.packs}</a>
        <a class="mg-link" href="#/presets" data-testid="nav-presets">{ui.nav.presets}</a>
        {#if asking}
          <span class="mg-reset" role="group" aria-label={ui.nav.resetAsk}>{ui.nav.resetAsk}
            <button class="mg-btn" type="button" onclick={reset} data-testid="reset-yes">{ui.nav.resetYes}</button>
            <button class="mg-btn" type="button" onclick={() => (asking = false)} data-testid="reset-no">{ui.nav.resetNo}</button>
          </span>
        {:else}
          <button class="mg-btn" type="button" onclick={() => (asking = true)} data-testid="reset">{ui.nav.reset}</button>
        {/if}
      </nav>
    {/if}
    <a class="mg-link" href="/discovery/?cards=recommend">{ui.nav.discovery}</a>
    {#if mag.phase !== "empty"}
      <button class="mg-ball" type="button" aria-label={ui.ball.label} data-testid="ball" data-active={mag.phase === "ball" ? "1" : "0"} disabled={mag.phase !== "ball"} onclick={() => ctl.expand()}></button>
    {/if}
    <NavActions actions="none" themeLabel={shared.theme.toggle} ontheme={() => toggleTheme()} />
  </header>
  <Sphere arrive={first.source === "url"} />
  {#if mag.picks.length === 0}
    <div class="mg-hint" data-testid="magazine-empty">
      <p>{ui.empty.hint}</p>
      <a class="mg-link" href="/discovery/?cards=recommend">{ui.empty.link}</a>
    </div>
  {:else if route.name === "style"}
    <StylePage key={route.key} />
  {:else if route.name === "collection"}
    <Collection id={route.id} />
  {:else if route.name === "packs"}
    <Packs />
  {:else if route.name === "presets"}
    <Presets />
  {:else}
    <Home picks={mag.picks} />
  {/if}
</Block>
