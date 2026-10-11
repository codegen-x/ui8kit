<!-- Recipe "conic": conic sweeps: a sunburst of rays, a colour wheel, or a soft spotlight. -->
<script lang="ts">
  import { Block, Box } from "@ui8kit/svelte-ui";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const FIELDS = [
    "repeating-conic-gradient(from 0deg at 50% 110%, var(--primary) 0 6deg, var(--background) 6deg 12deg)",
    "conic-gradient(from 210deg at 50% 50%, var(--chart-1), var(--chart-2), var(--chart-3), var(--chart-4), var(--chart-5), var(--chart-1))",
    "conic-gradient(from 180deg at 50% 0%, var(--chart-1) 0deg, transparent 32deg 328deg, var(--chart-1) 360deg)",
    "repeating-conic-gradient(from 45deg at 0% 0%, var(--chart-2) 0 4deg, var(--secondary) 4deg 9deg)",
  ];
  const field = $derived(FIELDS[v % 4]);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background-color:${v % 4 === 2 ? "transparent" : "var(--muted)"};background-image:${field}`}>
  {#if v % 4 === 1}
    <Box class="absolute" style="left:50%;top:50%;width:46%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:var(--background)" />
  {/if}
</Block>
