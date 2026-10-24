<!-- Editorial spread: the start page is a full duotone picture; the end page has a byline, headline, a drop-cap paragraph. -->
<script lang="ts">
  import { Block, Button, Grid, Inline, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="grid h-full grid-cols-2">
  <Duotone v={7} alt={c.title} class="h-full" />
  <Stack gap="8" justify="center" class="px-20">
    <Text size="sm" class="tracking-widest uppercase">{c.brand} · {c.eyebrow}</Text>
    <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg"><Inline class="float-left mr-2 text-7xl leading-none font-bold text-primary">{c.lead.slice(0, 1)}</Inline>{c.lead.slice(1)} {c.items[0]!.text} {c.items[1]!.text}</Text>
    <Text class="text-muted-foreground">{c.accent}</Text>
    <Button variant="outline" class="self-start">{c.cta}</Button>
  </Stack>
</Block>
