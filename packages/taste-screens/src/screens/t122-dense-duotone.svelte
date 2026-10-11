<!-- Store categories: a short headline row, then three tinted category tiles (each with its own plate and a pill action) and a benefit strip. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Duotone from "../recipes/duotone.svelte";
  import Flat from "../recipes/flat.svelte";
  import Rings from "../recipes/rings.svelte";

  let { c }: { c: Deck } = $props();
  const tints = ["bg-muted", "bg-secondary", "bg-accent"];
  const perks = ["truck", "shield-check", "lock", "headphones"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <TopBar {c} layout="split" action="outline" mark="circle" />
  <Group justify="between" class="items-end px-16 pt-8">
    <Stack gap="2"><Text size="sm" weight="semibold">{c.eyebrow}</Text><Title as={1} weight="bold" class="max-w-2xl text-6xl leading-none tracking-tight">{c.title}</Title></Stack>
    <Text class="max-w-sm text-muted-foreground">{c.lead}</Text>
  </Group>
  <Grid cols="3" class="flex-1 gap-8 px-16 py-8">
    {#each c.items.slice(0, 3) as it, i (it.title)}
      <Box class={"relative flex flex-col justify-between overflow-hidden rounded p-8 " + tints[i]}>
        <Box class="absolute right-0 bottom-0 h-64 w-64 overflow-hidden rounded">
          {#if i === 0}<Duotone v={i} class="h-full w-full" />{:else if i === 1}<Flat v={2} class="h-full w-full" />{:else}<Rings v={1} class="h-full w-full" />{/if}
        </Box>
        <Stack gap="2" class="relative self-start rounded bg-card p-4"><Text size="sm" class="text-muted-foreground">{c.tags[i]}</Text><Title as={2} weight="semibold" class="max-w-48 text-4xl leading-tight">{it.title}</Title><Text size="sm" class="max-w-48 text-muted-foreground">{it.text}</Text></Stack>
        <Button variant="outline" class="relative self-start">{c.secondary}<LucideIcon name="arrow-up-right" size={16} /></Button>
      </Box>
    {/each}
  </Grid>
  <Grid cols="4" class="mx-16 mb-8 gap-4 rounded bg-card p-6 inset-ring inset-ring-border">
    {#each c.stats as s, i (s.label)}
      <Group gap="4"><LucideIcon name={perks[i]!} size={24} class="text-primary" /><Stack gap="0"><Text size="sm" weight="semibold">{s.value}</Text><Text size="xs" class="text-muted-foreground">{s.label}</Text></Stack></Group>
    {/each}
  </Grid>
</Block>
