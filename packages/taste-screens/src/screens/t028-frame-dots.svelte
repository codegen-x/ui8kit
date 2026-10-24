<!-- Frame: a phone-shaped card standing at the end with a dot field and a list inside; text at the start. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <TopBar {c} layout="split" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-24">
    <Stack gap="8">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost">{c.secondary}</Button></Group>
    </Stack>
    <Card class="mx-auto h-[760px] w-[380px] gap-0 overflow-hidden p-4 shadow-lg">
      <Box class="relative h-72 overflow-hidden rounded"><Dots v={1} class="absolute inset-0" /></Box>
      <Stack gap="4" align="stretch" class="p-4">
        <Text size="2xl" weight="bold">{c.accent}</Text>
        {#each c.items as it (it.title)}
          <Group gap="4" class="rounded bg-muted p-4">
            <Box class="size-10 shrink-0 rounded bg-primary" />
            <Stack gap="0"><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class="text-muted-foreground">{it.text}</Text></Stack>
          </Group>
        {/each}
      </Stack>
    </Card>
  </Grid>
</Block>
