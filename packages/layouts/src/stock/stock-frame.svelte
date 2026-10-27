<!-- The frame of the Stock storefront: not a Block (a plain wrapper), so the header, the filter bar, the facet column and the results
     are sibling landmarks, never nested in one another. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box } from "@codegen-x/svelte-compose";

  let { header, bar, aside, main, overlay }: { header: Snippet; bar: Snippet; aside: Snippet; main: Snippet; overlay?: Snippet } = $props();
</script>

<Box class="min-h-screen bg-background text-foreground" data-testid="stock-frame">
  {@render header()}
  {@render bar()}
  <Box class="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-8 px-4 pb-16 lg:grid-cols-12">
    {@render aside()}
    {@render main()}
  </Box>
  {@render overlay?.()}
</Box>
