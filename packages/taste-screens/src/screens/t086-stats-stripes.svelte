<!-- Stats in columns: three tall columns, each a giant figure standing on its own striped bar plate. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" />
  <Group justify="between" align="end" class="px-16 pt-8">
    <Title as={1} weight="bold" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Stack gap="4" class="max-w-sm"><Text class="text-muted-foreground">{c.lead}</Text><Button class="self-start">{c.cta}</Button></Stack>
  </Group>
  <Grid cols="3" class="flex-1 gap-8 p-16">
    {#each c.stats as s, i (s.label)}
      <Stack gap="4" align="stretch" justify="end">
        <Text class="text-8xl font-bold tracking-tight">{s.value}</Text>
        <Text class="text-muted-foreground">{s.label}</Text>
        <Stripes v={i === 1 ? 3 : i * 4 + 1} class={"rounded " + ["h-52", "h-80", "h-64"][i]} />
      </Stack>
    {/each}
  </Grid>
</Block>
