<!-- Editorial: a masthead rule, a three-column spread: numbered lead column, the headline, a tall duotone picture. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Inline, Separator, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="outline" mark="none" />
  <Box class="px-16"><Separator /></Box>
  <Grid cols="12" class="flex-1 gap-8 px-16 py-12">
    <Stack gap="8" class="col-span-3">
      {#each c.items as it, i (it.title)}
        <Stack gap="2">
          <Inline class="text-sm font-semibold text-primary">0{i + 1}</Inline>
          <Text weight="semibold">{it.title}</Text>
          <Text size="sm" class="text-muted-foreground">{it.text}</Text>
        </Stack>
      {/each}
    </Stack>
    <Stack gap="8" justify="end" class="col-span-5">
      <Text size="sm" class="tracking-widest uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="regular" class="text-8xl leading-[0.95] tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Button size="lg" class="self-start">{c.cta}</Button>
    </Stack>
    <Duotone v={1} alt={c.title} class="col-span-4 h-full rounded" />
  </Grid>
</Block>
