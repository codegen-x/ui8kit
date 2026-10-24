<!-- One page of the catalogue below the top sections: unexpected combinations, then an insert from another category. -->
<script lang="ts">
  import { Box } from "@codegen-x/svelte-compose";
  import ui from "../../content/ui.json";
  import { unexpected, type Insert, type Tune } from "../lib/feed";
  import FeedInsert from "./feed-insert.svelte";
  import FeedSection from "./feed-section.svelte";

  let { tune, page, insert }: { tune: Tune; page: number; insert: Insert } = $props();
  const S = ui.feed.sections.unexpected;
</script>

<Box data-testid="feed-page" data-page={page}>
  <FeedSection id={"unexpected-" + page} title={S.title} note={S.note} label={ui.feed.pageLabel.replace("{title}", S.title).replace("{n}", String(page + 1))} cards={unexpected(tune, page)} />
  <FeedInsert {insert} />
</Box>
