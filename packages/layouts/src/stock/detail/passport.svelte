<!-- The passport of an asset: a screen page's blocks with their variants, or a block's variants and the screen pages that use the
     block; then every facet of its type with its labels, read-only (labelling is the cabinet's): a draft badge on weak labels and an
     explicit "no label" where nothing applies (no fallback value). -->
<script lang="ts">
  import { Badge, Block, Box, Grid, Group, Link, List, ListItem, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { DetailView, PassportLink, StockText } from "../text";

  let { t, view }: { t: StockText; view: DetailView } = $props();
  const screen = $derived(view.type === "screen");
</script>

{#snippet links(items: PassportLink[], id: string)}
  <List tag="ol" class="ui8-passport-links" data-testid={id}>
    {#each items as l (l.key)}
      <ListItem class="ui8-passport-link">
        {#if l.current}
          <Text tag="span" weight="medium">{l.subtitle}</Text>
          <Badge size="sm" variant="outline">{t.detail.passport.current}</Badge>
        {:else}
          <Link href={l.href} size="sm">{screen ? l.title : l.subtitle}</Link>
          <Text tag="span" size="sm" class="ui8-passport-muted">{screen ? l.subtitle : l.title}</Text>
        {/if}
      </ListItem>
    {/each}
  </List>
{/snippet}

<Block tag="section" aria-labelledby="detail-passport-title" data-testid="passport">
  <Stack gap="4" align="stretch">
    <Title as={2} size="lg" weight="semibold" id="detail-passport-title">{t.detail.passport.title}</Title>
    <Grid cols="1-2" class="ui8-passport-grid">
      <Stack gap="4" align="stretch">
        <Title as={3} size="sm" weight="semibold">{screen ? t.detail.passport.blocks : t.detail.passport.variants}</Title>
        {@render links(view.parts, "passport-parts")}
        {#if !screen}
          <Title as={3} size="sm" weight="semibold">{t.detail.passport.usedBy}</Title>
          {#if view.usedBy.length > 0}
            {@render links(view.usedBy, "passport-used-by")}
          {:else}
            <Text tag="p" size="sm" class="ui8-passport-muted" data-testid="passport-unused">{t.detail.passport.unused}</Text>
          {/if}
        {/if}
      </Stack>
      <Stack gap="4" align="stretch">
        <Title as={3} size="sm" weight="semibold">{t.detail.passport.facets}</Title>
        <Text tag="p" size="sm" class="ui8-passport-muted">{t.detail.passport.readonly}</Text>
        <Box tag="dl" class="ui8-passport-facets" data-testid="passport-facets">
          {#each view.facets as f (f.id)}
            <Box tag="dt" class="ui8-passport-facet">
              <Text tag="span">{f.label}</Text>
              {#if f.draft}<Badge size="sm" variant="outline">{t.detail.passport.draft}</Badge>{/if}
            </Box>
            <Box tag="dd" class="ui8-passport-values" data-facet={f.id}>
              {#if f.any}
                <Badge size="sm" variant="secondary">{t.detail.passport.any}</Badge>
              {:else if f.values.length === 0}
                <Text tag="span" size="sm" class="ui8-passport-none" data-state="no-label">{t.detail.passport.noLabel}</Text>
              {:else}
                <Group gap="2" align="center" class="ui8-passport-badges">
                  {#each f.values as v (v.id)}
                    <Badge size="sm" variant={v.draft ? "outline" : "secondary"}>{v.label}</Badge>
                  {/each}
                </Group>
              {/if}
            </Box>
          {/each}
        </Box>
      </Stack>
    </Grid>
  </Stack>
</Block>
