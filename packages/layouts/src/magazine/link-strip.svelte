<!-- A named row of text links (navigation), wrapping on narrow screens. -->
<script lang="ts">
  import { Box, LinkPlain } from "@codegen-x/svelte-compose";

  let { label, links, ...rest }: { label: string; links: Array<{ id: string; href: string; label: string }>; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Box tag="nav" class="mb-6 flex flex-wrap gap-x-4 gap-y-2" aria-label={label} {...rest}>
  {#each links as l (l.id)}
    <LinkPlain href={l.href} class="text-sm leading-normal text-foreground underline-offset-4 hover:underline" data-testid="collection-link">{l.label}</LinkPlain>
  {/each}
</Box>
