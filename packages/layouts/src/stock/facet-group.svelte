<!-- One facet: a fieldset of checkboxes in a disclosure. The legend names the group, each label carries its count; a value that
     would leave nothing is dimmed, not hidden. A draft facet (hand-made table) carries a badge and a note. -->
<script lang="ts">
  import { Badge, Button, Checkbox, Disclosure, Fieldset, Group, Label, Legend, Stack, Summary, Text } from "@codegen-x/svelte-compose";
  import { fmt, type FacetView, type StockText } from "./text";

  let { t, g, ontoggle }: { t: StockText; g: FacetView; ontoggle: (facet: string, value: string) => void } = $props();
  let all = $state(false);
  const shown = $derived(all ? g.values : g.values.slice(0, Math.max(g.visible, g.values.filter((v) => v.checked).length)));
  const rest = $derived(g.values.length - shown.length);
  const picked = $derived(g.values.filter((v) => v.checked).length);
</script>

<Disclosure variant="item" open={g.open || picked > 0} data-testid={"facet-" + g.id}>
  <Summary variant="ghost">
    <Group gap="2" align="center">
      <Text tag="span">{g.label}</Text>
      {#if picked > 0}<Badge size="sm" variant="default" class="tabular-nums">{picked}</Badge>{/if}
      {#if g.draft}<Badge size="sm" variant="outline" title={g.note} data-testid="draft-badge">{t.facets.draft}</Badge>{/if}
    </Group>
  </Summary>
  <Fieldset class="pb-4">
    <Legend class="sr-only">{g.label}</Legend>
    <Stack gap="2" align="stretch">
      {#each shown as v (v.id)}
        <Label class={"flex cursor-pointer items-center gap-2 text-sm" + (v.count === 0 && !v.checked ? " text-muted-foreground" : "")}>
          <Checkbox size="sm" name={g.id} value={v.id} checked={v.checked} onchange={() => ontoggle(g.id, v.id)} />
          <Text tag="span" class="min-w-0 flex-1 truncate">{v.label}</Text>
          <Text tag="span" class="tabular-nums text-muted-foreground">{v.count}</Text>
        </Label>
      {/each}
    </Stack>
    {#if rest > 0}
      <Button variant="link" size="sm" class="justify-start px-0" onclick={() => (all = true)}>{fmt(t.facets.more, { n: rest })}</Button>
    {:else if all && g.values.length > g.visible}
      <Button variant="link" size="sm" class="justify-start px-0" onclick={() => (all = false)}>{t.facets.less}</Button>
    {/if}
    {#if g.soft}<Text tag="p" size="xs" class="text-muted-foreground">{t.facets.soft}</Text>{/if}
  </Fieldset>
</Disclosure>
