<!-- Split, media first: a full-height stripes panel bleeding off the start edge, the text column at the end. -->
<script lang="ts">
  import { Block, Button, Group, Stack, Text, Title, Badge } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full">
  <Stripes v={0} class="h-full w-1/2" />
  <Stack gap="0" align="stretch" class="w-1/2">
    <TopBar {c} layout="bare" action="outline" mark="square" />
    <Stack gap="8" justify="center" class="flex-1 px-24">
      <Badge variant="secondary" size="lg">{c.eyebrow}</Badge>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="4"><Button size="lg">{c.cta}</Button><Button size="lg" variant="ghost">{c.secondary}</Button></Group>
      <Text size="sm" class="text-muted-foreground">{c.note}</Text>
    </Stack>
  </Stack>
</Block>
