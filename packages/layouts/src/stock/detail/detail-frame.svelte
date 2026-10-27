<!-- The frame of the detail page of an asset: not a Block (a plain wrapper), so the header and the main content are sibling landmarks. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box } from "@codegen-x/svelte-compose";

  let { header, main, overlay }: { header: Snippet; main: Snippet; overlay?: Snippet } = $props();
</script>

<Box class="ui8-detail-frame" data-stock-chrome data-testid="detail-frame">
  {@render header()}
  {@render main()}
  {@render overlay?.()}
</Box>
