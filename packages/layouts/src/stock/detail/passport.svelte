<!-- The passport of an asset (the body's narrow column): every facet of its type with its labels, read-only (labelling is the
     cabinet's): a draft badge on weak labels and an explicit "no label" where nothing applies (no fallback value); then a calm note
     that the code and the data are available by role (the public build holds neither: apps/stock/scripts/public-build.test.ts). -->
<script lang="ts">
  import { Badge, Block, Box, Group, LucideIcon, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import type { DetailView, StockText } from "../text";

  let { t, view }: { t: StockText; view: DetailView } = $props();
</script>

<Block tag="aside" aria-labelledby="detail-passport-title" class="ui8-passport" data-testid="passport">
  <Stack gap="6" align="stretch">
    <Stack gap="2" align="start">
      <Title as={2} size="xl" weight="semibold" id="detail-passport-title">{t.detail.passport.title}</Title>
      <Text tag="p" size="sm" class="ui8-passport-muted">{t.detail.passport.readonly}</Text>
    </Stack>
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
    <Box class="ui8-passport-access" data-testid="passport-access">
      <Group gap="2" align="center">
        <LucideIcon name="lock" size={16} />
        <Text tag="span" size="sm" weight="semibold">{t.detail.passport.access}</Text>
      </Group>
      <Text tag="p" size="sm" class="ui8-passport-muted">{t.detail.passport.accessText}</Text>
    </Box>
  </Stack>
</Block>
