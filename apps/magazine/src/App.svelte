<!-- The magazine frame: a header (title, link to Discovery, the ball, theme), the sphere (one canvas, see parts/sphere.svelte) and the views of the hash. -->
<script lang="ts">
  import { Block, Button } from "@ui8kit/svelte-ui";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import ui from "../content/ui.json";
  import { resetAll } from "./lib/collections.svelte";
  import { ctl, loadPicks, mag, parseRoute, writePicksToUrl } from "./lib/state.svelte";
  import Collection from "./parts/collection.svelte";
  import Packs from "./parts/packs.svelte";
  import Search from "./parts/search.svelte";
  import Presets from "./parts/presets.svelte";
  import Home from "./parts/home.svelte";
  import Feed from "./feed/feed.svelte";
  import FilterSheet from "./feed/filter-sheet.svelte";
  import { startTune, tuning } from "./lib/tune.svelte";
  import { rootAttrs, rootStyle } from "./lib/global-theme";
  import { gtheme } from "./lib/global-theme.svelte";
  import ThemeSheet from "./theme/theme-sheet.svelte";
  import Sphere from "./parts/sphere.svelte";
  import StylePage from "./parts/style-page.svelte";

  const first = loadPicks();
  mag.picks = first.picks;
  if (first.picks.length) startTune(first.picks); // the tune of the feed: derived from the picks, overridden by the address
  if (first.picks.length > 0 && first.source !== "url") writePicksToUrl(first.picks); // opened without ?picks=: the address becomes shareable (replaceState, hash kept)
  mag.phase = first.picks.length === 0 ? "empty" : first.source === "url" ? "flying" : "ball";
  let hash = $state(location.hash);
  const route = $derived(parseRoute(hash));
  let asking = $state(false);
  function reset(): void { resetAll(); asking = false; location.assign(location.pathname); }
</script>

<svelte:window onhashchange={() => (hash = location.hash)} />

<!-- the global theme (lib/global-theme.ts) sits on the root: skin, radius, font and tokens for the whole site; styles override it -->
<Block class="mg-root" style={rootStyle(gtheme.value, (f) => family(f as FontId))} {...rootAttrs(gtheme.value)} data-testid="magazine-root">
  <header class="mg-header" data-phase={mag.phase}>
    <a class="mg-title" href="#/">{ui.title}</a>
    <span class="mg-spacer"></span>
    {#if mag.phase !== "empty"}
      <nav class="mg-nav" aria-label="Magazine">
        <a class="mg-link" href="#/search" data-testid="nav-search">{ui.nav.search}</a>
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
    {#if mag.picks.length > 0 && route.name === "home"}
      <Button size="sm" onclick={() => (tuning.sheet = true)} data-testid="filters">{ui.feed.filters}</Button>
    {/if}
    <a class="mg-link" href="/discovery/?cards=recommend">{ui.nav.discovery}</a>
    {#if mag.phase !== "empty"}
      <button class="mg-ball" type="button" aria-label={ui.ball.label} data-testid="ball" data-active={mag.phase === "ball" ? "1" : "0"} disabled={mag.phase !== "ball"} onclick={() => ctl.expand()}></button>
    {/if}
    <Button size="sm" variant="outline" onclick={() => (gtheme.open = true)} data-testid="theme-open">{ui.theme.button}</Button>
  </header>
  <Sphere arrive={first.source === "url"} />
  {#if mag.picks.length === 0}
    <div class="mg-hint" data-testid="magazine-empty">
      <p>{ui.empty.hint}</p>
      <a class="mg-link" href="/discovery/?cards=recommend">{ui.empty.link}</a>
    </div>
  {:else if route.name === "style"}
    <StylePage key={route.key} tab={route.tab} />
  {:else if route.name === "collection"}
    <Collection id={route.id} />
  {:else if route.name === "search"}
    <Search hash={hash} picks={mag.picks} />
  {:else if route.name === "packs"}
    <Packs />
  {:else if route.name === "presets"}
    <Presets />
  {:else if route.name === "rows"}
    <Home picks={mag.picks} />
  {:else}
    <Feed picks={mag.picks} />
    <FilterSheet picks={mag.picks} />
  {/if}
  <ThemeSheet />
</Block>
