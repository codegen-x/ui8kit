<!-- Editorial spread: a full-height rings page at the start; a pull quote, the headline and two columns on the end page. -->
<script lang="ts">
  import { Block, Button, Grid, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full">
  <Rings v={1} class="h-full w-5/12" />
  <Stack gap="0" align="stretch" class="flex-1">
    <TopBar {c} layout="start" action="ghost" mark="none" />
    <Stack gap="8" class="flex-1 justify-center px-16">
      <Text size="sm" class="tracking-widest uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="semibold" class="text-7xl leading-[1.02] tracking-tight">{c.title}</Title>
      <Separator />
      <Text size="2xl" weight="medium" class="italic">{c.accent}</Text>
      <Grid cols="2" class="gap-8">
        <Text class="text-muted-foreground">{c.lead}</Text>
        <Text class="text-muted-foreground">{c.items[0]!.text} {c.items[1]!.text}</Text>
      </Grid>
      <Button variant="outline" class="self-start">{c.cta}</Button>
    </Stack>
  </Stack>
</Block>
