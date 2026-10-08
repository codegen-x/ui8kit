<!-- Split, media first: a colour-wheel conic plate at the start, text with a checked list at the end. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" mark="circle" />
  <Grid cols="2" class="flex-1 items-center gap-24 px-16 pb-16">
    <Box class="aspect-square w-full overflow-hidden rounded"><Conic v={1} class="h-full w-full" /></Box>
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Stack gap="4">
        {#each c.items as it (it.title)}
          <Group gap="4"><LucideIcon name="circle-check" size={24} class="text-primary" /><Text><Text class="inline font-semibold">{it.title}</Text> {it.text}</Text></Group>
        {/each}
      </Stack>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
  </Grid>
</Block>
