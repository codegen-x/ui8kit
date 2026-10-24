<!--
  ?cards=recommend, the corner: the counter n/10, a Clear link while something is picked, and the Recommendations button, which
  exists only at exactly MIN_PICKS (10) picked styles. It is a plain same-origin link to /magazine/?picks=<exact style keys>;
  nothing is sent to the preview server. The click also stores the picks (magazine:v1:picks + mirrors), so the hop survives a blocked URL.
-->
<script lang="ts">
  import { Button, Inline } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { MIN_PICKS, magazineUrl } from "@ui8kit/taste-data/picks";
  import { writeStore } from "@ui8kit/taste-data/picks-store";
  import { picks } from "../picks.svelte";
</script>

<Inline class="text-sm text-muted-foreground" role="status" aria-label={ui.recommend.counter} data-testid="discovery-counter">{picks.count}/{MIN_PICKS}</Inline>
{#if picks.count > 0}
  <Button size="sm" variant="link" data-testid="discovery-clear" onclick={() => picks.clear?.()}>{ui.recommend.clear}</Button>
{/if}
{#if picks.count === MIN_PICKS}
  <Button size="sm" variant="default" href={magazineUrl(picks.keys)} onclick={() => writeStore(picks.keys)} data-testid="discovery-recommend">{ui.recommend.label}</Button>
{/if}
