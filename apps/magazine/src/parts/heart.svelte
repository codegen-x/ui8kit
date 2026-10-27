<!-- The heart: puts a style into (or takes it out of) the default collection "Recommended" (@ui8kit/layouts/magazine/heart-toggle). -->
<script lang="ts">
  import HeartToggle from "@ui8kit/layouts/magazine/heart-toggle.svelte";
  import ui from "../../content/ui.json";
  let { on, onclick, big = false }: { on: boolean; onclick: () => void; big?: boolean } = $props();
</script>

<HeartToggle {on} {big} label={on ? ui.heart.remove : ui.heart.add} ontoggle={onclick} />
