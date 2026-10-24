<!-- Split: numbered steps under the headline at the start; a grain plate at the end with a quote card pinned to its corner. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Inline, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="default" />
  <Grid cols="2" class="flex-1 gap-16 px-16 pb-16">
    <Stack gap="8" justify="center">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Stack gap="4" align="stretch">
        {#each c.items as it, i (it.title)}
          <Group gap="4" class="rounded bg-muted p-4">
            <Inline class="flex size-10 shrink-0 items-center justify-center rounded bg-primary font-bold text-primary-foreground">{i + 1}</Inline>
            <Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack>
          </Group>
        {/each}
      </Stack>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Box class="relative h-full overflow-hidden rounded">
      <Grain v={2} class="absolute inset-0" />
      <Card class="absolute right-8 bottom-8 w-96 gap-4 shadow-lg">
        <Text size="lg" weight="medium">{c.accent}</Text>
        <Text size="sm" class="text-muted-foreground">{c.note}</Text>
      </Card>
    </Box>
  </Grid>
</Block>
