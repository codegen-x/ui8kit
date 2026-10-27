<!-- The frame of a preview: 16:10, the 1280 px wide stage scaled into it (the scale is a CSS variable the frame measures), mounted
     only once the frame is near the viewport and unmounted with the card. The stage is decorative for assistive tech (aria-hidden,
     inert): the card names what it shows. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, Skeleton } from "@codegen-x/svelte-compose";
  import { STAGE_WIDTH, observeFrame } from "./scale";

  let { id, children }: { id: string; children: Snippet } = $props();
  let near = $state(false);
  $effect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    return observeFrame(el, STAGE_WIDTH, () => (near = true));
  });
</script>

<Box {id} class="relative aspect-16/10 w-full overflow-hidden bg-background" data-testid="preview-frame">
  {#if near}
    <Box class="ui8-preview-stage" aria-hidden="true" inert data-testid="preview-stage">{@render children()}</Box>
  {:else}
    <Skeleton class="absolute inset-0 h-full" aria-hidden="true" />
  {/if}
</Box>
