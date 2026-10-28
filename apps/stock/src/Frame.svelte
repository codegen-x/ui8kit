<!-- The frame document of the detail page (#/frame/<id>, loaded in its device frame): only the live render of the asset, in the
     visitor's Theme. It reads the Theme the page keeps on this device and follows every change the page makes (storage events);
     it never writes it. Its scroll is contained: a wheel over the frame never scrolls the page that holds it. -->
<script lang="ts">
  import { Box, LivePreview, Text } from "./lib/parts";
  import indexJson from "../content/assets.v0.json";
  import { TEXTS } from "./lib/i18n";
  import { visit } from "./lib/locale.svelte";
  import type { Index } from "./lib/model";
  import { loadPreview } from "./lib/preview";
  import { applyState, loadTheme } from "./lib/theme";

  let { id }: { id: string } = $props();
  const index = indexJson as unknown as Index;
  const asset = $derived(index.assets.find((a) => a.id === id));
  const t = TEXTS[visit.locale];

  // the wheel over the preview scrolls the preview only: at its end it does not run on into the page around the frame
  const CONTAIN = "overscroll-contain";
  $effect(() => {
    document.documentElement.classList.add(CONTAIN);
    return () => document.documentElement.classList.remove(CONTAIN);
  });
  $effect(() => {
    applyState(loadTheme(), false);
    const sync = (e: StorageEvent): void => { if (e.key === null || e.key.includes("theme")) applyState(loadTheme(), false); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  });
</script>

<Box class="min-h-screen bg-background text-foreground" data-testid="frame">
  {#if asset?.preview}
    {#await loadPreview(asset.preview, "fr-" + asset.id.replace(/[^a-z0-9]+/gi, "-"))}
      <Text tag="p" class="p-8 text-muted-foreground">{t.detail.preview.loading}</Text>
    {:then shown}
      <LivePreview parts={shown.parts} ctx={shown.ctx} />
    {:catch}
      <Text tag="p" class="p-8 text-muted-foreground">{t.card.failed}</Text>
    {/await}
  {:else}
    <Text tag="p" class="p-8 text-muted-foreground">{t.card.none}</Text>
  {/if}
</Box>
