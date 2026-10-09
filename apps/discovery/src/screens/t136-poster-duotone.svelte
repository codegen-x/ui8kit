<!-- Travel hero: a duotone landscape with the headline at the start, a floating video chip at the end, and a ruled four-figure row under it. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <Box class="relative flex flex-1 flex-col overflow-hidden">
    <Duotone v={3} alt={c.title} class="absolute inset-0" />
    <Box class="relative bg-background"><TopBar {c} layout="start" action="default" mark="bar" /></Box>
    <Stack gap="6" justify="center" class="relative flex-1 px-16">
      <Stack gap="4" class="max-w-xl rounded bg-background p-8">
        <Text size="xs" class="tracking-widest text-muted-foreground uppercase">{c.eyebrow}</Text>
        <Title as={1} weight="bold" class="text-7xl leading-none tracking-tight">{c.title}</Title>
        <Text class="text-muted-foreground">{c.lead}</Text>
        <Button size="lg" class="self-start">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button>
      </Stack>
    </Stack>
    <Card class="absolute right-16 bottom-16 flex-row items-center gap-4 p-4 shadow-lg"><Stack gap="0"><Text size="xs" class="text-muted-foreground">01 / 03</Text><Text size="sm" weight="semibold">{c.secondary}</Text></Stack><Button layout="icon" aria-label={c.secondary}><LucideIcon name="play" size={20} /></Button></Card>
  </Box>
  <Grid cols="4" class="gap-0 px-16 py-8">
    {#each c.stats as s, i (s.label)}<Stack gap="0" align="center" class={"text-center " + (i ? "border-l border-border" : "")}><Text class="text-4xl font-bold">{s.value}</Text><Text size="sm" class="text-muted-foreground">{s.label}</Text></Stack>{/each}
  </Grid>
</Block>
