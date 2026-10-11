<!-- Prompt as a palette: a geometric field behind; a command palette card with a search line and a list of suggestions. -->
<script lang="ts">
  import { Block, Box, Card, Group, Inline, Input, LucideIcon, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { GLYPHS } from "../kit-data";
  import TopBar from "../parts/top-bar.svelte";
  import Geometric from "../recipes/geometric.svelte";

  let { c }: { c: Deck } = $props();
  const rows = $derived([...c.items.map((i) => i.title), ...c.nav.slice(0, 2)]);
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Geometric v={1} cols={6} rows={5} class="absolute inset-0 opacity-40" />
  <TopBar {c} layout="split" action="default" />
  <Stack gap="8" align="center" justify="center" class="relative flex-1 px-16">
    <Title as={1} weight="bold" class="rounded bg-background px-6 py-2 text-6xl tracking-tight">{c.title}</Title>
    <Card class="w-[720px] gap-0 p-0 shadow-lg">
      <Group gap="2" class="px-4 py-2"><LucideIcon name="search" size={20} class="text-muted-foreground" /><Input variant="ghost" placeholder={c.input} class="flex-1" /></Group>
      <Separator />
      <Stack gap="0" align="stretch" class="p-2">
        {#each rows as r, i (i)}
          <Group justify="between" class={"rounded px-4 py-3 " + (i === 0 ? "bg-muted" : "")}><Group gap="4"><LucideIcon name={GLYPHS[i + 2]!} size={16} /><Text>{r}</Text></Group><Inline class="text-sm text-muted-foreground">{c.tags[i % 3]}</Inline></Group>
        {/each}
      </Stack>
    </Card>
  </Stack>
</Block>
