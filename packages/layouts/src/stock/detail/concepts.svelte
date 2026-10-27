<!-- The concepts and entities of an asset (the body's wide column): a screen page's blocks with their thumbnails (pointing at one
     outlines it in the preview), or a block's variants and the screen pages that use it; the page map; the composition pattern with
     its definition (where one is written in this language); the concept facets with their labels; and the concepts the catalog
     has no labels for yet, shown empty (never filled in). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { Badge, Block, Box, Button, Group, Link, List, ListItem, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import PageMap from "./page-map.svelte";
  import { fmt, type DetailView, type PassportLink, type StockText } from "../text";

  let { t, view, point, onpoint, onlocate, thumb }: {
    t: StockText; view: DetailView; point: number | null; onpoint: (i: number | null) => void; onlocate: (i: number) => void;
    thumb: Snippet<[PassportLink]>;
  } = $props();
  const screen = $derived(view.type === "screen");
</script>

{#snippet parts(items: PassportLink[], id: string, pointing: boolean)}
  <List tag="ol" class="ui8-concept-parts" data-testid={id}>
    {#each items as l, i (l.key)}
      <ListItem class="ui8-concept-part" data-point={pointing && point === i ? "1" : "0"}
        onmouseenter={pointing ? () => onpoint(i) : undefined} onmouseleave={pointing ? () => onpoint(null) : undefined}>
        <Box class="ui8-concept-thumb">{@render thumb(l)}</Box>
        <Stack gap="2" align="start" class="ui8-concept-text">
          {#if l.current}
            <Group gap="2" align="center"><Text tag="span" size="sm" weight="medium">{l.subtitle}</Text><Badge size="sm" variant="outline">{t.detail.concepts.current}</Badge></Group>
          {:else}
            <Link href={l.href} size="sm" onfocus={pointing ? () => onpoint(i) : undefined} onblur={pointing ? () => onpoint(null) : undefined}>{screen ? l.title : l.subtitle}</Link>
            <Text tag="span" size="sm" class="ui8-concept-muted">{screen ? l.subtitle : l.title}</Text>
          {/if}
          {#if pointing}
            <Button variant="ghost" size="sm" class="ui8-concept-locate" aria-label={fmt(t.detail.concepts.locate, { name: l.title })} onclick={() => onlocate(i)}>
              <LucideIcon name="eye" size={16} />
            </Button>
          {/if}
        </Stack>
      </ListItem>
    {/each}
  </List>
{/snippet}

<Block tag="section" aria-labelledby="detail-concepts-title" class="ui8-concepts" data-testid="concepts">
  <Stack gap="8" align="stretch">
    <Stack gap="2" align="start">
      <Title as={2} size="xl" weight="semibold" id="detail-concepts-title">{t.detail.concepts.title}</Title>
      <Text tag="p" class="ui8-concept-muted">{t.detail.concepts.lead}</Text>
    </Stack>

    {#if screen}
      <Stack gap="4" align="stretch">
        <Group gap="2" align="baseline" justify="between" class="ui8-concept-head">
          <Title as={3} size="base" weight="semibold">{t.detail.concepts.blocks}</Title>
          <Text tag="span" size="sm" class="ui8-concept-muted">{t.detail.concepts.blocksNote}</Text>
        </Group>
        {@render parts(view.parts, "concept-blocks", true)}
      </Stack>
    {:else}
      <Stack gap="4" align="stretch">
        <Title as={3} size="base" weight="semibold">{t.detail.concepts.variants}</Title>
        {@render parts(view.parts, "concept-variants", false)}
      </Stack>
      <Stack gap="4" align="stretch">
        <Title as={3} size="base" weight="semibold">{t.detail.concepts.usedBy}</Title>
        {#if view.usedBy.length > 0}
          {@render parts(view.usedBy, "concept-used-by", false)}
        {:else}
          <Text tag="p" size="sm" class="ui8-concept-muted" data-testid="concept-unused">{t.detail.concepts.unused}</Text>
        {/if}
      </Stack>
    {/if}

    <Stack gap="4" align="stretch">
      <Group gap="2" align="baseline" justify="between" class="ui8-concept-head">
        <Title as={3} size="base" weight="semibold">{t.detail.concepts.map}</Title>
        <Text tag="span" size="sm" class="ui8-concept-muted">{t.detail.concepts.mapNote}</Text>
      </Group>
      <PageMap {t} rows={view.map} point={screen ? point : null} onpoint={screen ? onpoint : () => {}} />
    </Stack>

    <Stack gap="4" align="stretch" data-testid="concept-pattern">
      <Title as={3} size="base" weight="semibold">{t.detail.concepts.pattern}</Title>
      {#if view.patterns.length > 0}
        <List tag="ul" class="ui8-concept-patterns">
          {#each view.patterns as p (p.id)}
            <ListItem class="ui8-concept-pattern">
              <Group gap="2" align="center">
                <Text tag="span" weight="medium">{p.label}</Text>
                {#if p.draft}<Badge size="sm" variant="outline">{t.detail.passport.draft}</Badge>{/if}
              </Group>
              {#if p.definition}<Text tag="p" size="sm" class="ui8-concept-muted">{p.definition}</Text>{/if}
            </ListItem>
          {/each}
        </List>
      {:else}
        <Text tag="p" size="sm" class="ui8-summary-none" data-state="no-label">{t.detail.concepts.patternNone}</Text>
      {/if}
    </Stack>

    <Stack gap="4" align="stretch">
      <Title as={3} size="base" weight="semibold">{t.detail.concepts.facets}</Title>
      <Box tag="dl" class="ui8-concept-facets" data-testid="concept-facets">
        {#each view.concepts as f (f.id)}
          <Box tag="dt" class="ui8-concept-facet">
            <Text tag="span">{f.label}</Text>
            {#if f.draft}<Badge size="sm" variant="outline">{t.detail.passport.draft}</Badge>{/if}
          </Box>
          <Box tag="dd" class="ui8-concept-values" data-facet={f.id}>
            {#if f.values.length === 0}
              <Text tag="span" size="sm" class="ui8-summary-none" data-state="no-label">{t.detail.passport.noLabel}</Text>
            {:else}
              <Group gap="2" align="center" class="ui8-summary-badges">
                {#each f.values as v (v.id)}<Badge size="sm" variant={v.draft ? "outline" : "secondary"}>{v.label}</Badge>{/each}
              </Group>
            {/if}
          </Box>
        {/each}
      </Box>
    </Stack>

    <Stack gap="4" align="stretch" data-testid="concept-future">
      <Group gap="2" align="baseline" justify="between" class="ui8-concept-head">
        <Title as={3} size="base" weight="semibold">{t.detail.concepts.future}</Title>
        <Text tag="span" size="sm" class="ui8-concept-muted">{t.detail.concepts.futureNote}</Text>
      </Group>
      <Box tag="dl" class="ui8-concept-facets">
        {#each t.detail.concepts.futureItems as name (name)}
          <Box tag="dt" class="ui8-concept-facet">{name}</Box>
          <Box tag="dd" class="ui8-concept-values"><Text tag="span" size="sm" class="ui8-summary-none" data-state="no-label">{t.detail.passport.noLabel}</Text></Box>
        {/each}
      </Box>
    </Stack>
  </Stack>
</Block>
