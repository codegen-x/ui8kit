<!-- Recipe "glass": frosted panels (backdrop blur, a hairline of light) floating over a glow of the primary colour. -->
<script lang="ts">
  import { Block, Box } from "@ui8kit/svelte-ui";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const GLOWS = [
    "radial-gradient(circle at 35% 40%, var(--primary) 0, transparent 45%), radial-gradient(circle at 70% 65%, var(--chart-2) 0, transparent 40%)",
    "radial-gradient(circle at 60% 30%, var(--chart-1) 0, transparent 40%), radial-gradient(circle at 30% 75%, var(--primary) 0, transparent 45%)",
    "radial-gradient(circle at 50% 50%, var(--primary) 0, transparent 55%)",
    "radial-gradient(circle at 25% 25%, var(--chart-4) 0, transparent 40%), radial-gradient(circle at 80% 70%, var(--chart-3) 0, transparent 45%)",
  ];
  const PANELS = [
    [{ x: 18, y: 22, w: 52, h: 46, r: -4 }, { x: 44, y: 46, w: 40, h: 36, r: 3 }],
    [{ x: 12, y: 30, w: 76, h: 40, r: 0 }],
    [{ x: 24, y: 14, w: 36, h: 72, r: -6 }, { x: 52, y: 26, w: 30, h: 52, r: 5 }],
    [{ x: 10, y: 12, w: 38, h: 34, r: 0 }, { x: 52, y: 24, w: 38, h: 34, r: 0 }, { x: 30, y: 56, w: 40, h: 32, r: 0 }],
  ];
  const glow = $derived(GLOWS[v % GLOWS.length]);
  const panels = $derived(PANELS[v % PANELS.length] ?? []);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background-color:var(--background);background-image:${glow}`}>
  {#each panels as p, i (i)}
    <Box
      class="absolute rounded"
      style={`left:${p.x}%;top:${p.y}%;width:${p.w}%;height:${p.h}%;transform:rotate(${p.r}deg);background:color-mix(in oklab, var(--background) 28%, transparent);backdrop-filter:blur(24px);box-shadow:inset 0 0 0 1px color-mix(in oklab, var(--foreground) 18%, transparent), 0 0 64px color-mix(in oklab, var(--primary) 45%, transparent)`}
    />
  {/each}
</Block>
