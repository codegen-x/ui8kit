<!-- Recipe "grain": a colour field (two or three skin colours) under monochrome film grain (an feTurbulence data URI). -->
<script lang="ts">
  import { Block, Box } from "@codegen-x/svelte-compose";

  let { v = 0, class: cls = "" }: { v?: number; class?: string } = $props();

  const NOISE =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const FIELDS = [
    "linear-gradient(135deg, var(--primary), var(--chart-2) 60%, var(--chart-3))",
    "radial-gradient(circle at 30% 30%, var(--chart-1), var(--primary) 55%, var(--foreground))",
    "linear-gradient(180deg, var(--chart-4), var(--accent) 50%, var(--chart-5))",
    "radial-gradient(ellipse at 70% 100%, var(--primary), var(--secondary) 70%)",
  ];
  const field = $derived(FIELDS[v % FIELDS.length]);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background:${field}`}>
  <Box class="absolute inset-0" style={`background-image:${NOISE};background-size:240px;mix-blend-mode:overlay;opacity:.7`} />
  <Box class="absolute inset-0" style={`background-image:${NOISE};background-size:180px;mix-blend-mode:soft-light;opacity:.5`} />
</Block>
