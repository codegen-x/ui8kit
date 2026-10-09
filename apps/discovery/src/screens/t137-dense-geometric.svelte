<!-- Travel tiles: a centred section heading, three picture tiles with a tag chip and a caption, and a row of four feature cards with one filled. -->
<script lang="ts">
  import { Block, Box, Button, Card, Grid, Group, LucideIcon, Stack, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import Duotone from "../recipes/duotone.svelte";
  import Geometric from "../recipes/geometric.svelte";
  import Mesh from "../recipes/mesh.svelte";

  let { c }: { c: Deck } = $props();
  const icons = ["shield-check", "users", "heart", "compass"];
</script>

<Block tag="section" class="flex h-full flex-col gap-8 px-16 py-8">
  <Stack gap="2" align="center" class="text-center"><Title as={1} weight="bold" class="text-5xl tracking-tight">{c.accent}</Title><Text class="text-muted-foreground">{c.lead}</Text></Stack>
  <Grid cols="3" class="flex-1 gap-6">
    {#each c.tags.slice(0, 3) as t, i (t)}
      <Box class="relative flex flex-col justify-end overflow-hidden rounded p-6">
        <Box class="absolute inset-0">{#if i === 0}<Duotone v={1} class="h-full w-full" />{:else if i === 1}<Mesh v={3} class="h-full w-full" />{:else}<Geometric v={i} cols={4} rows={4} class="h-full w-full" />{/if}</Box>
        <Button size="sm" variant="outline" class="absolute top-4 left-4">{t}</Button>
        <Stack gap="0" class="relative rounded bg-background p-4"><Text weight="semibold">{c.items[i]!.title}</Text><Text size="sm" class="text-muted-foreground">{c.items[i]!.text}</Text></Stack>
      </Box>
    {/each}
  </Grid>
  <Card variant="muted" class="gap-4 p-6">
    <Text weight="semibold" class="text-center">{c.eyebrow}</Text>
    <Grid cols="4" class="gap-4">
      {#each c.items as it, i (it.title)}
        <Stack gap="2" align="center" class={"rounded p-4 text-center " + (i === 1 ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")}><LucideIcon name={icons[i]!} size={24} /><Text size="sm" weight="semibold">{it.title}</Text><Text size="xs" class={i === 1 ? "" : "text-muted-foreground"}>{it.text}</Text></Stack>
      {/each}
    </Grid>
  </Card>
</Block>
