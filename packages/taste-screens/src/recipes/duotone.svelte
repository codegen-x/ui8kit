<!--
  Recipe "duotone": a picture in two skin colours. Even variants use the kit's base64 placeholder (MediaFrame) in grayscale
  (a gradient map: multiplied into a light tone, then lightened with a dark tone; both tones mixed from skin colours); odd variants paint a procedural landscape (sky, sun, two ridges) in the same two tones.
-->
<script lang="ts">
  import { Block, Box, MediaFrame } from "@ui8kit/svelte-ui";

  let { v = 0, alt = "", class: cls = "" }: { v?: number; alt?: string; class?: string } = $props();

  const TONES = [["--primary", "--chart-2"], ["--chart-1", "--chart-3"], ["--chart-5", "--chart-4"], ["--primary", "--chart-3"]];
  const tone = $derived(TONES[v % TONES.length]!);
</script>

<Block class={"relative overflow-hidden " + cls} style={`background:color-mix(in oklab, var(${tone[1]}) 35%, white)`}>
  {#if v % 2 === 0}
    <MediaFrame {alt} ratio="4/3" class="absolute inset-0 h-full grayscale brightness-50 contrast-200 mix-blend-multiply dark:brightness-200" />
    <Box class="absolute inset-0" style={`background:color-mix(in oklab, var(${tone[0]}) 70%, black);mix-blend-mode:lighten`} />
  {:else}
    <Box class="absolute inset-0" style={`background:linear-gradient(180deg, var(${tone[1]}) 0%, color-mix(in oklab, var(${tone[1]}) 40%, var(${tone[0]})) 70%)`} />
    <Box class="absolute" style={`left:62%;top:18%;width:22%;aspect-ratio:1;border-radius:50%;background:var(${tone[1]});box-shadow:0 0 0 24px color-mix(in oklab, var(${tone[1]}) 30%, transparent)`} />
    <Box class="absolute inset-0" style={`background:var(${tone[0]});opacity:.55;clip-path:polygon(0 72%, 22% 48%, 40% 66%, 58% 40%, 80% 62%, 100% 50%, 100% 100%, 0 100%)`} />
    <Box class="absolute inset-0" style={`background:var(${tone[0]});clip-path:polygon(0 86%, 30% 70%, 52% 82%, 74% 66%, 100% 80%, 100% 100%, 0 100%)`} />
  {/if}
</Block>
