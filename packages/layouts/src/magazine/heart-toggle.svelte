<!-- The heart: puts a style into (or takes it out of) a collection. A checkbox in its label (the label is the 32 px target, the box
     is transparent and out of the flow, so no class of it meets one of the kit checkbox), so the state is the control's own checked state; on a card it sits in the top right corner, a sibling of
     the card's link, never inside it. `big` is the standalone 40 px one. -->
<script lang="ts">
  import { Checkbox, Label, LucideIcon } from "@codegen-x/svelte-compose";

  let { on, label, big = false, ontoggle }: { on: boolean; /** the action it does now (add or remove) */ label: string; big?: boolean; ontoggle: () => void } = $props();
  const place = $derived(big ? "ui8-heart-big" : "ui8-heart");
</script>

<Label class={place} title={label} data-testid="heart" data-on={on ? "1" : "0"}>
  <Checkbox class="ui8-heart-input" checked={on} onchange={ontoggle} aria-label={label} />
  <LucideIcon name="heart" size={big ? 24 : 16} class={on ? "ui8-heart-icon-on" : ""} />
</Label>
