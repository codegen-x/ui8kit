<!-- Dense dashboard: a sidebar of links, a row of figure cards, a table of items and a dotted plate card. -->
<script lang="ts">
  import { Badge, Block, Box, Button, Card, Grid, Group, Inline, LucideIcon, Stack, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Text, Title } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { GLYPHS } from "../kit-data";
  import Dots from "../recipes/dots.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="flex h-full">
  <Stack gap="2" align="stretch" class="w-64 bg-muted p-6">
    <Group gap="2" class="pb-6"><Box class="size-6 rounded bg-primary" /><Inline class="font-bold">{c.brand}</Inline></Group>
    {#each c.nav as n, i (n)}<Group gap="2" class={"rounded px-2 py-2 " + (i === 0 ? "bg-background" : "")}><LucideIcon name={GLYPHS[i]!} size={16} /><Text size="sm">{n}</Text></Group>{/each}
  </Stack>
  <Stack gap="6" align="stretch" class="flex-1 p-8">
    <Group justify="between"><Title as={1} weight="bold" class="text-4xl tracking-tight">{c.title}</Title><Button>{c.cta}</Button></Group>
    <Grid cols="3" class="gap-4">
      {#each c.stats as s (s.label)}<Card class="gap-2 p-6"><Text size="sm" class="text-muted-foreground">{s.label}</Text><Text class="text-4xl font-bold">{s.value}</Text></Card>{/each}
    </Grid>
    <Grid cols="3" class="flex-1 gap-4">
      <Card class="col-span-2 p-4">
        <Table>
          <TableHead><TableRow><TableHeadCell>{c.nav[1]}</TableHeadCell><TableHeadCell>{c.nav[2]}</TableHeadCell><TableHeadCell>{c.nav[3]}</TableHeadCell></TableRow></TableHead>
          <TableBody>
            {#each [...c.items, ...c.items] as it, i (i)}
              <TableRow><TableCell class="font-medium">{it.title}</TableCell><TableCell class="text-muted-foreground">{c.tags[i % 3]}</TableCell><TableCell><Badge variant={i % 3 === 0 ? "default" : "outline"}>{c.stats[i % 3]!.value}</Badge></TableCell></TableRow>
            {/each}
          </TableBody>
        </Table>
      </Card>
      <Card class="gap-0 overflow-hidden p-0"><Dots v={1} class="flex-1" /><Stack gap="2" class="p-6"><Text weight="semibold">{c.accent}</Text><Text size="sm" class="text-muted-foreground">{c.note}</Text></Stack></Card>
    </Grid>
  </Stack>
</Block>
