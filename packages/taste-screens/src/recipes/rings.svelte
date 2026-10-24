<!-- Recipe "rings": concentric rings and orbits (repeating radial gradients and outlined circles) with a planet or two. -->
<script lang="ts">
  import { Block, Box } from "@codegen-x/svelte-compose";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const CENTERS = ["50% 50%", "100% 100%", "0% 50%", "70% 30%"];
  const center = $derived(CENTERS[v % CENTERS.length]);
  const ring = $derived(v % 2 === 0 ? "--primary" : "--chart-2");
</script>

<Block
  class={"relative overflow-hidden " + cls}
  style={`background-color:var(--card);background-image:repeating-radial-gradient(circle at ${center}, transparent 0 22px, color-mix(in oklab, var(${ring}) 55%, transparent) 22px 24px)`}
>
  <Box class="absolute" style={`left:50%;top:50%;width:46%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle at 35% 30%, var(--chart-1), var(${ring}) 70%)`} />
  <Box class="absolute" style={`left:50%;top:50%;width:78%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) rotate(${v * 20}deg);box-shadow:inset 0 0 0 2px var(--foreground)`}>
    <Box class="absolute" style="left:84%;top:16%;width:9%;aspect-ratio:1;border-radius:50%;background:var(--chart-3)" />
  </Box>
</Block>
