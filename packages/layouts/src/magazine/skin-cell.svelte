<!-- One cell of a "same structure" strip: a card (the children) and the button under it that applies the card's skin. The button
     wears that skin's colours (data-skin) but the corner of the chrome: data-chrome-corner is where the app gives it back. The cell
     grows from 240 px up to 480 px in its strip. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Button, Stack } from "@codegen-x/svelte-compose";

  let { skin, current, applyLabel, appliedLabel, onapply, children }: {
    skin: string; /** this skin leads the tune already: the button says so and is disabled */ current: boolean;
    applyLabel: string; appliedLabel: string; onapply: () => void; children: Snippet;
  } = $props();
</script>

<Stack gap="2" class="ui8-skin-cell">
  {@render children()}
  <Button variant={current ? "secondary" : "outline"} size="sm" disabled={current} onclick={onapply} data-testid="apply-skin" data-skin={skin} data-chrome-corner>{current ? appliedLabel : applyLabel}</Button>
</Stack>
