<!-- Frame, three columns: copy at the start, a tall phone frame with a mesh screen in the middle, feature notes at the end. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, IconBadge, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { GLYPHS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Grid cols="3" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Card class="mx-auto h-[760px] w-[380px] gap-0 overflow-hidden rounded-[48px] bg-foreground p-3 shadow-lg">
      <Box class="relative flex-1 overflow-hidden rounded-[38px]">
        <Mesh v={4} class="absolute inset-0" />
        <Stack gap="2" class="absolute inset-x-6 bottom-8 text-background"><Text class="text-5xl font-bold text-background">{c.stats[0]!.value}</Text><Text class="text-background/80">{c.stats[0]!.label}</Text></Stack>
      </Box>
    </Card>
    <Stack gap="8">
      {#each c.items as it, i (it.title)}<Stack gap="2"><IconBadge icon={GLYPHS[i + 3]!} /><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>{/each}
    </Stack>
  </Grid>
</Block>
