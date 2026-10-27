<!-- A marketplace insert between feed sections: a banner for another category (an eyebrow, a heading, a line and the link). -->
<script lang="ts">
  import { Block, Button, Text, Title } from "@codegen-x/svelte-compose";

  let { eyebrow, title, body, cta, href, ...rest }: { eyebrow: string; title: string; body: string; cta: string; href: string; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Block tag="aside" class="ui8-feed-insert" aria-label={eyebrow} {...rest}>
  <Text class="ui8-eyebrow">{eyebrow}</Text>
  <Title as={2} size="base">{title}</Title>
  <Text class="ui8-feed-insert-body">{body}</Text>
  <Button variant="secondary" {href}>{cta}</Button>
</Block>
