<!-- Estate story: a compact header, a picture at the start beside an uppercase heading and two paragraphs, then a quiet strip of figures. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="outline" mark="none" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16">
    <Duotone v={2} alt={c.accent} class="h-96 w-full overflow-hidden rounded" />
    <Stack gap="6">
      <Title as={1} weight="bold" class="text-6xl tracking-tight uppercase">{c.accent}</Title>
      <Text class="text-muted-foreground">{c.lead}</Text>
      <Text class="text-muted-foreground">{c.items[0]!.text} {c.items[1]!.text} {c.items[2]!.text}</Text>
      <Button size="lg" variant="outline" class="self-start">{c.secondary}</Button>
    </Stack>
  </Grid>
  <Separator class="mx-16" />
  <Grid cols="4" class="gap-8 px-16 py-12">{#each c.stats as s (s.label)}<Stack gap="0"><Text class="text-5xl font-bold tracking-tight">{s.value}</Text><Text class="text-muted-foreground">{s.label}</Text></Stack>{/each}</Grid>
</Block>
