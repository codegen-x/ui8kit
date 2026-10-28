<!-- One facet: a fieldset of checkboxes in a disclosure. The legend names the group, each label carries its count; a value that
     would leave nothing is dimmed, not hidden. A draft facet (hand-made table) carries a badge and a note. A large facet (more than
     FIND values) has a field that narrows its values by name; while it has text every match is shown, else "show more / fewer". -->
<script lang="ts">
  import { Badge, Box, Button, Checkbox, Disclosure, Fieldset, Group, Input, Label, Legend, LucideIcon, Stack, Summary, Text } from "@codegen-x/svelte-compose";
  import { fmt, type FacetView, type StockText } from "./text";

  let { t, g, ontoggle }: { t: StockText; g: FacetView; ontoggle: (facet: string, value: string) => void } = $props();
  const FIND = 12;
  let all = $state(false);
  let find = $state("");
  const large = $derived(g.values.length > FIND);
  const needle = $derived(find.trim().toLowerCase());
  // a match starts a word of the label (any script): "car" finds "Card grid" and "Cart / checkout", not "Scarce"
  const hits = (label: string): boolean => label.toLowerCase().split(/[^\p{L}\p{N}]+/u).some((w) => w.startsWith(needle)) || label.toLowerCase().startsWith(needle);
  const found = $derived(needle ? g.values.filter((v) => v.checked || hits(v.label)) : g.values);
  // folded: the first `visible` values and every checked one wherever it stands (a checked value is never out of sight)
  const shown = $derived(needle || all ? found : g.values.filter((v, i) => i < g.visible || v.checked));
  const rest = $derived(needle ? 0 : g.values.length - shown.length);
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
  <Fieldset class="min-w-0 pb-4">
    <Legend class="sr-only">{g.label}</Legend>
    {#if large}
      <Box class="relative mb-2">
        <LucideIcon name="search" size={16} class="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" size="sm" class="pl-8" value={find} oninput={(e: Event) => (find = (e.currentTarget as HTMLInputElement).value)}
          aria-label={fmt(t.facets.find, { facet: g.label })} placeholder={fmt(t.facets.find, { facet: g.label })} data-testid="facet-find" />
      </Box>
    {/if}
    <Stack gap="2" align="stretch" class={all || needle ? "max-h-80 overflow-y-auto pr-2" : ""}>
      {#each shown as v (v.id)}
        <Label class={"flex cursor-pointer items-center gap-2 text-sm" + (v.count === 0 && !v.checked ? " text-muted-foreground" : "")}>
          <Checkbox size="sm" name={g.id} value={v.id} checked={v.checked} onchange={() => ontoggle(g.id, v.id)} />
          <Text tag="span" class="min-w-0 flex-1 truncate">{v.label}</Text>
          {#if v.draft}<Badge size="sm" variant="outline" title={g.note} data-testid="value-draft">{t.facets.draft}</Badge>{/if}
          <Text tag="span" class="tabular-nums text-muted-foreground">{v.count}</Text>
        </Label>
      {/each}
    </Stack>
    {#if needle && found.every((v) => v.checked)}
      <Text tag="p" size="sm" class="text-muted-foreground" aria-live="polite" data-testid="facet-nomatch">{fmt(t.facets.nomatch, { q: find.trim() })}</Text>
    {/if}
    {#if rest > 0}
      <Button variant="link" size="sm" class="justify-start px-0" onclick={() => (all = true)}>{fmt(t.facets.more, { n: rest })}</Button>
    {:else if all && !needle && g.values.length > g.visible}
      <Button variant="link" size="sm" class="justify-start px-0" onclick={() => (all = false)}>{t.facets.less}</Button>
    {/if}
    {#if g.soft}<Text tag="p" size="xs" class="text-muted-foreground">{t.facets.soft}</Text>{/if}
  </Fieldset>
</Disclosure>
