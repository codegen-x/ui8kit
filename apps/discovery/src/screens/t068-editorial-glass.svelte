<!-- Editorial cover: the wordmark set across the top as a masthead, a glass plate below, cover lines down the start side. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Inline, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col px-16 py-12">
  <Inline class="block text-center text-[184px] leading-none font-black tracking-tighter uppercase">{c.brand}</Inline>
  <Grid cols="12" class="flex-1 gap-8 pt-8">
    <Stack gap="8" justify="end" class="col-span-4 pb-4">
      <Text size="sm" class="tracking-widest uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-5xl leading-tight tracking-tight">{c.title}</Title>
      {#each c.items as it (it.title)}<Text><Text class="inline font-semibold">{it.title}.</Text> {it.text}</Text>{/each}
      <Button class="self-start">{c.cta}</Button>
    </Stack>
    <Box class="col-span-8 overflow-hidden rounded"><Glass v={2} class="h-full w-full" /></Box>
  </Grid>
</Block>
