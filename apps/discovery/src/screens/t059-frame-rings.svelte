<!-- Frame as a dial: a large round window holding rings and a figure, the headline and actions beside it. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <TopBar {c} layout="split" action="default" mark="circle" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative mx-auto size-[640px] overflow-hidden rounded-full bg-card p-8 shadow-lg">
      <Rings v={0} class="h-full w-full rounded-full" />
      <Stack gap="0" align="center" class="absolute inset-0 justify-center">
        <Text class="text-7xl font-bold text-background">{c.stats[1]!.value}</Text>
        <Text weight="semibold" class="text-background">{c.stats[1]!.label}</Text>
      </Stack>
    </Box>
  </Grid>
</Block>
