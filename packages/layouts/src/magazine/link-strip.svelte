<!-- A named row of text links (navigation), wrapping on narrow screens. -->
<script lang="ts">
  import { Box, LinkPlain } from "@codegen-x/svelte-compose";

  let { label, links, ...rest }: { label: string; links: Array<{ id: string; href: string; label: string }>; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Box tag="nav" class="ui8-link-strip" aria-label={label} {...rest}>
  {#each links as l (l.id)}
    <LinkPlain href={l.href} class="ui8-text-link" data-testid="collection-link">{l.label}</LinkPlain>
  {/each}
</Box>
