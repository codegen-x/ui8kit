<!-- Split with a capture form: text and an email field at the start, a dot field with a disc at the end. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, Input, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import TopBar from "../parts/top-bar.svelte";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="ghost" mark="circle" />
  <Grid cols="2" class="flex-1 items-stretch gap-0">
    <Stack gap="8" justify="center" class="px-16">
      <Text size="sm" weight="semibold" class="text-primary">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
      <Text size="xl" class="text-muted-foreground">{c.lead}</Text>
      <Group gap="2" class="w-full max-w-lg">
        <Input size="lg" placeholder={c.input} />
        <Button size="lg">{c.cta}</Button>
      </Group>
      <Text size="sm" class="text-muted-foreground">{c.note}</Text>
    </Stack>
    <Box class="p-8"><Dots v={0} class="h-full w-full rounded" /></Box>
  </Grid>
</Block>
