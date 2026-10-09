<!-- Airy: a small grain disc at the top centre, a small centred headline and a quiet action far below it. -->
<script lang="ts">
  import { Block, Box, Button, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="ghost" mark="none" />
  <Stack gap="8" align="center" class="flex-1 px-16 pt-24 text-center">
    <Box class="size-40 overflow-hidden rounded-full"><Grain v={3} class="h-full w-full" /></Box>
    <Title as={1} weight="medium" class="max-w-lg text-4xl leading-tight">{c.title}</Title>
    <Text class="max-w-md text-muted-foreground">{c.lead}</Text>
  </Stack>
  <Stack align="center" class="pb-24"><Button variant="outline">{c.cta}</Button></Stack>
</Block>
