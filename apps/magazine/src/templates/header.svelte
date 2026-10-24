<!-- The page header of every template: the kit's NavBar (a <header> with its <nav>), the deck's wordmark and the main menu
     (Codex menu_item entries; the magazine routes nothing, so the brand and the items are text, not links). -->
<script lang="ts">
  import { NavBar } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { ui } from "./data";
  import { dataFor } from "./registry-data";

  let { c, layout = "inline", cta = false }: { c: Deck; layout?: "inline" | "split" | "search"; cta?: boolean } = $props();
  const links = $derived(dataFor(c.brand).navlinks);
</script>

<NavBar
  label={ui.vibe.nav.label}
  brand={c.brand}
  {links}
  current={links[0]?.id ?? ""}
  actions={cta ? { mode: "cta", cta: c.cta } : { mode: "none" }}
  search={{ label: ui.vibe.nav.search, shortcut: ui.vibe.nav.shortcut }}
  {layout}
/>
