<!--
  One card of the feed: a 1440×1080 taste screen at 200×150 and up (the card grows with its row, 4:3; the shell is
  @ui8kit/layouts/magazine/taste-card, this file is its data: the snapshot cache, the live budget, the heart). Snapshot first: a cached snapshot is an <img>; a style the cache does
  not have yet is shown live (the real screen, CSS-scaled, only while the card is on screen and within the live budget) while the
  snapshot is rasterised in the background, then the <img> replaces it. Off screen, a card is just its skin's background.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import TasteCard from "@ui8kit/layouts/magazine/taste-card.svelte";
  import { deckAt } from "@ui8kit/taste-data/copy";
  import { encodePicks } from "@ui8kit/taste-data/picks";
  import type { Style } from "@ui8kit/taste-data/recommend";
  import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";
  import { TASTES } from "@ui8kit/taste-data/tastes";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import TasteFrame from "@ui8kit/panorama/taste-frame.svelte";
  import { hearted, toggleHeart } from "../lib/collections.svelte";
  import { liveSlots, lookup, make } from "../lib/shots";
  import Heart from "./heart.svelte";
  import { theme } from "../lib/theme.svelte";

  let { card, caption = "", why = "", compact = false, fill = false, dark: forceDark }: { card: Style; caption?: string; why?: string; compact?: boolean; /** in a grid cell (or a skin cell): the card takes the cell's width */ fill?: boolean; /** preview theme; the page theme when omitted */ dark?: boolean } = $props();

  let visible = $state(false);
  let url = $state("");
  let live = $state(false);
  const taste = $derived(TASTES.find((t) => t.id === card.screen)!);
  const fonts = $derived(card.fonts.display === card.fonts.body ? card.fonts.display : card.fonts.display + " + " + card.fonts.body);
  const text = $derived(caption || `${card.skin} · ${fonts} · r${card.radius}`);
  const label = $derived(`${card.screen}, ${card.skin}, ${card.fonts.display} ${card.fonts.body}, radius ${card.radius}`);

  // the frame reports when it is near the screen (taste-card, shot.ts); unmounted, the snapshot URL and the live slot are given back
  onMount(() => () => { if (url) URL.revokeObjectURL(url); if (live) liveSlots.release(); });

  // on screen (and again when the theme flips): the snapshot from the cache, else live now and a snapshot made in the background
  $effect(() => {
    const dark = forceDark ?? theme.dark;
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

<TasteCard href={"#/style/" + encodePicks([card.key])} {label} styleKey={card.key} skin={card.skin} fit={compact ? "mini" : fill ? "fill" : "strip"} caption={text} {why} shot={url} {live} onvisible={(v) => (visible = v)}>
  {#snippet stage()}<TasteFrame screen={SCREENS[card.screen]!} deck={deckAt(taste.deck)} skin={card.skin as SkinId} fonts={card.fonts as FontPair} radius={card.radius as Radius} />{/snippet}
  {#snippet heart()}<Heart on={hearted(card.key)} onclick={() => toggleHeart(card.key)} />{/snippet}
</TasteCard>
