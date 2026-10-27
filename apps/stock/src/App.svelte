<!-- Stock: the router (lib/route.ts) over the storefront, the detail page of an asset and the bare frame document the detail page's
     device frame loads. The frame is decided once, at load: a link clicked inside a live preview never turns it into another page. -->
<script lang="ts">
  import Detail from "./Detail.svelte";
  import Frame from "./Frame.svelte";
  import Storefront from "./Storefront.svelte";
  import { writeLocale } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import { parseRoute, type Route } from "./lib/route";
  import { applyState } from "./lib/theme";
  import { stock } from "./lib/theme-ctl.svelte";

  const first = parseRoute(location.hash);
  let route = $state<Route>(first);

  $effect(() => {
    if (first.kind === "frame") return;
    const sync = (): void => {
      const next = parseRoute(location.hash);
      if (next.kind !== route.kind || (next.kind === "asset" && route.kind === "asset" && next.id !== route.id)) window.scrollTo({ top: 0 });
      route = next;
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  });
  $effect(() => { if (first.kind !== "frame") { document.documentElement.lang = visit.locale; writeLocale(visit.locale); } });
  $effect(() => { if (first.kind !== "frame") applyState(stock.state); });
</script>

{#if first.kind === "frame"}
  <Frame id={first.id} />
{:else if route.kind === "asset"}
  {#key route.id}<Detail id={route.id} full={route.full} />{/key}
{:else if route.kind === "search"}
  <Storefront query={route.query} />
{/if}
