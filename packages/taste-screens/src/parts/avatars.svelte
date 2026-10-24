<!-- A small overlapping stack of procedural avatars (flat discs in the skin's chart colours, no photos). -->
<script lang="ts">
  import { Box, Group } from "@codegen-x/svelte-compose";

  let { n = 3, size = 32 }: { n?: number; size?: number } = $props();
  const TONES = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--primary"];
</script>

<Group gap="0" class="items-center">
  {#each Array.from({ length: n }, (_, i) => i) as i (i)}
    <Box class={"inset-ring-2 inset-ring-card " + (i ? "-ml-2" : "")} style={`width:${size}px;height:${size}px;border-radius:50%;background:var(${TONES[i % TONES.length]})`} />
  {/each}
</Group>
