<!-- Editorial: a giant section number, the headline and lead in a narrow measure, and a flat-shapes column at the end. -->
<script lang="ts">
  import { Block, Button, Grid, Separator, Stack, Text, Title, Inline } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="ghost" mark="none" />
  <Grid cols="12" class="flex-1 gap-8 px-16 pb-16">
    <Stack gap="0" class="col-span-2">
      <Inline class="text-[160px] leading-none font-bold text-primary">01</Inline>
    </Stack>
    <Stack gap="8" class="col-span-5 pt-8">
      <Separator />
      <Text size="sm" class="tracking-widest uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="semibold" class="text-7xl leading-[1.02] tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Text class="text-muted-foreground">{c.items[0]!.text} {c.items[1]!.text} {c.items[2]!.text}</Text>
      <Button size="lg" variant="outline" class="self-start">{c.cta}</Button>
    </Stack>
    <Flat v={3} class="col-span-5 h-full rounded" />
  </Grid>
</Block>
