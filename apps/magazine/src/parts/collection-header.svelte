<!--
  The collection header of the home: "Collection based on your N styles", a compact strip of the picks (each opens its style) and a small
  legend of the words a recommended card uses for why it is there (packages/taste-data/src/recommend/why.ts). The header is
  @ui8kit/layouts/magazine/collection-header.
-->
<script lang="ts">
  import CollectionHeader from "@ui8kit/layouts/magazine/collection-header.svelte";
  import { whyLegend } from "@ui8kit/taste-data/recommend";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { styleOf } from "@ui8kit/taste-data/recommend";
  import ui from "../../content/ui.json";
  import Card from "./card.svelte";

  let { picks }: { picks: StyleKey[] } = $props();
  const styles = $derived(picks.flatMap((k) => { const s = styleOf(k); return s ? [s] : []; }));
  const byKey = $derived(new Map(styles.map((s) => [s.key, s])));
  const legend = whyLegend();
  const H = ui.home.collection;
</script>

<CollectionHeader title={H.title.replace("{n}", String(styles.length))} note={H.note} stripLabel={H.strip} legendTitle={H.legend} legendNote={H.legendNote} keys={styles.map((s) => s.key)} {legend}>
  {#snippet pick(key)}<Card card={byKey.get(key)!} compact />{/snippet}
</CollectionHeader>
