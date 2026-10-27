<!-- The heart: puts a style into (or takes it out of) a collection. A checkbox in its label (the label is the 32 px target, the box
     is visually hidden), so the state is the control's own checked state; on a card it sits in the top right corner, a sibling of
     the card's link, never inside it. `big` is the standalone 40 px one. -->
<script lang="ts">
  import { Checkbox, Label, LucideIcon } from "@codegen-x/svelte-compose";

  let { on, label, big = false, ontoggle }: { on: boolean; /** the action it does now (add or remove) */ label: string; big?: boolean; ontoggle: () => void } = $props();
  const place = $derived(big ? "size-10" : "absolute top-2 right-2 z-10 size-8");
</script>

<Label class={"inline-flex cursor-pointer items-center justify-center rounded border border-border bg-background text-foreground opacity-90 hover:opacity-100 has-checked:border-primary has-checked:text-primary has-checked:opacity-100 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring " + place} title={label} data-testid="heart" data-on={on ? "1" : "0"}>
  <Checkbox class="sr-only" checked={on} onchange={ontoggle} aria-label={label} />
  <LucideIcon name="heart" size={big ? 24 : 16} class={on ? "fill-current" : ""} />
</Label>
