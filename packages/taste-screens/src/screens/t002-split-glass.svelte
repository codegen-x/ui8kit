<!-- Split hero: text column at the start, a glass-over-glow media slot at the end; stats under the actions. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Stack, Text, Title, Box } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 pb-16">
    <Stack gap="8">
      <Text size="sm" weight="semibold" class="tracking-widest text-primary uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="max-w-xl text-muted-foreground">{c.lead}</Text>
      <Group gap="4">
        <Button size="lg">{c.cta}</Button>
        <Button size="lg" variant="outline">{c.secondary}</Button>
      </Group>
      <Group gap="12" class="pt-8">
        {#each c.stats as s (s.label)}
          <Stack gap="0">
            <Text size="3xl" weight="bold">{s.value}</Text>
            <Text size="sm" class="text-muted-foreground">{s.label}</Text>
          </Stack>
        {/each}
      </Group>
    </Stack>
    <Box class="h-full max-h-[760px] w-full overflow-hidden rounded">
      <Glass v={0} class="h-full w-full" />
    </Box>
  </Grid>
</Block>
