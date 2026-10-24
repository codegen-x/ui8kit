<!-- Dense tiers: the headline row, then three plan-like cards, each headed by a grain plate, with a list and an action. -->
<script lang="ts">
  import { Block, Button, Card, Grid, LucideIcon, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Stack gap="4" align="center" class="px-16 pt-4 pb-8 text-center">
    <Title as={1} weight="bold" class="text-6xl tracking-tight">{c.title}</Title>
    <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
  </Stack>
  <Grid cols="3" class="flex-1 gap-6 px-24 pb-16">
    {#each c.stats as s, i (s.label)}
      <Card class={"gap-0 overflow-hidden p-0 " + (i === 1 ? "inset-ring-2 inset-ring-primary" : "")}>
        <Grain v={i} class="h-40" />
        <Stack gap="4" align="stretch" class="flex-1 p-6">
          <Text weight="semibold">{c.tags[i]}</Text>
          <Text class="text-5xl font-bold">{s.value}</Text>
          {#each c.items as it (it.title)}<Group gap="2"><LucideIcon name="check" size={16} class="text-primary" /><Text size="sm">{it.title}</Text></Group>{/each}
          <Button variant={i === 1 ? "default" : "outline"} class="mt-auto">{c.cta}</Button>
        </Stack>
      </Card>
    {/each}
  </Grid>
</Block>
