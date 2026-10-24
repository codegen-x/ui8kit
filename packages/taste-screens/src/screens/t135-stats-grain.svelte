<!-- Estate figures: a two by two block of big figures at the start beside a tall grain picture with a floating label card at the end. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" mark="bar" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Stack gap="8" justify="center">
      <Title as={1} weight="bold" class="max-w-lg text-5xl leading-tight tracking-tight uppercase">{c.title}</Title>
      <Grid cols="2" class="gap-8">{#each c.stats as s (s.label)}<Stack gap="0"><Text class="text-6xl font-bold tracking-tight">{s.value}</Text><Text class="text-muted-foreground">{s.label}</Text></Stack>{/each}</Grid>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Box class="relative overflow-hidden rounded"><Grain v={2} class="absolute inset-0" /><Card class="absolute bottom-8 left-8 w-72 gap-0 p-4 shadow-lg"><Text weight="semibold">{c.items[3]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[3]!.text}</Text></Card></Box>
  </Grid>
</Block>
