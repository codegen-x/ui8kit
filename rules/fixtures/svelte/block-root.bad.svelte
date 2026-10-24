<script lang="ts">
  // Self-test fixture of the rules group, detector block-root (violating).
  import { Block, Box, Button, Inline, Input, Text, Title } from "@codegen-x/svelte-compose";
  import { ui } from "@ui8kit/app-shared/content";
  let { open = false, ok = true, level = 2, tag = "h2", toggle = () => {} } = $props();
</script>

<Box>
  <Text>{ui.title}</Text>
</Box>
