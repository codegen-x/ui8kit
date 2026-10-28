<!-- The frame of a preview: 16:10, the 1280 px wide stage scaled into it (the scale is a CSS variable the frame measures), mounted
     only once the frame is near the viewport and unmounted with the card. The stage is decorative for assistive tech (aria-hidden,
     inert): the card names what it shows. Until the render shows (not near yet, or its data still loading: the stage then holds
     only an element marked data-preview-pending), a wireframe skeleton of the same 16:10 box stands in: a bar, a headline, a row
     of three tiles (styles/layouts.css hides it once the stage has anything else). -->
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

<Box {id} class="ui8-preview-frame relative aspect-16/10 w-full overflow-hidden bg-background" data-testid="preview-frame">
  <Box class="ui8-preview-skeleton absolute inset-0 flex flex-col gap-2 p-4" aria-hidden="true" data-testid="preview-skeleton">
    <Skeleton class="h-2 w-1/4" />
    <Skeleton class="mx-auto mt-4 h-4 w-1/2" />
    <Skeleton class="mx-auto h-2 w-1/3" />
    <Box class="mt-auto grid h-2/5 grid-cols-3 gap-2">
      <Skeleton class="h-full" /><Skeleton class="h-full" /><Skeleton class="h-full" />
    </Box>
  </Box>
  {#if near}
    <Box class="ui8-preview-stage" aria-hidden="true" inert data-testid="preview-stage">{@render children()}</Box>
  {/if}
</Box>
