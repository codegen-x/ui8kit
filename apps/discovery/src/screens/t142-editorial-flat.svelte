<!-- Rental sections: a numbered section label with a large centred heading, three highlight cards (the middle two filled with the primary colour), then a numbered fleet title with three fleet cards. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "../copy";
  import Flat from "../recipes/flat.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col gap-8 p-16">
  <Group gap="8" class="items-start">
    <Text size="xs" class="tracking-widest text-muted-foreground uppercase">02 — {c.eyebrow}</Text>
    <Title as={1} weight="medium" class="max-w-2xl flex-1 text-center text-6xl leading-tight tracking-tight">{c.accent}</Title>
  </Group>
  <Grid cols="3" class="h-72 gap-4">
    <Card class="justify-between p-6"><Stack gap="2"><Text weight="semibold">{c.items[0]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[0]!.text}</Text></Stack><Group justify="between" class="items-end"><Stack gap="0"><Text class="text-5xl font-bold">{c.stats[0]!.value}</Text><Text size="sm" class="text-muted-foreground">{c.stats[0]!.label}</Text></Stack><Button layout="icon" variant="outline" aria-label={c.items[0]!.title}><LucideIcon name="arrow-right" size={16} /></Button></Group></Card>
    {#each [1, 2] as i (i)}
      <Card class="gap-4 bg-primary p-4 text-primary-foreground inset-ring-primary"><Box class="flex-1 overflow-hidden rounded">{#if i === 1}<Mesh v={1} class="h-full w-full" />{:else}<Flat v={2} class="h-full w-full" />{/if}</Box><Group justify="between"><Group gap="2" class="items-end"><Text class="text-4xl font-bold">{c.stats[i]!.value}</Text><Text size="sm">{c.stats[i]!.label}</Text></Group><Button layout="icon" variant="secondary" aria-label={c.stats[i]!.label}><LucideIcon name="arrow-right" size={16} /></Button></Group></Card>
    {/each}
  </Grid>
  <Group justify="between" class="items-end"><Stack gap="2"><Text size="xs" class="tracking-widest text-muted-foreground uppercase">03 — {c.tags[0]}</Text><Title as={2} weight="bold" class="text-5xl tracking-tight">{c.title}</Title></Stack><Text size="sm" class="max-w-xs text-muted-foreground">{c.lead}</Text></Group>
  <Grid cols="3" class="flex-1 gap-4">
    {#each c.items.slice(0, 3) as it, i (it.title)}
      <Stack gap="2"><Box class="flex-1 overflow-hidden rounded"><Flat v={i + 1} class="h-full w-full" /></Box><Group justify="between"><Stack gap="0"><Text weight="semibold">{it.title}</Text><Text size="sm" class="text-muted-foreground">{it.text}</Text></Stack><Button layout="icon" variant="outline" size="sm" aria-label={it.title}><LucideIcon name="arrow-right" size={16} /></Button></Group></Stack>
    {/each}
  </Grid>
</Block>
