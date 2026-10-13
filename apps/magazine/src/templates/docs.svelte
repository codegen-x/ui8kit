<!-- Documentation: a search header, a sidebar with the outline, breadcrumbs, an article with its own table of contents and a help aside. -->
<script lang="ts">
  import { Block, ArticleBody, Card, CardContent, CardHeader, CardTitle, Link, PageTrail, SidebarNav } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} layout="search" />
<div class="tp-cols tp-cols-docs">
  <div class="tp-col-left">
    <SidebarNav label={d.ui.vibe.sidebar.label} brand={c.brand} links={d.outline} current={d.outline[0]?.id} userName={d.ui.vibe.sidebar.userName} userEmail={d.ui.vibe.sidebar.userEmail} width="full" user="hide" density="compact" />
  </div>
  <Block tag="main" id="tp-docs-main" class="tp-col-main">
    <PageTrail id="tp-docs-trail" title={c.title} lead={c.lead} badge={c.eyebrow} label={d.ui.marketing.pageTrail.label} crumbs={d.crumbs} extras={{ value: d.ui.marketing.pageTrail.value, caption: d.ui.marketing.pageTrail.caption, note: d.ui.marketing.pageTrail.note, icon: "book-open", facts: d.stats.slice(0, 3) }} aside="none" tone="default" />
    <article>
      <ArticleBody id="tp-docs-body" title={d.ui.vibe.article.title} sections={d.article} tocTitle={d.ui.vibe.article.toc} layout="toc" quotes="show" tone="default" />
    </article>
  </Block>
  <aside class="tp-col-aside" aria-label={d.ui.vibe.sidebar.label}>
    <Card>
      <CardHeader><CardTitle>{c.eyebrow}</CardTitle></CardHeader>
      <CardContent>
        <ul class="tp-list">
          {#each d.helplinks as l (l.id)}<li><Link href="#">{l.name}</Link></li>{/each}
        </ul>
      </CardContent>
    </Card>
  </aside>
</div>
<Footer {c} layout="row" />
