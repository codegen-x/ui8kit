<!-- The application frame: the panorama (or, on #/screen/<id>, one live taste screen) and the theme corner. -->
<script lang="ts">
  import { Box } from "@ui8kit/svelte-ui";
  import PanoramaView from "./parts/panorama-view.svelte";
  import ScreenPreview from "./parts/screen-preview.svelte";
  import ThemeCorner from "./parts/theme-corner.svelte";

  let hash = $state(location.hash);
  const route = $derived(hash.match(/^#\/screen\/([a-z0-9-]+)(?:\/(\d+))?/));
</script>

<svelte:window onhashchange={() => (hash = location.hash)} />

<Box>
  <ThemeCorner />
  {#if route}
    <ScreenPreview id={route[1]!} slot={route[2] !== undefined ? Number(route[2]) : undefined} />
  {:else}
    <PanoramaView />
  {/if}
</Box>
