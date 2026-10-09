<!-- Food hero: headline and actions at the start, a big round plate (rings) at the end with a floating review chip and a delivery chip; a ruled stats row at the foot. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" mark="circle" />
  <Grid cols="2" class="flex-1 items-center gap-8 px-16">
    <Stack gap="6">
      <Text size="sm" class="tracking-widest text-muted-foreground uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="max-w-md text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost"><LucideIcon name="play" size={16} />{c.secondary}</Button></Group>
    </Stack>
    <Box class="relative mx-auto aspect-square h-[480px]">
      <Rings v={1} class="h-full w-full overflow-hidden" />
      <Card class="absolute top-0 right-0 flex-row items-center gap-4 p-4 shadow-lg"><Avatars n={1} size={40} /><Stack gap="0"><Text size="sm" weight="semibold">{c.tags[0]}</Text><Text size="xs" class="text-muted-foreground">{c.note}</Text></Stack></Card>
      <Card class="absolute bottom-16 left-0 flex-row items-center gap-4 p-4 shadow-lg"><LucideIcon name="timer" size={32} class="text-primary" /><Stack gap="0"><Text weight="semibold">{c.tags[1]}</Text><Text size="sm" class="text-muted-foreground">{c.stats[0]!.value}</Text></Stack></Card>
    </Box>
  </Grid>
  <Grid cols="4" class="gap-0 px-16 pb-16">
    {#each c.stats as s, i (s.label)}
      <Stack gap="0" class={"px-8 " + (i ? "border-l border-border" : "pl-0")}><Text class="text-3xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text></Stack>
    {/each}
  </Grid>
</Block>
