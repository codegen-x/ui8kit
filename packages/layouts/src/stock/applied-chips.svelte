<!-- The result count (announced politely) and the applied filters as removable chips, with one "reset" for all of them. -->
<script lang="ts">
  import { Button, Group, List, ListItem, LucideIcon, Text } from "@codegen-x/svelte-compose";
  import { fmt, type ChipView, type StockText } from "./text";

  let { t, total, chips, onremove, onreset }: { t: StockText; total: number; chips: ChipView[]; onremove: (key: string) => void; onreset: () => void } = $props();
</script>

<Group gap="2" align="center" class="flex-wrap" data-testid="applied">
  <Text tag="p" weight="semibold" class="tabular-nums" aria-live="polite" aria-atomic="true" data-testid="result-count">{fmt(t.results.count, { n: total })}</Text>
  {#if chips.length > 0}
    <List tag="ul" class="flex flex-wrap items-center gap-2" aria-label={t.chips.label}>
      {#each chips as c (c.key)}
        <ListItem>
          <Button variant="secondary" size="sm" aria-label={fmt(t.chips.remove, { filter: c.label })} onclick={() => onremove(c.key)} data-testid="chip">
            <Text tag="span">{c.label}</Text><LucideIcon name="x" size={16} />
          </Button>
        </ListItem>
      {/each}
    </List>
    <Button variant="link" size="sm" onclick={onreset} data-testid="reset">{t.chips.reset}</Button>
  {/if}
</Group>
