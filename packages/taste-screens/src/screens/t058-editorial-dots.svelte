<!-- Editorial broadsheet: three columns under a centred nameplate; a dot plate heads the middle column. -->
<script lang="ts">
  import { Block, Grid, Separator, Stack, Text, Title, Button, Inline } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="outline" mark="none" />
  <Stack gap="6" align="stretch" class="flex-1 px-16 pb-16">
    <Separator />
    <Grid cols="3" class="flex-1 gap-12">
      <Stack gap="6">
        <Inline class="text-sm font-semibold text-primary">{c.eyebrow}</Inline>
        <Title as={2} weight="bold" class="text-4xl leading-tight">{c.items[0]!.title}</Title>
        <Text class="text-muted-foreground">{c.items[0]!.text} {c.lead}</Text>
        <Separator />
        <Title as={2} weight="semibold" class="text-2xl">{c.items[1]!.title}</Title>
        <Text size="sm" class="text-muted-foreground">{c.items[1]!.text}</Text>
      </Stack>
      <Stack gap="6" align="stretch">
        <Dots v={0} class="h-80 rounded" />
        <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
        <Text size="lg">{c.lead}</Text>
        <Button class="self-start">{c.cta}</Button>
      </Stack>
      <Stack gap="6">
        {#each c.stats as s (s.label)}
          <Stack gap="0"><Text class="text-5xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text></Stack>
          <Separator />
        {/each}
        <Text size="sm" class="text-muted-foreground">{c.items[2]!.text}</Text>
      </Stack>
    </Grid>
  </Stack>
</Block>
