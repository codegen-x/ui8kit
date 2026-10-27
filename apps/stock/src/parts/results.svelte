<!-- The primary content: the results of the search (empty until the index exists). -->
<script lang="ts">
  import { Block, Stack, Text } from "@codegen-x/svelte-compose";
  import { ui } from "../lib/ui";
</script>

<Block tag="main" id="main-content" class="mx-auto w-full max-w-screen-2xl px-4 py-8" aria-label={ui.results.region}>
  <Stack gap="4" align="stretch">
    <Text class="text-muted-foreground" data-testid="results-empty">{ui.results.empty}</Text>
  </Stack>
</Block>
