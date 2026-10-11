<!-- Car shop story: a two-image row with a pager, a centred caption, then a three-step stepper beside a tall picture. -->
<script lang="ts">
  import { Block, Box, Button, Grid, Group, LucideIcon, Separator, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Grain from "../recipes/grain.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full flex-col gap-8 p-8">
  <Grid cols="2" class="h-[360px] gap-8">
    <Box class="relative overflow-hidden rounded"><Grain v={1} class="absolute inset-0" /><Text size="sm" class="absolute bottom-4 left-4 max-w-72 rounded bg-background p-4">{c.items[0]!.text}</Text></Box>
    <Box class="relative overflow-hidden rounded"><Mesh v={1} class="absolute inset-0" /><Group gap="2" class="absolute right-4 bottom-4"><Button variant="outline" layout="icon" aria-label="Previous"><LucideIcon name="arrow-left" size={16} /></Button><Button layout="icon" aria-label="Next"><LucideIcon name="arrow-right" size={16} /></Button></Group></Box>
  </Grid>
  <Text class="mx-auto max-w-xl text-center text-muted-foreground">{c.lead}</Text>
  <Grid cols="2" class="flex-1 gap-16 px-8">
    <Stack gap="6" justify="center">
      <Text size="xs" class="tracking-widest text-muted-foreground uppercase">{c.eyebrow}</Text>
      <Title as={2} weight="medium" class="text-5xl leading-tight tracking-tight">{c.stats[2]!.value} {c.stats[2]!.label}</Title>
      {#each c.items.slice(0, 3) as it, i (it.title)}
        <Stack gap="2"><Separator /><Group gap="4" align="start"><Text size="sm" class="text-muted-foreground">0{i + 1}</Text><Stack gap="0"><Text weight="semibold">{it.title}</Text>{#if i === 0}<Text size="sm" class="text-muted-foreground">{it.text}</Text>{/if}</Stack></Group></Stack>
      {/each}
    </Stack>
    <Box class="relative overflow-hidden rounded"><Grain v={0} class="absolute inset-0" /></Box>
  </Grid>
</Block>
