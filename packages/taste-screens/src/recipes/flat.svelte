<!-- Recipe "flat": big flat bold shapes, no blur, no gradient: a disc, a half disc, a bar and an arch in skin colours. -->
<script lang="ts">
  import { Block, Box } from "@codegen-x/svelte-compose";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const SETS = [
    { bg: "--chart-4", shapes: [
      { s: "left:-10%;top:-20%;width:70%;aspect-ratio:1;border-radius:50%", c: "--primary" },
      { s: "right:-8%;bottom:-30%;width:60%;aspect-ratio:2/1;border-radius:999px 999px 0 0", c: "--foreground" },
      { s: "left:40%;top:30%;width:14%;height:60%", c: "--chart-2" },
    ] },
    { bg: "--primary", shapes: [
      { s: "left:10%;bottom:0;width:80%;height:55%;border-radius:999px 999px 0 0", c: "--background" },
      { s: "left:38%;top:12%;width:24%;aspect-ratio:1;border-radius:50%", c: "--chart-1" },
    ] },
    { bg: "--secondary", shapes: [
      { s: "left:0;top:0;width:50%;height:100%", c: "--chart-3" },
      { s: "left:25%;top:20%;width:50%;aspect-ratio:1;border-radius:50%", c: "--primary" },
      { s: "right:6%;bottom:8%;width:18%;aspect-ratio:1", c: "--foreground" },
    ] },
    { bg: "--foreground", shapes: [
      { s: "left:-20%;top:15%;width:90%;aspect-ratio:1;border-radius:50%", c: "--primary" },
      { s: "right:8%;top:10%;width:30%;height:80%;border-radius:999px", c: "--chart-2" },
    ] },
  ];
  const set = $derived(SETS[v % SETS.length]!);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background:var(${set.bg})`}>
  {#each set.shapes as sh, i (i)}
    <Box class="absolute" style={`${sh.s};background:var(${sh.c})`} />
  {/each}
</Block>
