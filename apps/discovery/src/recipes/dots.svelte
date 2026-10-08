<!-- Recipe "dots": a dot grid fading out (halftone by mask), with a large dot accent. -->
<script lang="ts">
  import { Block, Box } from "@ui8kit/svelte-ui";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const MASKS = [
    "radial-gradient(circle at 30% 40%, #000 0, transparent 70%)",
    "linear-gradient(90deg, #000, transparent)",
    "linear-gradient(0deg, #000 10%, transparent 90%)",
    "radial-gradient(circle at 80% 80%, #000 0, transparent 60%)",
  ];
  const STEP = [24, 16, 32, 20];
  const DOT = ["--primary", "--foreground", "--chart-2", "--chart-1"];
  const mask = $derived(MASKS[v % 4]);
  const step = $derived(STEP[v % 4]);
  const dot = $derived(DOT[v % 4]);
</script>

<Block class={"relative overflow-hidden " + cls} style="background:var(--card)">
  <Box
    class="absolute inset-0"
    style={`background-image:radial-gradient(circle, var(${dot}) 0 3px, transparent 3.5px);background-size:${step}px ${step}px;-webkit-mask-image:${mask};mask-image:${mask}`}
  />
  <Box class="absolute" style={`right:12%;top:18%;width:28%;aspect-ratio:1;border-radius:50%;background:var(${v % 2 ? "--primary" : "--chart-3"})`} />
</Block>
