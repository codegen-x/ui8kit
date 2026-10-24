<!-- Split 40/60: settings-like switches under the headline at the start, a big geometric plate at the end. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Label, Stack, Switch, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="5" class="flex-1 gap-16 px-16 pb-16">
    <Stack gap="8" justify="center" class="col-span-2">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Stack gap="4" align="stretch" class="rounded bg-muted p-6">
        {#each c.items as it, i (it.title)}
          <Group justify="between"><Label for={`sw-${i}`}>{it.title}</Label><Switch id={`sw-${i}`} checked={i !== 1} /></Group>
        {/each}
      </Stack>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Geometric v={7} cols={3} rows={3} class="col-span-3 rounded" />
  </Grid>
</Block>
