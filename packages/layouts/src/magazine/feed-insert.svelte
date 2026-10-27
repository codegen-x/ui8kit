<!-- A marketplace insert between feed sections: a banner for another category (an eyebrow, a heading, a line and the link). -->
<script lang="ts">
  import { Block, Button, Text, Title } from "@codegen-x/svelte-compose";

  let { eyebrow, title, body, cta, href, ...rest }: { eyebrow: string; title: string; body: string; cta: string; href: string; [key: `data-${string}`]: string | number | undefined } = $props();
</script>

<Block tag="aside" class="mb-8 flex flex-col items-start gap-2 rounded bg-muted p-6 text-foreground" aria-label={eyebrow} {...rest}>
  <Text class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{eyebrow}</Text>
  <Title as={2} size="base">{title}</Title>
  <Text class="text-sm text-muted-foreground">{body}</Text>
  <Button variant="secondary" {href}>{cta}</Button>
</Block>
