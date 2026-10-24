<script lang="ts">
  // Self-test fixture of the rules group, detector block-root, case loop (violating).
  import { Block, Stack, Text } from "@codegen-x/svelte-compose";
  import { ui } from "@ui8kit/app-shared/content";
  let { open = false, items = [] as string[] } = $props();
</script>

{#each items as item (item)}
  <Block tag="section">
    <Text>{item}</Text>
  </Block>
{/each}
