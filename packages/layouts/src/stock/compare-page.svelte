<!-- The Compare page: up to four screens or block variants side by side in one table (a column per item: its live preview, a
     snippet of the app, its name and a remove button; a row per fact), the way back, the count and a way to clear. On a narrow
     screen the table scrolls sideways inside its region. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Block, Box, Button, Group, Link, LucideIcon, Stack, Table, TableBody, TableCaption, TableCell, TableHead, TableHeadCell, TableRow, Text, Title } from "@codegen-x/svelte-compose";
  import { fmt, type CompareRow, type CompareView, type StockText } from "./text";

  let { t, back, items, rows, max, thumb, ondrop, onclear }: {
    t: StockText; back: string; items: CompareView[]; rows: CompareRow[]; max: number; thumb: Snippet<[CompareView]>;
    ondrop: (key: string) => void; onclear: () => void;
  } = $props();
</script>

<Block tag="main" id="main-content" aria-labelledby="compare-page-title" class="mx-auto w-full max-w-screen-2xl px-4 pt-8 pb-16" data-slot="compare-page" data-testid="compare-page">
  <Stack gap="6" align="stretch">
    <Link href={back} size="sm" variant="muted" class="self-start" data-testid="compare-back">{t.compare.back}</Link>
    <Group gap="4" align="end" justify="between" class="flex-wrap">
      <Stack gap="2" align="start">
        <Title as={1} size="2xl" weight="bold" id="compare-page-title">{t.compare.title}</Title>
        <Text tag="p" size="sm" class="text-muted-foreground" data-testid="compare-count">{fmt(t.compare.count, { n: items.length, max })}</Text>
      </Stack>
      <Button variant="outline" size="sm" class="gap-2" disabled={items.length === 0} onclick={onclear} data-testid="compare-clear"><LucideIcon name="circle-x" size={16} /><Text tag="span">{t.compare.clear}</Text></Button>
    </Group>
    {#if items.length === 0}
      <Text tag="p" class="text-muted-foreground" data-testid="compare-empty">{t.compare.empty}</Text>
    {:else}
      <Box class="overflow-x-auto rounded border border-border" role="region" aria-labelledby="compare-caption" tabindex={0} data-testid="compare-region">
        <Table class="w-full min-w-160 table-fixed" data-testid="compare-table">
          <TableCaption id="compare-caption" class="sr-only">{t.compare.table}</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeadCell scope="col" class="w-40 align-top">{t.compare.item}</TableHeadCell>
              {#each items as it (it.key)}
                <TableHeadCell scope="col" class="align-top" data-asset={it.key}>
                  <Stack gap="2" align="stretch">
                    {@render thumb(it)}
                    <Group gap="2" align="center" justify="between">
                      {#if it.href}<Link href={it.href} size="sm" class="min-w-0 truncate">{it.title}</Link>{:else}<Text tag="span" size="sm" class="min-w-0 truncate">{it.title}</Text>{/if}
                      <Button variant="ghost" size="sm" class="size-8 shrink-0 p-0" aria-label={t.compare.drop + ": " + it.title} title={t.compare.drop} onclick={() => ondrop(it.key)} data-testid="compare-drop"><LucideIcon name="x" size={16} /></Button>
                    </Group>
                    <Badge size="sm" variant="secondary" class="self-start">{it.kind}</Badge>
                    {#if !it.href}<Text tag="span" size="sm" class="text-destructive">{t.compare.missing}</Text>{/if}
                  </Stack>
                </TableHeadCell>
              {/each}
            </TableRow>
          </TableHead>
          <TableBody>
            {#each rows as r (r.id)}
              <TableRow data-row={r.id}>
                <TableHeadCell scope="row" class="align-top">{r.label}</TableHeadCell>
                {#each r.values as v, i (i)}
                  <TableCell class="align-top break-words">{#if v}{v}{:else}<Text tag="span" class="text-muted-foreground">{t.compare.none}</Text>{/if}</TableCell>
                {/each}
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </Box>
    {/if}
  </Stack>
</Block>
