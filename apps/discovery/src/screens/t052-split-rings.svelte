<!-- Split, media first: a rings plate at the start; at the end the headline and three feature cards stacked. -->
<script lang="ts">
  import { Block, Button, Card, Grid, LucideIcon, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { GLYPHS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="secondary" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Rings v={3} class="h-full rounded" />
    <Stack gap="6" justify="center">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      {#each c.items as it, i (it.title)}
        <Card variant="compact" class="flex-row items-center gap-4">
          <LucideIcon name={GLYPHS[i + 4]!} size={24} class="text-primary" />
          <Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
        </Card>
      {/each}
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="link">{c.secondary}</Button></Group>
    </Stack>
  </Grid>
</Block>
