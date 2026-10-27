<!-- One taste card: the frame of a 1440 × 1080 taste screen at 4:3 (a snapshot image, or the live screen scaled to the frame, or
     just the skin's background while neither is there), a caption and the line that says why the card is here; the heart comes in
     as a snippet, beside the link. `fit`: "strip" grows from 200 to 360 px in a row, "fill" takes its grid cell, "mini" is the
     frame alone. The frame keeps the page's corner; the skin of the style is on the inner box, and data-own-design marks the
     boundary where the app stops its global per-element tokens. -->
<script lang="ts" module>
  let next = 0;
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { Box, Image, LinkPlain, Text } from "@codegen-x/svelte-compose";
  import { observeShot, SHOT_WIDTH } from "./shot";

  let { href, label, styleKey, skin, fit = "strip", caption = "", why = "", shot = "", live = false, stage, heart, onvisible }: {
    href: string; /** the accessible name of the link */ label: string; styleKey: string; skin: string;
    fit?: "strip" | "fill" | "mini"; caption?: string; why?: string; /** a snapshot URL */ shot?: string; live?: boolean;
    /** the live screen, rendered only while `live` and no snapshot */ stage?: Snippet; heart?: Snippet; onvisible: (visible: boolean) => void;
  } = $props();

  const id = "taste-shot-" + ++next;
  const cell = $derived(fit === "strip" ? "relative min-w-50 max-w-90 shrink-0 grow basis-50" : fit === "fill" ? "relative w-full min-w-0" : "relative w-full min-w-0 flex-none");
  $effect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    return observeShot(el, SHOT_WIDTH, (v) => onvisible(v));
  });
</script>

<Box class={cell}>
  <LinkPlain {href} class="group flex w-full flex-col gap-2 text-inherit no-underline" aria-label={label} data-testid="card" data-key={styleKey} data-live={live ? "1" : "0"} data-shot={shot ? "1" : "0"}>
    <Box tag="span" {id} class="relative block aspect-4/3 w-full overflow-hidden rounded border border-border group-hover:outline-2 group-hover:outline-offset-2 group-hover:outline-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring" data-own-design>
      <Box tag="span" class="absolute inset-0 block bg-background" data-skin={skin}>
        {#if shot}
          <Image src={shot} alt="" draggable="false" class="size-full object-cover" />
        {:else if live && stage}
          <Box tag="span" class="ui8-taste-stage" inert aria-hidden="true" data-testid="card-live">{@render stage()}</Box>
        {/if}
      </Box>
    </Box>
    {#if fit !== "mini"}
      <Text tag="span" class="block min-h-4 truncate text-xs text-muted-foreground">{caption}</Text>
      {#if why}<Text tag="span" class="block truncate text-xs leading-4 text-foreground" data-testid="why">{why}</Text>{/if}
    {/if}
  </LinkPlain>
  {#if fit !== "mini" && heart}{@render heart()}{/if}
</Box>
