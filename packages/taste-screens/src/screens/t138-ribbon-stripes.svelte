<!-- Travel packages: a dark panel with a numbered package list and round arrow actions beside a light column with a picture card and a row of avatars. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Separator, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";
  import TopBar from "../parts/top-bar.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" mark="bar" />
  <Grid cols="2" class="flex-1 gap-8 px-16 pb-16">
    <Stack gap="6" class="rounded bg-foreground p-8 text-background">
      <Group justify="between"><Title as={2} weight="semibold" class="text-3xl">{c.eyebrow}</Title><Button size="sm" variant="secondary">{c.secondary}</Button></Group>
      {#each c.items as it, i (it.title)}
        <Stack gap="4"><Separator class="bg-background/30" /><Group justify="between"><Group gap="6"><Text size="sm" class="text-background">0{i + 1}</Text><Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-background">{it.text}</Text></Stack></Group><Button size="sm" variant="secondary" layout="icon" aria-label={it.title}><LucideIcon name="arrow-right" size={16} /></Button></Group></Stack>
      {/each}
    </Stack>
    <Stack gap="6">
      <Box class="relative flex-1 overflow-hidden rounded"><Stripes v={1} class="absolute inset-0" /><Card class="absolute right-8 bottom-8 w-64 gap-4 p-4 shadow-lg"><Text weight="semibold">{c.title}</Text><Button class="w-full">{c.cta}</Button></Card></Box>
      <Group justify="between"><Stack gap="0"><Text weight="semibold">{c.stats[1]!.value}</Text><Text size="sm" class="text-muted-foreground">{c.stats[1]!.label}</Text></Stack><Avatars n={4} size={48} /></Group>
    </Stack>
  </Grid>
</Block>
