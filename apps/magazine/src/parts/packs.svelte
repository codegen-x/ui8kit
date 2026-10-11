<!-- #/packs: a read-only list over the collections; a pack is a collection with the skins, fonts and radii it holds. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import { parseStyleKey } from "@ui8kit/taste-data/picks";
  import { lib } from "../lib/collections.svelte";

  const uniq = (xs: (string | number)[]) => [...new Set(xs)];
  const facts = (styles: string[]) => {
    const ps = styles.flatMap((k) => { const p = parseStyleKey(k); return p ? [p] : []; });
    return { skins: uniq(ps.map((p) => p.skin)), fonts: uniq(ps.map((p) => p.fonts.body)), radii: uniq(ps.map((p) => p.radius)).sort((a, b) => Number(a) - Number(b)) };
  };
</script>

<main id="main-content" class="mg-main" data-testid="magazine-packs">
  <p class="mg-crumbs"><a class="mg-link" href="#/">{ui.collections.back}</a></p>
  <h1 class="mg-h1">{ui.packs.heading}</h1>
  <p class="mg-note">{ui.packs.note}</p>
  <ul class="mg-list">
    {#each lib.collections as c (c.id)}
      {@const f = facts(c.styles)}
      <li data-testid="pack" data-id={c.id}>
        <a class="mg-name mg-link" href={"#/collection/" + c.id}>{c.title}</a>
        <span class="mg-note">{c.styles.length} {ui.collections.count} · {ui.collections.kind[c.kind]}</span>
        {#if c.styles.length}
          <p class="mg-chips"><span>{ui.packs.skins}: {f.skins.join(", ")}</span><span>{ui.packs.fonts}: {f.fonts.join(", ")}</span><span>{ui.packs.radii}: {f.radii.join(", ")}</span></p>
        {/if}
      </li>
    {/each}
  </ul>
</main>
