<!-- Ribbon as a column: the headline and actions on a dot field at the start, a vertical stack of icon slots at the end. -->
<script lang="ts">
  import { Block, Button, Grid, Group, IconBadge, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import { MARKS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Dots v={2} class="absolute inset-0" />
  <TopBar {c} layout="split" action="outline" />
  <Grid cols="3" class="relative flex-1 items-center gap-16 px-16">
    <Stack gap="8" class="col-span-2">
      <Title as={1} weight="bold" class="text-8xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Stack gap="4" align="stretch" class="rounded bg-card p-8 inset-ring inset-ring-border">
      <Text size="sm" weight="semibold" class="text-muted-foreground">{c.note}</Text>
      {#each MARKS.slice(8, 13) as m, i (m)}
        <Group gap="4"><IconBadge variant={i === 0 ? "primary" : "secondary"}><LucideIcon name={m} size={20} /></IconBadge><Text weight="semibold">{c.tags[i % c.tags.length]}</Text></Group>
      {/each}
    </Stack>
  </Grid>
</Block>
