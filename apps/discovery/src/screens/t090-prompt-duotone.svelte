<!-- Prompt as a note: a duotone picture card at the start; at the end a text area composer with two actions. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, Stack, Text, Textarea, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="start" action="outline" mark="circle" />
  <Grid cols="2" class="flex-1 items-center gap-16 px-16 pb-16">
    <Box class="h-[720px] overflow-hidden rounded"><Duotone v={2} alt={c.title} class="h-full w-full" /></Box>
    <Stack gap="8" align="stretch">
      <Title as={1} weight="bold" class="text-6xl leading-none tracking-tight">{c.title}</Title>
      <Text size="lg" class="text-muted-foreground">{c.lead}</Text>
      <Card class="gap-4 p-4 shadow-lg">
        <Textarea rows={5} variant="ghost" placeholder={c.input} />
        <Group justify="between"><Text size="sm" class="text-muted-foreground">{c.note}</Text><Group gap="2"><Button variant="ghost">{c.secondary}</Button><Button>{c.cta}</Button></Group></Group>
      </Card>
    </Stack>
  </Grid>
</Block>
