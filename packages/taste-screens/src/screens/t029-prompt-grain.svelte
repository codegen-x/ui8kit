<!-- Prompt: a grain field on the top half, a search card overlapping its edge with a field, a select and an action. -->
<script lang="ts">
  import { Block, Button, Card, Group, Input, Select, SelectOption, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Grain v={0} class="absolute inset-x-0 top-0 h-[600px]" />
  <TopBar {c} layout="split" tone="inverse" action="secondary" />
  <Stack gap="6" align="center" class="relative px-16 pt-24 text-center">
    <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight text-background">{c.title}</Title>
    <Text size="xl" class="max-w-2xl text-background/80">{c.lead}</Text>
  </Stack>
  <Card class="relative mx-auto mt-24 w-[1040px] flex-row items-center gap-4 p-4 shadow-lg">
    <Input size="lg" placeholder={c.input} class="flex-1" />
    <Select size="lg" class="w-56">
      {#each c.tags as t (t)}<SelectOption value={t}>{t}</SelectOption>{/each}
    </Select>
    <Button size="lg">{c.cta}</Button>
  </Card>
  <Group gap="8" justify="center" class="relative pt-12 text-muted-foreground">
    {#each c.stats as s (s.label)}<Text size="sm"><Text size="sm" class="inline font-bold text-foreground">{s.value}</Text> {s.label}</Text>{/each}
  </Group>
</Block>
