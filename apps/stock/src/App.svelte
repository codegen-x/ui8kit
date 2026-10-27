<!-- The application frame: the header with the search, then the storefront. -->
<script lang="ts">
  import { Block } from "@codegen-x/svelte-compose";
  import { initTheme } from "@ui8kit/app-shared/runtime/theme";
  import SiteHeader from "./parts/site-header.svelte";
  import Results from "./parts/results.svelte";

  initTheme("dark");
</script>

<Block class="min-h-screen bg-background text-foreground">
  <SiteHeader />
  <Results />
</Block>
