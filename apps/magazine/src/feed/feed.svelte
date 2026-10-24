<!-- The magazine home: the tuned feed. Taste bar, then sections in order (closest, same structure, opposite, unexpected pages),
     with marketplace inserts (templates, design system, series, video) between them. The tune lives in src/lib/tune.svelte.ts. -->
<script lang="ts">
  import { Block, Box, Button, Text, Title } from "@codegen-x/svelte-compose";
  import { encodePicks, type StyleKey } from "@ui8kit/taste-data/picks";
  import ui from "../../content/ui.json";
  import { closest, insertAt, opposite, structure, unexpectedPages } from "../lib/feed";
  import { tuning } from "../lib/tune.svelte";
  import FeedInsert from "./feed-insert.svelte";
  import FeedPage from "./feed-page.svelte";
  import FeedSection from "./feed-section.svelte";
  import StructureSection from "./structure-section.svelte";
  import TasteBar from "./taste-bar.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const tune = $derived(tuning.tune!);
  const near = $derived(closest(tune));
  const same = $derived(structure(tune));
  const far = $derived(opposite(tune));
  const pages = $derived(Math.min(tuning.pages, unexpectedPages(tune)));
  const lead = $derived(near[0]?.key ?? picks[0]!);
  const S = ui.feed.sections;
</script>

<Block tag="main" id="main-content" class="mg-main" data-testid="magazine-home">
  <Title as={1} class="mg-h1">{ui.feed.heading}</Title>
  <Text class="mg-note">{ui.feed.lead}</Text>
  <TasteBar />
  <FeedSection id="closest" title={S.closest.title} note={S.closest.note} cards={near} />
  <StructureSection cards={same} />
  <FeedInsert insert={insertAt(0, lead, (k) => encodePicks([k]))} />
  <FeedSection id="opposite" title={S.opposite.title} note={S.opposite.note} cards={far} />
  <FeedInsert insert={insertAt(1, lead, (k) => encodePicks([k]))} />
  {#each Array.from({ length: pages }, (_, i) => i) as page (page)}
    <FeedPage {tune} {page} insert={insertAt(page + 2, near[(page + 1) % near.length]?.key ?? lead, (k) => encodePicks([k]))} />
  {/each}
  <Box class="mg-more">
    {#if pages < unexpectedPages(tune)}
      <Button variant="outline" onclick={() => (tuning.pages += 1)} data-testid="feed-more">{ui.feed.more}</Button>
    {:else}
      <Text class="mg-note">{ui.feed.end}</Text>
    {/if}
  </Box>
</Block>
