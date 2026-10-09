<!-- Estate hero: a dark rounded full-bleed picture with pill navigation, a huge uppercase headline and a glass search bar of four fields and a button. -->
<script lang="ts">
  import { Block, Box, Button, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import Field from "../parts/field.svelte";
  import Glass from "../recipes/glass.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col p-8">
  <Box class="relative flex flex-1 flex-col overflow-hidden rounded bg-foreground text-background">
    <Glass v={3} class="absolute inset-0 opacity-70" />
    <Box class="absolute inset-0 bg-foreground/60" />
    <Group justify="between" class="relative h-20 px-16"><Group gap="2"><Button size="sm" variant="secondary">{c.nav[0]}</Button><Button size="sm" variant="outline">{c.nav[1]}</Button></Group><Text class="font-bold tracking-widest uppercase">{c.brand}</Text><Group gap="2"><Button size="sm" variant="outline">{c.nav[2]}</Button><Button size="sm" variant="outline">{c.nav[3]}</Button></Group></Group>
    <Stack gap="4" justify="end" class="relative flex-1 px-16 pb-8">
      <Text size="sm" class="italic text-background/80">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="max-w-4xl text-7xl leading-none tracking-tight uppercase">{c.title}</Title>
      <Text class="max-w-sm self-end text-background/80 italic">{c.accent} {c.lead}</Text>
    </Stack>
    <Group gap="4" class="relative mx-16 mb-16 rounded bg-foreground/80 p-6 inset-ring inset-ring-background/30 backdrop-blur-xl">
      {#each c.items as it, i (it.title)}<Box class="flex-1"><Field tone="glass" label={it.title} value={c.tags[i]!} /></Box>{/each}
      <Button size="lg" variant="secondary" layout="icon" aria-label={c.cta}><LucideIcon name="search" size={20} /></Button>
    </Group>
  </Box>
</Block>
