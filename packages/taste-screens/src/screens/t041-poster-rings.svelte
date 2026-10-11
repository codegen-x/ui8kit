<!-- Poster in a dial: a rings field centred behind the headline, a badge above, actions below, three notes at the foot. -->
<script lang="ts">
  import { Badge, Block, Button, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Rings v={0} class="absolute inset-0 opacity-50" />
  <TopBar {c} layout="split" action="outline" mark="circle" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Badge size="lg">{c.eyebrow}</Badge>
    <Title as={1} weight="bold" class="max-w-4xl text-8xl leading-none tracking-tight">{c.title}</Title>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Grid cols="3" class="relative gap-8 px-32 pb-16 text-center">
    {#each c.items as it (it.title)}
      <Stack gap="2" align="center"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
    {/each}
  </Grid>
</Block>
