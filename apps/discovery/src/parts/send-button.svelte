<!-- The Send button of the corner: shown only while at least one card is picked; sends the picked screens and clears them. -->
<script lang="ts">
  import { Button } from "@ui8kit/svelte-ui";
  import ui from "../../content/ui.json";
  import { picks } from "../picks.svelte";
</script>

{#if picks.count > 0}
  <Button size="sm" variant="default" data-testid="discovery-send" onclick={() => picks.send?.()}>{ui.send.label}</Button>
{/if}
