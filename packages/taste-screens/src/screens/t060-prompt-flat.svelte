<!-- Prompt: flat shapes in a tall start panel; at the end the headline, a textarea composer and topic chips. -->
<script lang="ts">
  import { Block, Button, Card, Grid, Group, Stack, Text, Textarea, Title, TopicChips } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { topics } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Flat from "../recipes/flat.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" />
  <Grid cols="5" class="flex-1 gap-16 px-16 pb-16">
    <Flat v={1} class="col-span-2 h-full rounded" />
    <Stack gap="8" justify="center" class="col-span-3">
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Card class="gap-4 p-4">
        <Textarea rows={4} placeholder={c.input} class="inset-ring-0" />
        <Group justify="between"><TopicChips topics={topics(c, 2)} /><Button>{c.cta}</Button></Group>
      </Card>
      <Text size="sm" class="text-muted-foreground">{c.note}</Text>
    </Stack>
  </Grid>
</Block>
