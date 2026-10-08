<!-- Editorial contents page: a numbered table of contents at the start, a conic plate and the headline at the end. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Inline, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Conic from "../recipes/conic.svelte";

  let { c }: { c: Deck } = $props();
  const entries = $derived([...c.items.map((i) => i.title), ...c.nav]);
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="ghost" mark="none" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Stack gap="4" align="stretch" justify="center">
      <Text size="sm" class="tracking-widest uppercase">{c.eyebrow}</Text>
      {#each entries as e, i (i)}
        <Group justify="between" class="py-2"><Group gap="8"><Inline class="w-12 text-3xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</Inline><Text size="2xl" weight="medium">{e}</Text></Group><Inline class="text-muted-foreground">{(i + 1) * 8}</Inline></Group>
        <Separator />
      {/each}
    </Stack>
    <Stack gap="8" align="stretch">
      <Conic v={3} class="flex-1 rounded" />
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Group justify="between"><Text class="max-w-sm text-muted-foreground">{c.lead}</Text><Button>{c.cta}</Button></Group>
    </Stack>
  </Grid>
</Block>
