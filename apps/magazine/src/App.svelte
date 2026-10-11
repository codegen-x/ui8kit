<!-- The magazine frame: a header (title, link to Discovery, theme), and either the empty state (the rotating sphere and a hint) or the views of the hash. -->
<script lang="ts">
  import { Block, NavActions } from "@ui8kit/svelte-ui";
  import { ui as shared } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import ui from "../content/ui.json";
  import { loadPicks, parseRoute } from "./lib/state.svelte";
  import Empty from "./parts/empty.svelte";
  import Home from "./parts/home.svelte";
  import StylePage from "./parts/style-page.svelte";

  const picks = loadPicks();
  let hash = $state(location.hash);
  const route = $derived(parseRoute(hash));
</script>

<svelte:window onhashchange={() => (hash = location.hash)} />

<Block class="mg-root">
  <header class="mg-header">
    <a class="mg-title" href="#/">{ui.title}</a>
    <span class="mg-spacer"></span>
    <a class="mg-link" href="/discovery/?cards=recommend">{ui.nav.discovery}</a>
    <NavActions actions="none" themeLabel={shared.theme.toggle} ontheme={() => toggleTheme()} />
  </header>
  {#if picks.length === 0}
    <Empty />
  {:else if route.name === "style"}
    <StylePage key={route.key} />
  {:else}
    <Home {picks} />
  {/if}
</Block>
