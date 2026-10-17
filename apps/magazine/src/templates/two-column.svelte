<!-- Two columns: the article in the main column, an aside with related reading and topics beside it. -->
<script lang="ts">
  import { Block, ArticleBody, Card, CardContent, CardHeader, CardTitle, Inline, PostHeader } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} />
<div class="tp-cols tp-cols-2">
  <Block tag="main" id="tp-two-main" class="tp-col-main">
    <article aria-labelledby="tp-two-article-title">
      <PostHeader id="tp-two-article" post={d.posts[0]!} labels={d.ui.content.labels} layout="start" cover="show" meta="full" tone="default" />
      <ArticleBody id="tp-two-body" title={d.ui.vibe.article.title} sections={d.article} empty={d.ui.empty.sections} tocTitle={d.ui.vibe.article.toc} layout="column" quotes="show" tone="default" />
    </article>
  </Block>
  <aside class="tp-col-aside" aria-label={d.ui.vibe.posts.topics}>
    <Card>
      <CardHeader><CardTitle>{d.ui.vibe.posts.topics}</CardTitle></CardHeader>
      <CardContent>
        <ul class="tp-list">
          {#each d.topics as t (t.id)}<li><Inline>{t.title}</Inline></li>{/each}
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>{d.ui.content.posts.title}</CardTitle></CardHeader>
      <CardContent>
        <ul class="tp-list">
          {#each d.posts.slice(1, 5) as p (p.id)}<li><Inline>{p.title}</Inline><span class="tp-meta">{p.author}, {p.date}</span></li>{/each}
        </ul>
      </CardContent>
    </Card>
  </aside>
</div>
<Footer {c} layout="row" />
