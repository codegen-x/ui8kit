<!-- Home: the recommendations for the picks (rows come in stage 3). -->
<script lang="ts">
  import ui from "../../content/ui.json";
  import type { StyleKey } from "@ui8kit/taste-data/picks";

  let { picks }: { picks: StyleKey[] } = $props();
</script>

<main id="main-content" class="mg-main" data-testid="magazine-home">
  <h1 class="mg-h1">{ui.home.heading}</h1>
  <p class="mg-note">{picks.length}</p>
</main>
