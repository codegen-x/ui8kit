<!-- The heart: puts a style into (or takes it out of) the default collection "Recommended". A sibling of the card link, never inside it. -->
<script lang="ts">
  import ui from "../../content/ui.json";
  let { on, onclick, big = false }: { on: boolean; onclick: () => void; big?: boolean } = $props();
</script>

<button class="mg-heart" class:mg-heart-big={big} type="button" aria-pressed={on} aria-label={on ? ui.heart.remove : ui.heart.add} title={on ? ui.heart.remove : ui.heart.add} data-testid="heart" data-on={on ? "1" : "0"} {onclick}>
  <svg viewBox="0 0 24 24" width={big ? 24 : 18} height={big ? 24 : 18} aria-hidden="true" fill={on ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.3 5c2 0 3.5 1 4.5 2.6h.4C12.2 6 13.7 5 15.7 5 19 5 21.1 8.4 19.6 11.8 19.5 11.9 12 21 12 21Z" /></svg>
</button>
