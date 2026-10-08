<!-- Recipe "mesh": mesh-blur blobs. Soft radial fields of the skin's chart and primary colours, plus blurred orbs. -->
<script lang="ts">
  import { Block, Box } from "@ui8kit/svelte-ui";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const FIELDS = [
    "radial-gradient(at 18% 22%, var(--chart-1) 0, transparent 52%), radial-gradient(at 82% 18%, var(--primary) 0, transparent 48%), radial-gradient(at 62% 86%, var(--chart-3) 0, transparent 55%), radial-gradient(at 12% 92%, var(--chart-2) 0, transparent 45%)",
    "radial-gradient(at 70% 30%, var(--primary) 0, transparent 50%), radial-gradient(at 30% 70%, var(--chart-4) 0, transparent 55%), radial-gradient(at 90% 90%, var(--chart-2) 0, transparent 40%)",
    "radial-gradient(at 50% 0%, var(--chart-5) 0, transparent 60%), radial-gradient(at 0% 100%, var(--primary) 0, transparent 55%), radial-gradient(at 100% 100%, var(--chart-1) 0, transparent 55%)",
    "radial-gradient(at 25% 40%, var(--accent) 0, transparent 50%), radial-gradient(at 75% 55%, var(--primary) 0, transparent 45%), radial-gradient(at 45% 95%, var(--chart-3) 0, transparent 50%), radial-gradient(at 95% 5%, var(--chart-4) 0, transparent 40%)",
  ];
  const ORBS = [
    [{ x: 28, y: 36, s: 46, c: "--chart-2" }, { x: 72, y: 62, s: 52, c: "--primary" }],
    [{ x: 60, y: 30, s: 40, c: "--chart-1" }, { x: 30, y: 72, s: 36, c: "--chart-3" }, { x: 84, y: 80, s: 30, c: "--accent" }],
    [{ x: 50, y: 50, s: 60, c: "--primary" }],
    [{ x: 20, y: 80, s: 44, c: "--chart-5" }, { x: 78, y: 24, s: 48, c: "--chart-2" }],
  ];
  const field = $derived(FIELDS[v % FIELDS.length]);
  const orbs = $derived(ORBS[v % ORBS.length] ?? []);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background-color:var(--muted);background-image:${field}`}>
  {#each orbs as o, i (i)}
    <Box
      class="absolute"
      style={`left:${o.x}%;top:${o.y}%;width:${o.s}%;aspect-ratio:1;border-radius:50%;background:var(${o.c});filter:blur(64px);opacity:.8;transform:translate(-50%,-50%)`}
    />
  {/each}
</Block>
