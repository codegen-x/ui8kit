<!-- Blog: header, an introduction, the magazine grid of posts, a newsletter form and the footer. -->
<script lang="ts">
  import { Block, NewsletterForm, PageIntro, PostGrid } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} layout="split" />
<Block tag="main" id="tp-blog-main" class="tp-main">
  <PageIntro id="tp-blog-intro" title={d.ui.pages.contentBlog.home.title} text={d.ui.pages.contentBlog.home.text} cta={d.ui.pages.contentBlog.home.cta} href="#" align="start" tone="default" density="default" />
  <PostGrid
    id="tp-blog-posts"
    title={d.ui.content.posts.title}
    posts={d.posts}
    labels={d.ui.content.labels}
    filter={{ topics: d.topics, label: d.ui.vibe.posts.topics, topic: "", mode: "topics" }}
    action={{ label: d.ui.content.posts.action, href: "#" }}
    layout="magazine"
    cols="1-3"
    media="image"
    meta="full"
    tone="default"
    density="default"
  />
  <NewsletterForm id="tp-blog-news" title={d.ui.promo.newsletter.title} text={d.ui.promo.newsletter.text} label={d.ui.promo.newsletter.label} submit={d.ui.promo.newsletter.submit} consent={d.ui.promo.newsletter.consent} layout="stacked" terms="hide" tone="muted" align="center" />
</Block>
<Footer {c} />
