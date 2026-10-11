<!-- Poster on a coloured field: flat shapes fill the screen, the headline sits in a solid card at the centre. -->
<script lang="ts">
  import { Block, Button, Card, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Flat v={2} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" />
  <Stack align="center" justify="center" class="relative flex-1">
    <Card class="w-[720px] items-center gap-6 p-16 text-center shadow-lg">
      <Text size="sm" weight="semibold" class="tracking-widest text-primary uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Button size="lg">{c.cta}</Button>
    </Card>
  </Stack>
</Block>
