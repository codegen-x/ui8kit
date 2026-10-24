<!-- Frame: a desktop monitor (window plus stand) whose screen shows rising stripe bars; copy at the start. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col bg-muted">
  <TopBar {c} layout="split" />
  <Grid cols="5" class="flex-1 items-center gap-16 px-16">
    <Stack gap="8" class="col-span-2">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    </Stack>
    <Stack gap="0" align="center" class="col-span-3">
      <Card class="h-[480px] w-full gap-0 overflow-hidden bg-foreground p-4 shadow-lg">
        <Stack gap="4" align="stretch" class="flex-1 rounded bg-background p-6">
          <Group justify="between"><Text weight="semibold">{c.eyebrow}</Text><Text size="sm" class="text-muted-foreground">{c.stats[0]!.value}</Text></Group>
          <Stripes v={3} class="flex-1 rounded" />
        </Stack>
      </Card>
      <Box class="h-16 w-24 bg-foreground/80" /><Box class="h-3 w-64 rounded bg-foreground/80" />
    </Stack>
  </Grid>
</Block>
