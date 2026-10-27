<!-- #/collection/<id>: the styles saved in one collection (local only), each a card with its heart; the page is
     @ui8kit/layouts/magazine/collection-view. -->
<script lang="ts">
  import CollectionView from "@ui8kit/layouts/magazine/collection-view.svelte";
  import ui from "../../content/ui.json";
  import { styleOf } from "@ui8kit/taste-data/recommend";
  import { collectionOf } from "../lib/collections.svelte";
  import Card from "./card.svelte";

  let { id }: { id: string } = $props();
  const c = $derived(collectionOf(id));
  const cards = $derived((c?.styles ?? []).flatMap((k) => { const s = styleOf(k); return s ? [s] : []; }));
</script>

<CollectionView {id} backLabel={ui.collections.back} backHref="#/" title={c ? c.title : ui.collections.missing} found={!!c} count={`${cards.length} ${ui.collections.count}`} empty={cards.length === 0 ? ui.collections.empty : undefined}>
  {#each cards as s (s.key)}
    <Card card={s} fill />
  {/each}
</CollectionView>
