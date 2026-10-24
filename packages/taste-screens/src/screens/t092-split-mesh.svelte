<!-- Split, bleeding media: a mesh field covers the start half to the screen edge; the end half has copy and an email form. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Input, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="grid h-full grid-cols-2">
  <Mesh v={6} class="h-full" />
  <Stack gap="0" align="stretch">
    <TopBar {c} layout="split" action="ghost" />
    <Stack gap="8" justify="center" class="flex-1 px-16">
      <Text size="sm" weight="semibold" class="text-primary">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="2"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
      <Grid cols="3" class="gap-4 pt-8">{#each c.stats as s (s.label)}<Stack gap="0"><Text class="text-3xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text></Stack>{/each}</Grid>
    </Stack>
  </Stack>
</Block>
