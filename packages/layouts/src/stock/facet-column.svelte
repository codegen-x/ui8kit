<!-- The facet column: a complementary landmark with one disclosure per facet. Below lg it folds into one "Filters (n)" disclosure. -->
<script lang="ts">
  import { Block, Disclosure, Stack, Summary, Text, Title } from "@codegen-x/svelte-compose";
  import FacetGroup from "./facet-group.svelte";
  import { fmt, type FacetView, type StockText } from "./text";

  let { t, groups, selected, ontoggle }: { t: StockText; groups: FacetView[]; selected: number; ontoggle: (facet: string, value: string) => void } = $props();
  let wide = $state(true);
  $effect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const sync = (): void => { wide = mq.matches; };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  });
</script>

<Block tag="aside" aria-labelledby="stock-facets-title" class="lg:col-span-3" data-testid="facet-column">
  <Disclosure variant="ghost" open={wide}>
    <Summary variant="ghost" class="lg:pointer-events-none">
      <Title as={2} size="base" id="stock-facets-title">{t.facets.title}</Title>
      <Text tag="span" class="text-muted-foreground lg:hidden">{fmt(t.facets.toggle, { n: selected })}</Text>
    </Summary>
    <Stack gap="0" align="stretch">
      {#each groups as g (g.id)}
        <FacetGroup {t} {g} {ontoggle} />
      {/each}
    </Stack>
  </Disclosure>
</Block>
