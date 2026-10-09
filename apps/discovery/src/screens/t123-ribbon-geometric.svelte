<!-- Store ribbon: a centred headline with a search field, a ribbon of category chips with icons, and a wide tile of shapes. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Input, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
  const icons = ["heart", "tag", "house", "sparkles"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="default" />
  <Stack gap="6" align="center" class="px-16 pt-8 text-center">
    <Title as={1} weight="bold" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="lg" class="max-w-xl text-muted-foreground">{c.lead}</Text>
    <Group gap="2" class="w-full max-w-xl"><Input size="lg" placeholder={c.input} /><Button size="lg">{c.cta}</Button></Group>
    <Group gap="4">
      {#each c.tags as t, i (t)}
        <Button variant={i === 0 ? "default" : "outline"}><LucideIcon name={icons[i]!} size={16} />{t}</Button>
      {/each}
    </Group>
  </Stack>
  <Box class="relative mx-16 mt-8 flex-1 overflow-hidden rounded">
    <Geometric v={3} cols={6} rows={3} class="absolute inset-0" />
    <Grid cols="4" class="absolute inset-x-8 bottom-8 gap-4">
      {#each c.items as it (it.title)}
        <Card class="gap-0 p-4"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Card>
      {/each}
    </Grid>
  </Box>
  <Box class="h-8" />
</Block>
