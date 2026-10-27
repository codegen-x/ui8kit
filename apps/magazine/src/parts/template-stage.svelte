<!--
  One template at desktop width (1440), live in the page DOM and scaled to the box (no iframe, no container query). The skin, the one
  font and the radius are CSS variables on the frame, so changing them re-skins the page with no rebuild. The preview is inert and
  hidden from assistive technology: it shows a design, it is not a page to use.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { tokenAttrs, tokenStyle, type Tokens } from "@ui8kit/theme-model/design";
  import type { TemplateDef } from "../templates/registry";

  let { template, c, skin, font, radius, tokens = {}, label }: { template: TemplateDef; c: Deck; skin: string; font: FontId; radius: number; tokens?: Tokens; label: string } = $props();

  let box = $state<HTMLElement | null>(null);
  let frame = $state<HTMLElement | null>(null);
  let width = $state(960);
  let height = $state(1080);
  const style = $derived(`--radius:${radius}px;--font-sans:${family(font)},sans-serif;--taste-heading:${family(font)},sans-serif;${tokenStyle(tokens)}`);
  const attrs = $derived(tokenAttrs(tokens));
  const Page = $derived(template.component);

  onMount(() => {
    const ro = new ResizeObserver(() => {
      width = box?.clientWidth || width;
      height = frame?.offsetHeight || height;
    });
    if (box) ro.observe(box);
    if (frame) ro.observe(frame);
    return () => ro.disconnect();
  });
</script>

<div class="tp-box" bind:this={box} style:height={`${height * (width / 1440)}px`} data-testid="template-stage" data-template={template.id} data-skin={skin} role="img" aria-label={label}>
  <div class="tp-frame tp-page" bind:this={frame} data-skin={skin} {style} {...attrs} style:transform={`scale(${width / 1440})`} inert aria-hidden="true">
    <Page {c} />
  </div>
</div>
