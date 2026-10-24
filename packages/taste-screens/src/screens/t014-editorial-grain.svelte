<!-- Editorial: an issue line, a two-line headline across eight columns, a grain plate and two text columns beside it. -->
<script lang="ts">
  import { Block, Button, Grid, Group, Inline, Separator, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="ghost" mark="bar" />
  <Stack gap="8" align="stretch" class="flex-1 px-16 pb-16">
    <Group justify="between" class="pt-4 text-sm text-muted-foreground">
      <Inline>{c.eyebrow}</Inline><Inline>{c.note}</Inline>
    </Group>
    <Separator />
    <Title as={1} weight="semibold" class="max-w-6xl text-8xl leading-[0.95] tracking-tight">{c.title} <Inline class="text-muted-foreground">{c.accent}</Inline></Title>
    <Grid cols="12" class="flex-1 gap-8">
      <Grain v={3} class="col-span-6 h-full rounded" />
      <Stack gap="4" class="col-span-3">
        <Text size="lg" weight="semibold">{c.lead}</Text>
        <Button class="mt-4 self-start">{c.cta}</Button>
      </Stack>
      <Stack gap="6" class="col-span-3">
        {#each c.items as it (it.title)}
          <Stack gap="2"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text><Separator /></Stack>
        {/each}
      </Stack>
    </Grid>
  </Stack>
</Block>
