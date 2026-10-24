<!-- Split, media first: a flat shape composition on the start half; the headline and a checklist on the end half. -->
<script lang="ts">
  import { Block, Button, Grid, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="default" mark="bar" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Flat v={3} class="rounded" />
    <Stack gap="8" justify="center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Stack gap="4">{#each c.items as it (it.title)}<Group gap="4" align="start"><LucideIcon name="circle-check" size={24} class="text-primary" /><Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack></Group>{/each}</Stack>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
  </Grid>
</Block>
