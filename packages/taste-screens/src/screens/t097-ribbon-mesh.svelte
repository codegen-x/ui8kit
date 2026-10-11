<!-- Ribbon of voices: a thin mesh band at the top, one centred quote as the headline, a row of named voices beneath. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Mesh v={2} class="mx-16 h-40 rounded" />
  <Stack gap="8" align="center" justify="center" class="flex-1 px-24 text-center">
    <Title as={1} weight="medium" class="max-w-5xl text-6xl leading-tight tracking-tight">“{c.title}”</Title>
    <Text class="text-muted-foreground">{c.brand} · {c.eyebrow}</Text>
    <Button>{c.cta}</Button>
  </Stack>
  <Grid cols="3" class="gap-8 px-16 pb-16">
    {#each c.items as it, i (it.title)}
      <Stack gap="2" align="center" class="text-center"><Box class="size-12 overflow-hidden rounded-full"><Mesh v={i + 3} class="h-full w-full" /></Box><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
    {/each}
  </Grid>
</Block>
