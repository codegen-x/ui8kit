<!-- Pages, not an endless feed: previous, a window of page links and next. Links are real hrefs (the app routes by hash), the current
     page is plain text marked aria-current. -->
<script lang="ts">
  import { Box, Button, LucideIcon, Text } from "@codegen-x/svelte-compose";
  import { pageWindow } from "@ui8kit/facet-search";
  import { fmt, type StockText } from "./text";

  let { t, page, pages, href }: { t: StockText; page: number; pages: number; href: (page: number) => string } = $props();
  const window_ = $derived(pageWindow(page, pages));
</script>

{#if pages > 1}
  <Box tag="nav" aria-label={t.pagination.label} class="flex flex-wrap items-center justify-center gap-2 pt-8" data-testid="pagination">
    {#if page > 1}
      <Button variant="outline" size="sm" href={href(page - 1)} rel="prev" class="gap-2" data-testid="page-prev"><LucideIcon name="chevron-left" size={16} /><Text tag="span">{t.pagination.prev}</Text></Button>
    {/if}
    {#each window_ as n, i (i)}
      {#if n === null}
        <Text tag="span" class="px-2 text-muted-foreground" aria-hidden="true">…</Text>
      {:else if n === page}
        <Text tag="span" weight="semibold" class="inline-flex h-8 min-w-8 items-center justify-center rounded bg-primary px-2 text-sm text-primary-foreground" aria-current="page" data-testid="page-current">{n}</Text>
      {:else}
        <Button variant="ghost" size="sm" href={href(n)} aria-label={fmt(t.pagination.page, { n })} data-testid={"page-" + n}>{n}</Button>
      {/if}
    {/each}
    {#if page < pages}
      <Button variant="outline" size="sm" href={href(page + 1)} rel="next" class="gap-2" data-testid="page-next"><Text tag="span">{t.pagination.next}</Text><LucideIcon name="chevron-right" size={16} /></Button>
    {/if}
  </Box>
{/if}
