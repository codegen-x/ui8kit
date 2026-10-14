<!-- One card of the "same structure" section and the button that applies its skin (first in the tune's skins). -->
<script lang="ts">
  import { Button, Stack } from "@ui8kit/svelte-ui";
  import type { SkinId } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import type { FeedCard } from "../lib/feed";
  import { applyTune, tuning } from "../lib/tune.svelte";
  import Card from "../parts/card.svelte";

  let { card, current }: { card: FeedCard; current: boolean } = $props();
  function apply(): void {
    const t = tuning.tune!;
    applyTune({ ...t, skins: [card.skin as SkinId, ...t.skins.filter((s) => s !== card.skin)].slice(0, 3) });
  }
</script>

<Stack gap="2" class="mg-skin-cell">
  <Card {card} caption={card.skin} />
  <Button variant={current ? "secondary" : "outline"} size="sm" disabled={current} onclick={apply} data-testid="apply-skin" data-skin={card.skin}>{current ? ui.feed.applied : ui.feed.applySkin}</Button>
</Stack>
