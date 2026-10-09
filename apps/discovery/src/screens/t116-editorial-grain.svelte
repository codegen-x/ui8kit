<!-- Editorial article: a wide grain banner on top, then the headline at the start and two columns of text with a byline. -->
<script lang="ts">
  import { Block, Grid, Group, Separator, Stack, Text, Title, Button } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="center" action="ghost" />
  <Grain v={1} class="mx-16 h-80 rounded" />
  <Grid cols="12" class="flex-1 gap-8 px-16 pt-10 pb-16">
    <Stack gap="6" class="col-span-5">
      <Text size="sm" weight="semibold" class="text-primary">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Separator />
      <Group gap="4"><Text weight="semibold">{c.brand}</Text><Text size="sm" class="text-muted-foreground">{c.note}</Text></Group>
    </Stack>
    <Grid cols="2" class="col-span-7 gap-8">
      <Stack gap="4"><Text size="lg">{c.lead}</Text><Text class="text-muted-foreground">{c.items[0]!.text}</Text></Stack>
      <Stack gap="4"><Text class="text-muted-foreground">{c.items[1]!.text} {c.items[2]!.text}</Text><Button variant="link" class="self-start px-0">{c.cta}</Button></Stack>
    </Grid>
  </Grid>
</Block>
