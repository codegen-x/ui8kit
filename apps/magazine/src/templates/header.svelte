<!-- The page header of every template: the kit's NavBar (a <header> with its <nav>), the deck's wordmark and links. -->
<script lang="ts">
  import { NavBar } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { ui } from "./data";

  let { c, layout = "inline", cta = false }: { c: Deck; layout?: "inline" | "split" | "search"; cta?: boolean } = $props();
  const links = $derived(c.nav.slice(0, 5).map((name, i) => ({ id: `n${i}`, name, icon: "link", href: "#" })));
</script>

<NavBar
  label={ui.vibe.nav.label}
  brand={c.brand}
  {links}
  current="n0"
  actions={cta ? { mode: "cta", cta: c.cta, href: "#" } : { mode: "none" }}
  search={{ label: ui.vibe.nav.search, shortcut: ui.vibe.nav.shortcut }}
  {layout}
/>
