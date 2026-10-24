<!-- Recipe "stripes": repeating bands: diagonal stripes, vertical bars of rising height, or a fine line field. -->
<script lang="ts">
  import { Block, Box, Group } from "@codegen-x/svelte-compose";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const BANDS = [
    "repeating-linear-gradient(135deg, var(--primary) 0 32px, var(--chart-2) 32px 64px, var(--background) 64px 96px)",
    "repeating-linear-gradient(90deg, var(--foreground) 0 2px, transparent 2px 16px)",
    "repeating-linear-gradient(0deg, var(--chart-1) 0 24px, var(--chart-3) 24px 48px, var(--chart-4) 48px 72px)",
  ];
  const bars = [30, 45, 38, 62, 54, 76, 70, 92];
</script>

<Block
  class={"relative overflow-hidden " + cls}
  style={v % 4 === 3 ? "background:var(--muted)" : `background-color:var(--secondary);background-image:${BANDS[v % 4]}`}
>
  {#if v % 4 === 3}
    <Group align="end" class="absolute inset-0 gap-4 px-8">
      {#each bars as h, i (i)}
        <Box class="flex-1 rounded" style={`height:${h}%;background:var(${i % 3 === 0 ? "--primary" : i % 3 === 1 ? "--chart-2" : "--chart-4"})`} />
      {/each}
    </Group>
  {/if}
</Block>
