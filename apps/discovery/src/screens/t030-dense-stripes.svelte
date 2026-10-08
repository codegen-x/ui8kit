<!-- Dense grid: a wide stripes tile with the headline beside it, then the kit FeatureCards in four tiles below. -->
<script lang="ts">
  import { Block, Button, FeatureCards, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { features } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
  const four = $derived([...features(c), { ...features(c, 5)[0]!, id: "feature-extra" }]);
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Stack gap="8" align="stretch" class="flex-1 px-16 pb-16">
    <Grid cols="3" class="flex-1 gap-8">
      <Stack gap="6" justify="end" class="pb-4">
        <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
        <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
        <Button size="lg" class="self-start">{c.cta}</Button>
      </Stack>
      <Stripes v={3} class="col-span-2 rounded" />
    </Grid>
    <FeatureCards features={four} cols="1-4" item="card" />
  </Stack>
</Block>
