<!-- Food stats: copy and an order action at the start, a dotted field with a plate disc and a tag card at the end, a ruled four-figure row under both. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Input, LucideIcon, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" mark="bar" />
  <Grid cols="2" class="flex-1 gap-8 px-16">
    <Stack gap="6" justify="center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="2" class="max-w-lg"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
      <Group gap="2"><LucideIcon name="timer" size={16} class="text-primary" /><Text size="sm" class="text-muted-foreground">{c.note}</Text></Group>
    </Stack>
    <Box class="relative">
      <Dots v={3} class="absolute inset-0 rounded" />
      <Box class="absolute top-1/2 left-1/2 aspect-square h-96 -translate-x-1/2 -translate-y-1/2 bg-card shadow-lg inset-ring-2 inset-ring-border" style="border-radius:50%" />
      <Card class="absolute right-8 bottom-8 w-64 gap-0 p-4 shadow-lg"><Text size="sm" weight="semibold">{c.tags[0]} · {c.tags[1]}</Text><Text size="xs" class="text-muted-foreground">{c.items[0]!.text}</Text></Card>
    </Box>
  </Grid>
  <Grid cols="4" class="gap-0 px-16 py-12">
    {#each c.stats as s, i (s.label)}
      <Stack gap="2" class={"px-8 " + (i ? "border-l border-border" : "pl-0")}><Text class="text-4xl font-bold tracking-tight">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text></Stack>
    {/each}
  </Grid>
</Block>
