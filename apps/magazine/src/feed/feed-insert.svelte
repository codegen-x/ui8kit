<!-- A marketplace insert between feed sections: a banner for another category (templates, design system, series, video); the banner
     is @ui8kit/layouts/magazine/feed-insert. -->
<script lang="ts">
  import FeedInsert from "@ui8kit/layouts/magazine/feed-insert.svelte";
  import ui from "../../content/ui.json";
  import type { Insert } from "../lib/feed";

  let { insert }: { insert: Insert } = $props();
  const c = $derived(ui.feed.inserts[insert.kind]);
</script>

<FeedInsert eyebrow={c.eyebrow} title={c.title} body={c.body} cta={c.cta} href={insert.href} data-testid="feed-insert" data-kind={insert.kind} />
