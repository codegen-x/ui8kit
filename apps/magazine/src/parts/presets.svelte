<!-- #/presets: a read-only list of one preset per style saved in any collection, each copyable (a stub for `npx cgenx`). -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import { cliLine, presetOf } from "@ui8kit/taste-data/preset";
  import { allStyles, savedTokens } from "../lib/collections.svelte";
  import { withTokens } from "@ui8kit/theme-model/design";

  const items = $derived(allStyles().flatMap((k) => { const p = presetOf(k); return p ? [withTokens(p, savedTokens(k))] : []; }));
  let copied = $state("");
  async function copy(key: string, json: string): Promise<void> {
    try { await navigator.clipboard.writeText(json); } catch {
      const ta = document.createElement("textarea"); ta.value = json; ta.style.cssText = "position:fixed;left:-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    copied = key;
  }
</script>

<main id="main-content" class="mg-main" data-testid="magazine-presets">
  <p class="mg-crumbs"><a class="mg-link" href="#/">{ui.collections.back}</a></p>
  <h1 class="mg-h1">{ui.presets.heading}</h1>
  <p class="mg-note">{ui.presets.note}</p>
  {#if items.length === 0}
    <p class="mg-note" data-testid="presets-empty">{ui.presets.empty}</p>
  {:else}
    <ul class="mg-list">
      {#each items as p (p.style)}
        <li data-testid="preset" data-key={p.style}>
          <a class="mg-name mg-link" href={"#/style/" + p.style.replace(/\|/g, "~")}>{p.screen}</a>
          <code>{cliLine(p)}</code>
          <button class="mg-btn" type="button" onclick={() => copy(p.style, JSON.stringify(p, null, 2))}>{copied === p.style ? ui.presets.copied : ui.presets.copy}</button>
        </li>
      {/each}
    </ul>
  {/if}
</main>
