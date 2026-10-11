<!-- Three columns: navigation on the left, the content in the middle, an aside with figures and activity on the right. -->
<script lang="ts">
  import { ArticleBody, Card, CardContent, CardHeader, CardTitle, Link, PostHeader, SidebarNav } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<div class="tp-page" data-template="three-column">
  <Header {c} layout="search" />
  <div class="tp-cols tp-cols-3">
    <div class="tp-col-left">
      <SidebarNav label={d.ui.vibe.sidebar.label} brand={c.brand} links={d.sidenav} current="item-overview" userName={d.ui.vibe.sidebar.userName} userEmail={d.ui.vibe.sidebar.userEmail} width="full" user="hide" density="default" />
    </div>
    <main id="tp-three-main" class="tp-col-main">
      <article>
        <PostHeader id="tp-three-article" post={d.posts[1]!} labels={d.ui.content.labels} layout="start" cover="hide" meta="short" tone="default" />
        <ArticleBody id="tp-three-body" title={d.ui.vibe.article.title} sections={d.article.slice(0, 3)} tocTitle={d.ui.vibe.article.toc} layout="column" quotes="hide" tone="default" />
      </article>
    </main>
    <aside class="tp-col-aside" aria-label={d.ui.dashboard.activity.title}>
      <Card>
        <CardHeader><CardTitle>{d.ui.dashboard.activity.title}</CardTitle></CardHeader>
        <CardContent>
          <ul class="tp-list">
            {#each d.activity.slice(0, 4) as e (e.id)}<li><span class="tp-strong">{e.title}</span><span class="tp-meta">{e.text}</span></li>{/each}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{d.ui.content.posts.title}</CardTitle></CardHeader>
        <CardContent>
          <ul class="tp-list">
            {#each d.posts.slice(2, 5) as p (p.id)}<li><Link href="#">{p.title}</Link></li>{/each}
          </ul>
        </CardContent>
      </Card>
    </aside>
  </div>
  <Footer {c} layout="row" />
</div>
