<!-- The related refinements: values carried by some of the current results, each a one-click filter with how many results it keeps
     (a related search, as stock sites show it above the grid). -->
<script lang="ts">
  import { Button, Group, List, ListItem, LucideIcon, Text } from "@codegen-x/svelte-compose";
  import type { RefineView } from "./text";

  let { label, items, ontoggle, testid = "refine" }: { label: string; items: RefineView[]; ontoggle: (facet: string, value: string) => void; testid?: string } = $props();
</script>

{#if items.length > 0}
  <Group gap="2" align="center" class="flex-wrap" data-testid={testid}>
    <Text tag="span" id={testid + "-label"} size="sm" class="text-muted-foreground">{label}</Text>
    <List tag="ul" class={"flex min-w-0 max-w-full items-center gap-2 " + (testid === "refine" ? "overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0" : "flex-wrap")} aria-labelledby={testid + "-label"}>
      {#each items as r (r.facet + ":" + r.value)}
        <ListItem>
          <Button variant="outline" size="sm" class="shrink-0 gap-2" title={r.group} onclick={() => ontoggle(r.facet, r.value)} data-testid="refine-option">
            <LucideIcon name="plus" size={16} /><Text tag="span">{r.label}</Text><Text tag="span" class="tabular-nums text-muted-foreground">{r.count}</Text>
          </Button>
        </ListItem>
      {/each}
    </List>
  </Group>
{/if}
