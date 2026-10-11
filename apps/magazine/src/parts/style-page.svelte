<!-- #/style/<key>: the detail page comes in a later stage; for now the key and the tokens of the style. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import { parseStyleKey, type StyleKey } from "@ui8kit/taste-data/picks";

  let { key }: { key: StyleKey } = $props();
  const parts = $derived(parseStyleKey(key)!);
</script>

<main id="main-content" class="mg-main" data-testid="magazine-style">
  <p><a class="mg-link" href="#/">{ui.style.back}</a></p>
  <h1 class="mg-h1" data-testid="style-key">{key}</h1>
  <h2 class="mg-h2">{ui.style.tokens}</h2>
  <dl class="mg-tokens">
    <dt>screen</dt><dd>{parts.screen}</dd>
    <dt>skin</dt><dd>{parts.skin}</dd>
    <dt>display</dt><dd>{parts.fonts.display}</dd>
    <dt>body</dt><dd>{parts.fonts.body}</dd>
    <dt>radius</dt><dd>{parts.radius}px</dd>
  </dl>
  <p class="mg-note">{ui.style.later}</p>
</main>
