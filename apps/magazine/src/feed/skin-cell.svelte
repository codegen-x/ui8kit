<!-- One card of the "same structure" section and the button that applies its skin (first in the tune's skins); the cell is
     @ui8kit/layouts/magazine/skin-cell. -->
<script lang="ts">
  import SkinCell from "@ui8kit/layouts/magazine/skin-cell.svelte";
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

<SkinCell skin={card.skin} {current} applyLabel={ui.feed.applySkin} appliedLabel={ui.feed.applied} onapply={apply}>
  <Card {card} caption={card.skin} fill />
</SkinCell>
