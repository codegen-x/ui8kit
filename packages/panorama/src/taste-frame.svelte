<!--
  The frame of one taste screen: data-skin picks the skin, the inline variables set the radius and the font pairing.
  The screen inside is rendered at desktop size (1440×1080, see app.css) and only ever seen as a snapshot.
-->
<script lang="ts">
  import type { Component } from "svelte";
  import { Block } from "@codegen-x/svelte-compose";
  import { family } from "@ui8kit/taste-data/fonts";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import type { FontPair, Radius, SkinId } from "@ui8kit/taste-data/taste";

  let { screen: Screen, deck, skin, fonts, radius }: {
    screen: Component<{ c: Deck }>;
    deck: Deck;
    skin: SkinId;
    fonts: FontPair;
    radius: Radius;
  } = $props();

  const style = $derived(
    `--radius:${radius}px;--font-sans:${family(fonts.body)},sans-serif;--taste-heading:${family(fonts.display)},sans-serif`
  );
</script>

<Block class="taste-frame" data-skin={skin} {style}>
  <Screen c={deck} />
</Block>
