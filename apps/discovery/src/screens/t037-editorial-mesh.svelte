<!-- Editorial front page: a centred masthead headline, a wide mesh plate, and three columns of short copy under it. -->
<script lang="ts">
  import { Block, Grid, Separator, Stack, Text, Title, Button } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="outline" mark="none" />
  <Stack gap="8" align="stretch" class="flex-1 px-16 pb-16">
    <Separator />
    <Title as={1} weight="bold" class="text-center text-8xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg" class="mx-auto max-w-3xl text-center text-muted-foreground">{c.lead}</Text>
    <Mesh v={2} class="flex-1 rounded" />
    <Grid cols="4" class="gap-8">
      {#each c.items as it (it.title)}
        <Stack gap="2"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
      {/each}
      <Button class="self-center justify-self-end">{c.cta}</Button>
    </Grid>
  </Stack>
</Block>
