<!-- Rental feature: a picture plate at the start beside a text column with a check list, and three stat cards under it with the middle one filled. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
  const icons = ["users", "truck", "globe"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 py-8">
    <Geometric v={1} cols={5} rows={4} class="h-full w-full overflow-hidden rounded" />
    <Stack gap="6">
      <Text size="xs" weight="semibold" class="tracking-widest uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-6xl leading-tight tracking-tight">{c.title}</Title>
      <Text class="text-muted-foreground">{c.lead}</Text>
      <Stack gap="2">{#each c.items.slice(0, 3) as it (it.title)}<Group gap="2"><LucideIcon name="circle-check" size={16} class="text-primary" /><Text size="sm">{it.title}</Text></Group>{/each}</Stack>
      <Button size="lg" variant="secondary" class="self-start">{c.secondary}<LucideIcon name="arrow-right" size={16} /></Button>
    </Stack>
  </Grid>
  <Grid cols="3" class="gap-8 px-16 pb-16">
    {#each c.stats.slice(0, 3) as s, i (s.label)}
      <Card class={"flex-row items-center gap-6 p-6 " + (i === 1 ? "bg-primary text-primary-foreground inset-ring-primary" : "")}>
        <LucideIcon name={icons[i]!} size={32} />
        <Stack gap="0"><Text class="text-4xl font-bold tracking-tight">{s.value}</Text><Text size="sm" class={i === 1 ? "" : "text-muted-foreground"}>{s.label}</Text></Stack>
      </Card>
    {/each}
  </Grid>
</Block>
