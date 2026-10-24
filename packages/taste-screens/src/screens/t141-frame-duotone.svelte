<!-- Rental collage hero: huge headline and a pill action at the start, three overlapping image cards at the end (one with a caption), then a row of pill filter chips. -->
<script lang="ts">
  import { Block, Box, Button, Card, Group, Input, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Avatars from "../parts/avatars.svelte";
  import Duotone from "../recipes/duotone.svelte";
  import Mesh from "../recipes/mesh.svelte";
  import Stripes from "../recipes/stripes.svelte";

  let { c }: { c: Deck } = $props();
  const icons = ["sparkles", "layers", "zap", "compass", "tag", "calendar", "clock"];
</script>

<Block tag="section" class="flex h-full flex-col">
  <Group justify="between" class="h-20 px-16"><Text class="text-lg font-bold tracking-tight uppercase">{c.brand}</Text><Group gap="8">{#each c.nav as n (n)}<Text size="sm">{n}</Text>{/each}</Group><Group gap="2"><LucideIcon name="search" size={16} /><Input size="sm" placeholder={c.input} /></Group></Group>
  <Box class="relative flex-1 px-16">
    <Stack gap="6" class="relative z-10 max-w-xl pt-8">
      <Text size="xs" class="tracking-widest text-muted-foreground uppercase">{c.eyebrow}</Text>
      <Title as={1} weight="bold" class="text-8xl leading-none tracking-tight">{c.title}</Title>
      <Text class="max-w-md text-muted-foreground">{c.lead}</Text>
      <Button size="lg" class="self-start">{c.cta}<LucideIcon name="arrow-right" size={16} /></Button>
      <Group gap="2"><LucideIcon name="map-pin" size={16} /><Text size="sm" class="text-muted-foreground">{c.note}</Text></Group>
    </Stack>
    <Duotone v={1} alt={c.title} class="absolute top-8 right-48 h-80 w-96 overflow-hidden rounded" />
    <Mesh v={2} class="absolute top-16 right-16 h-72 w-64 overflow-hidden rounded" />
    <Card class="absolute right-72 bottom-8 w-80 gap-0 overflow-hidden p-0 shadow-lg"><Stripes v={0} class="h-32 w-full" /><Group justify="between" class="p-4"><Text size="sm" weight="semibold">{c.items[0]!.title}</Text><Button layout="icon" size="sm" aria-label={c.items[0]!.title}><LucideIcon name="arrow-right" size={16} /></Button></Group></Card>
  </Box>
  <Group gap="4" justify="center" class="px-16 py-8">{#each c.tags as t, i (t)}<Button variant="outline"><LucideIcon name={icons[i]!} size={16} />{t}</Button>{/each}</Group>
</Block>
