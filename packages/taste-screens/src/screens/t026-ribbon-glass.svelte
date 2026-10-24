<!-- Ribbon on glass: a dark glow field, the headline centred, and two rows of glass icon tiles beneath. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={1} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" mark="circle" />
  <Stack gap="8" align="center" class="relative px-16 pt-16 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Grid cols="6" class="relative mx-auto mt-auto mb-16 w-[960px] gap-4">
    {#each MARKS.slice(0, 12) as m (m)}
      <Box class="flex h-24 items-center justify-center rounded bg-background/40 text-foreground inset-ring inset-ring-foreground/10">
        <LucideIcon name={m} size={32} />
      </Box>
    {/each}
  </Grid>
</Block>
