<!-- Editorial feature: a giant chapter number and headline at the start, a pull quote between rules, a geometric column at the end. -->
<script lang="ts">
  import { Block, Grid, Inline, Separator, Stack, Text, Title, Button } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="ghost" mark="bar" />
  <Grid cols="12" class="flex-1 gap-8 px-16 pb-16">
    <Stack gap="6" justify="end" class="col-span-7">
      <Inline class="text-[200px] leading-none font-black text-primary">{c.stats[0]!.value}</Inline>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Separator />
      <Text size="2xl" class="italic">{c.accent}</Text>
      <Separator />
      <Grid cols="2" class="gap-8"><Text class="text-muted-foreground">{c.lead}</Text><Text class="text-muted-foreground">{c.items[1]!.text}</Text></Grid>
      <Button class="self-start">{c.cta}</Button>
    </Stack>
    <Geometric v={5} cols={2} rows={4} class="col-span-5 rounded" />
  </Grid>
</Block>
