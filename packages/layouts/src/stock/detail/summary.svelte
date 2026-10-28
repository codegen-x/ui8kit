<!-- The key information beside the preview: the name and what it is, the key facts (type, the blocks of a page or the
     variants of a block, the composition pattern, the runtimes), the labels as links into the catalog, and the actions (full
     screen, similar ones in the catalog). A missing label says so ("no label"); nothing is filled in. -->
<script lang="ts">
  import { Badge, Block, Box, Button, Group, Link, List, ListItem, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { DetailView, StockText } from "../text";

  let { t, view, onfull }: { t: StockText; view: DetailView; onfull: () => void } = $props();
  const screen = $derived(view.type === "screen");
</script>

<Block tag="section" aria-labelledby="detail-title" class="ui8-summary" data-testid="detail-summary">
  <Stack gap="6" align="stretch">
    <Stack gap="2" align="start">
      <Group gap="2" align="center" class="ui8-detail-head">
        <Title as={1} size="2xl" weight="bold" id="detail-title" class="ui8-detail-title">{view.title}</Title>
        <Badge variant="secondary">{view.kind}</Badge>
      </Group>
      <Text tag="p" class="ui8-detail-subtitle">{view.subtitle}</Text>
    </Stack>

    <Stack gap="2" align="stretch">
      <Title as={2} size="sm" weight="semibold" class="ui8-summary-heading">{t.detail.summary.facts}</Title>
      <Box tag="dl" class="ui8-summary-facts" data-testid="detail-facts">
        <Box tag="dt" class="ui8-summary-term">{t.detail.summary.type}</Box>
        <Box tag="dd" class="ui8-summary-value">{view.kind}</Box>
        <Box tag="dt" class="ui8-summary-term">{screen ? t.detail.summary.blocks : t.detail.summary.variants}</Box>
        <Box tag="dd" class="ui8-summary-value" data-testid="detail-count">{view.parts.length}</Box>
        <Box tag="dt" class="ui8-summary-term">{t.detail.summary.pattern}</Box>
        <Box tag="dd" class="ui8-summary-value" data-facet="pattern">
          {#if view.pattern && view.pattern.values.length > 0}
            <Group gap="2" align="center" class="ui8-summary-badges">
              {#each view.pattern.values as v (v.id)}<Badge size="sm" variant={v.draft || view.pattern.draft ? "outline" : "secondary"}>{v.label}</Badge>{/each}
              {#if view.pattern.draft}<Text tag="span" size="xs" class="ui8-summary-muted">{t.detail.passport.draft}</Text>{/if}
            </Group>
          {:else}
            <Text tag="span" size="sm" class="ui8-summary-none" data-state="no-label">{t.detail.passport.noLabel}</Text>
          {/if}
        </Box>
        <Box tag="dt" class="ui8-summary-term">{t.detail.summary.runtimes}</Box>
        <Box tag="dd" class="ui8-summary-value" data-testid="detail-runtimes">
          {#if view.runtimes.length > 0}
            <Group gap="2" align="center" class="ui8-summary-badges">
              {#each view.runtimes as r (r.id)}<Badge size="sm" variant="outline">{r.label}</Badge>{/each}
            </Group>
          {:else}
            <Text tag="span" size="sm" class="ui8-summary-none" data-state="no-label">{t.detail.passport.noLabel}</Text>
          {/if}
        </Box>
      </Box>
    </Stack>

    {#if view.tags.length > 0}
      <Stack gap="2" align="stretch">
        <Title as={2} size="sm" weight="semibold" class="ui8-summary-heading">{t.detail.summary.tags}</Title>
        <List tag="ul" class="ui8-summary-tags" data-testid="detail-tags">
          {#each view.tags as tag (tag.key)}
            <ListItem><Link href={tag.href} size="sm" class="ui8-tag" data-draft={tag.draft ? "1" : "0"}>{tag.label}</Link></ListItem>
          {/each}
        </List>
      </Stack>
    {/if}

    <Stack gap="2" align="stretch" class="ui8-summary-actions" role="group" aria-label={t.detail.summary.actions}>
      <Button size="default" class="ui8-summary-action" onclick={onfull} data-testid="detail-open-full">
        <LucideIcon name="monitor-smartphone" size={16} />
        <Text tag="span">{t.detail.preview.full}</Text>
      </Button>
      {#each view.similarBy as s (s.id)}
        <Link href={s.href} size="sm" class="ui8-summary-link" data-testid={"detail-similar-" + s.id}>
          <LucideIcon name={s.id === "pattern" ? "layout-grid" : "layers"} size={16} />
          <Text tag="span">{s.id === "pattern" ? t.detail.summary.byPattern : s.id === "blocks" ? t.detail.summary.byBlocks : t.detail.summary.usedIn}</Text>
        </Link>
      {/each}
      <Link href={view.similarHref} size="sm" class="ui8-summary-link" data-testid="detail-find-similar">
        <LucideIcon name="search" size={16} />
        <Text tag="span">{t.detail.summary.findSimilar}</Text>
      </Link>
    </Stack>
  </Stack>
</Block>
