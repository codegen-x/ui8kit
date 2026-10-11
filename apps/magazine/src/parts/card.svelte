<!--
  One card of the feed: a 1440×1080 taste screen at 240×180. Snapshot first: a cached snapshot is an <img>; a style the cache does
  not have yet is shown live (the real screen, CSS-scaled, only while the card is on screen and within the live budget) while the
  snapshot is rasterised in the background, then the <img> replaces it. Off screen, a card is just its skin's background.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { deckAt } from "@ui8kit/taste-data/copy";
  import { encodePicks } from "@ui8kit/taste-data/picks";
  import type { Card } from "@ui8kit/taste-data/recommend";
  import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";
  import { TASTES } from "@ui8kit/taste-data/tastes";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import TasteFrame from "@ui8kit/panorama/taste-frame.svelte";
  import { liveSlots, lookup, make } from "../lib/shots";
  import { theme } from "../lib/theme.svelte";

  let { card, caption = "" }: { card: Card; caption?: string } = $props();

  let host: HTMLElement;
  let visible = $state(false);
  let url = $state("");
  let live = $state(false);
  const taste = $derived(TASTES.find((t) => t.id === card.screen)!);

  onMount(() => {
    const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }, { rootMargin: "400px 0px" });
    io.observe(host);
    return () => { io.disconnect(); if (url) URL.revokeObjectURL(url); if (live) liveSlots.release(); };
  });

  // on screen (and again when the theme flips): the snapshot from the cache, else live now and a snapshot made in the background
  $effect(() => {
    const dark = theme.dark;
    if (!visible) { if (live) { liveSlots.release(); live = false; } return; }
    let gone = false;
    (async () => {
      const lk = await lookup(card, dark);
      if (gone) return;
      if (lk.blob) { setBlob(lk.blob); return; }
      if (!live && liveSlots.acquire()) live = true;
      const blob = await make(lk, card, dark, () => !gone);
      if (gone || !blob) return;
      setBlob(blob);
      if (live) { liveSlots.release(); live = false; }
    })();
    return () => { gone = true; };
  });

  function setBlob(b: Blob): void {
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(b);
  }
</script>

<a class="mg-card" href={"#/style/" + encodePicks([card.key])} data-testid="card" data-key={card.key} data-live={live ? "1" : "0"} data-shot={url ? "1" : "0"} aria-label={`${card.screen}, ${card.skin}, ${card.fonts.display} ${card.fonts.body}, radius ${card.radius}`}>
  <span class="mg-shot" bind:this={host} data-skin={card.skin}>
    {#if url}
      <img src={url} alt="" width="240" height="180" draggable="false" />
    {:else if live}
      <span class="mg-live" inert aria-hidden="true"><TasteFrame screen={SCREENS[card.screen]!} deck={deckAt(taste.deck)} skin={card.skin as SkinId} fonts={card.fonts as FontPair} radius={card.radius as Radius} /></span>
    {/if}
  </span>
  <span class="mg-caption">{caption || `${card.skin} · ${card.fonts.display === card.fonts.body ? card.fonts.display : card.fonts.display + " + " + card.fonts.body} · r${card.radius}`}</span>
</a>
