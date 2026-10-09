<!-- Car shop: a dark rounded full-bleed hero with a centred headline and a CTA pill, then an intro heading with avatars and a rule. -->
<script lang="ts">
  import { Block, Box, Button, Group, LucideIcon, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col p-8">
  <Box class="relative flex flex-1 flex-col overflow-hidden rounded bg-foreground text-background">
    <Mesh v={0} class="absolute inset-0 opacity-70" />
    <Box class="absolute inset-0 bg-foreground/60" />
    <Group justify="between" class="relative h-20 px-8"><Text class="font-bold">{c.brand}</Text><Group gap="8">{#each c.nav as n (n)}<Text size="sm" class="text-background/80">{n}</Text>{/each}</Group><Button size="sm" variant="secondary">{c.secondary}<LucideIcon name="arrow-up-right" size={16} /></Button></Group>
    <Stack gap="6" align="center" justify="center" class="relative flex-1 px-16 text-center">
      <Title as={1} weight="medium" class="max-w-3xl text-7xl leading-none tracking-tight">{c.title}</Title>
      <Button size="lg" variant="secondary">{c.cta}<LucideIcon name="arrow-up-right" size={16} /></Button>
    </Stack>
    <Group justify="between" class="relative px-8 pb-8"><Button variant="outline" layout="icon" aria-label="Previous"><LucideIcon name="arrow-left" size={16} /></Button><Text size="sm" class="text-background/80">02 / 08</Text><Button variant="outline" layout="icon" aria-label="Next"><LucideIcon name="arrow-right" size={16} /></Button></Group>
  </Box>
  <Group justify="between" class="items-start px-8 pt-8 pb-4">
    <Title as={2} weight="medium" class="max-w-xl text-4xl leading-tight tracking-tight">{c.accent} {c.lead}</Title>
    <Stack gap="2" class="max-w-xs"><Avatars n={3} /><Text size="sm" class="text-muted-foreground">{c.note}</Text></Stack>
  </Group>
  <Separator class="mx-8" />
</Block>
