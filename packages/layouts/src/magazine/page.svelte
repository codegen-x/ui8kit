<!-- A page of the Magazine below its fixed header: the main landmark (the skip target #main-content), centred up to 1760 px. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Block } from "@codegen-x/svelte-compose";

  let { children, ...rest }: { children: Snippet; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Block tag="main" id="main-content" class="mx-auto max-w-440 px-4 pt-20 pb-8 md:px-6 md:pb-12" {...rest}>{@render children()}</Block>
