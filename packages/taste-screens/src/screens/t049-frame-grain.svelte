<!-- Frame: a tablet-shaped window on a grain field holding a small table built from the deck; headline above. -->
<script lang="ts">
  import { Badge, Block, Button, Card, Stack, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Text, Title } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import TopBar from "../parts/top-bar.svelte";
  import Grain from "../recipes/grain.svelte";

  let { c }: { c: Deck } = $props();
</script>

<Block tag="section" class="relative flex h-full flex-col">
  <Grain v={1} class="absolute inset-0" />
  <TopBar {c} layout="split" tone="inverse" action="secondary" />
  <Stack gap="4" align="center" class="relative px-16 pt-8 text-center">
    <Title as={1} weight="bold" class="text-6xl tracking-tight text-background">{c.title}</Title>
    <Text size="lg" class="max-w-2xl text-background/80">{c.lead}</Text>
  </Stack>
  <Card class="relative mx-auto mt-12 w-[1000px] gap-6 p-8 shadow-lg">
    <Text size="xl" weight="semibold">{c.eyebrow}</Text>
    <Table>
      <TableHead><TableRow><TableHeadCell>{c.nav[0]}</TableHeadCell><TableHeadCell>{c.nav[1]}</TableHeadCell><TableHeadCell>{c.nav[2]}</TableHeadCell></TableRow></TableHead>
      <TableBody>
        {#each c.items as it, i (it.title)}
          <TableRow><TableCell class="font-semibold">{it.title}</TableCell><TableCell>{it.text}</TableCell><TableCell><Badge variant={i === 0 ? "default" : "secondary"}>{c.stats[i]!.value}</Badge></TableCell></TableRow>
        {/each}
      </TableBody>
    </Table>
    <Button class="self-end">{c.cta}</Button>
  </Card>
</Block>
