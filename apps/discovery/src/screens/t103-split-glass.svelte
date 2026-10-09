<!-- Split: copy at the start; at the end a glow field with a stack of frosted notice cards, slightly offset. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, IconBadge, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { GLYPHS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Stack gap="8" justify="center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost">{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative overflow-hidden rounded">
      <Glass v={4} class="absolute inset-0" />
      <Stack gap="4" align="stretch" justify="center" class="absolute inset-0 px-16">
        {#each c.items as it, i (it.title)}
          <Group gap="4" class={"rounded bg-background/60 p-4 shadow-lg backdrop-blur-xl " + ["mr-16", "ml-8 mr-8", "ml-16"][i]}>
            <IconBadge icon={GLYPHS[i + 6]!} /><Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
          </Group>
        {/each}
      </Stack>
    </Box>
  </Grid>
</Block>
