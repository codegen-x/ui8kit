<!-- Prompt over rings: a field of rings, the headline, a composer card with suggestion buttons under the input. -->
<script lang="ts">
  import { Block, Button, Card, Group, Input, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Rings v={1} class="absolute inset-0 opacity-30" />
  <TopBar {c} layout="start" action="outline" mark="circle" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16 text-center">
    <Title as={1} weight="semibold" class="max-w-4xl text-7xl leading-none tracking-tight">{c.title}</Title>
    <Card class="w-[800px] gap-4 p-4 text-left shadow-lg">
      <Group gap="2"><Input size="lg" variant="ghost" placeholder={c.input} class="flex-1" /><Button size="lg">{c.cta}</Button></Group>
      <Group gap="2">{#each c.items as it (it.title)}<Button variant="secondary" size="sm">{it.title}</Button>{/each}</Group>
    </Card>
    <Text size="sm" class="text-muted-foreground">{c.note}</Text>
  </Stack>
</Block>
