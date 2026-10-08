<!--
  A live view of one taste screen at desktop size (#/screen/<id>[/<slot>]): the screen in its own taste, or the variant of
  a panorama card. A tool for authoring; the panorama never shows live DOM.
-->
<script lang="ts">
  import { Block } from "@ui8kit/svelte-ui";
  import { deckAt } from "../copy";
  import { cards } from "../engine/grid";
  import { wall } from "../engine/wall";
  import { SCREENS } from "../screens";
  import { TASTES } from "../tastes";
  import TasteFrame from "./taste-frame.svelte";

  let { id, slot }: { id: string; slot?: number } = $props();

  const variant = $derived(slot !== undefined ? wall(cards(), TASTES)[slot] : undefined);
  const taste = $derived(TASTES.find((t) => t.id === (variant?.screen ?? id)) ?? TASTES[0]!);
  const screen = $derived(SCREENS[taste.id]!);
</script>

<Block tag="main" id="main-content">
  <TasteFrame
    {screen}
    deck={deckAt(taste.deck)}
    skin={variant?.skin ?? taste.skin}
    fonts={variant?.fonts ?? taste.fonts}
    radius={variant?.radius ?? taste.radius}
  />
</Block>
