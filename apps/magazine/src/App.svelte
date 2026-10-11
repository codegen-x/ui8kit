<!-- The magazine frame: a header (title, link to Discovery, the ball, theme), the sphere (one canvas, see parts/sphere.svelte) and the views of the hash. -->
<script lang="ts">
  import { Block, NavActions } from "@ui8kit/svelte-ui";
  import { ui as shared } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import ui from "../content/ui.json";
  import { ctl, loadPicks, mag, parseRoute } from "./lib/state.svelte";
  import Home from "./parts/home.svelte";
  import Sphere from "./parts/sphere.svelte";
  import StylePage from "./parts/style-page.svelte";

  const first = loadPicks();
  mag.picks = first.picks;
  mag.phase = first.picks.length === 0 ? "empty" : first.source === "url" ? "flying" : "ball";
  let hash = $state(location.hash);
  const route = $derived(parseRoute(hash));
</script>

<svelte:window onhashchange={() => (hash = location.hash)} />

<Block class="mg-root">
  <header class="mg-header" data-phase={mag.phase}>
    <a class="mg-title" href="#/">{ui.title}</a>
    <span class="mg-spacer"></span>
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
  {:else}
    <Home picks={mag.picks} />
  {/if}
</Block>
