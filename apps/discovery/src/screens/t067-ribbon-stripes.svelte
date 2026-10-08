<!-- Ribbon: a diagonal stripes band at the top, the centred headline, the kit LogoRibbon in a ruled row at the foot. -->
<script lang="ts">
  import { Block, Button, Group, LogoRibbon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { logos } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <Stripes v={0} class="h-16" />
  <TopBar {c} layout="split" action="outline" />
  <Stack gap="8" align="center" justify="center" class="flex-1 px-16 text-center">
    <Text size="sm" weight="semibold" class="tracking-widest text-primary uppercase">{c.eyebrow}</Text>
    <Title as={1} weight="bold" class="max-w-5xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button></Group>
  </Stack>
  <LogoRibbon id="ribbon" title={c.note} logos={logos(c, 6, 9)} density="roomy" />
</Block>
