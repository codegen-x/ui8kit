<!-- Stats on glass: a glow field, the centred headline, four frosted figure tiles in a row. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
  const four = $derived([...c.stats, { value: c.tags[2]!, label: c.tags[0]! }]);
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Glass v={3} class="absolute inset-0" />
  <TopBar {c} layout="split" action="secondary" mark="circle" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-muted-foreground">{c.lead}</Text>
    <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="outline">{c.secondary}</Button></Group>
    <Grid cols="4" class="mt-8 w-full max-w-5xl gap-4">
      {#each four as s, i (i)}
        <Box class="flex flex-col items-start gap-2 rounded bg-background/50 p-6 inset-ring inset-ring-foreground/10 backdrop-blur-xl">
          <Text class="text-5xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text>
        </Box>
      {/each}
    </Grid>
  </Stack>
</Block>
