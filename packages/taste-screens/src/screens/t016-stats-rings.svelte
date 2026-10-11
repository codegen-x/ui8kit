<!-- Stats: a centred headline over three tall stat cards, each with a rings plate on top and the figure below. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <TopBar {c} layout="split" action="outline" mark="circle" />
  <Stack gap="6" align="center" class="px-16 pt-12 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-6xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button>{c.cta}</Button><Button variant="outline">{c.secondary}</Button></Group>
  </Stack>
  <Grid cols="3" class="flex-1 gap-8 px-24 py-16">
    {#each c.stats as s, i (s.label)}
      <Card class="gap-0 overflow-hidden p-0">
        <Rings v={i + 1} class="h-56" />
        <Stack gap="2" class="p-8">
          <Text class="text-6xl font-bold tracking-tight">{s.value}</Text>
          <Text class="text-muted-foreground">{s.label}</Text>
        </Stack>
      </Card>
    {/each}
  </Grid>
</Block>
