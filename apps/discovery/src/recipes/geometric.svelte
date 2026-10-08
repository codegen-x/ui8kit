<!-- Recipe "geometric": a grid of primitive shapes (circle, quarter, half, triangle, square, diamond) in skin colours. -->
<script lang="ts">
  import { Block, Box, Grid } from "@ui8kit/svelte-ui";

  let { v = 0, cols = 4, rows = 3, class: cls = "" }: { v?: number; cols?: number; rows?: number; class?: string } = $props();

  const COLORS = ["--primary", "--chart-2", "--chart-3", "--foreground", "--chart-1", "--accent", "--chart-4", "--secondary"];
  const SHAPES = [
    "border-radius:50%",
    "border-radius:100% 0 0 0",
    "border-radius:0 0 100% 100% / 0 0 100% 100%",
    "clip-path:polygon(50% 0, 100% 100%, 0 100%)",
    "",
    "clip-path:polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
    "border-radius:0 100% 0 0",
    "border-radius:50% 50% 0 0",
  ];
  const cells = $derived(
    Array.from({ length: cols * rows }, (_, i) => {
      const k = (i * 7 + v * 5 + Math.floor(i / cols) * 3) % SHAPES.length;
      const c = (i * 3 + v * 2) % COLORS.length;
      const bg = (i + v) % 3 === 0 ? `var(${COLORS[(c + 4) % COLORS.length]})` : "transparent";
      return { shape: SHAPES[k], color: COLORS[c], bg };
    })
  );
</script>

<Block class={"relative overflow-hidden " + cls} style="background:var(--muted)">
  <Grid class="absolute inset-0 gap-0" style={`grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)`}>
    {#each cells as c, i (i)}
      <Box class="relative" style={`background:${c.bg}`}>
        <Box class="absolute inset-0" style={`background:var(${c.color});${c.shape}`} />
      </Box>
    {/each}
  </Grid>
</Block>
