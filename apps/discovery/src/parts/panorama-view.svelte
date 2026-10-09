<!--
  The panorama: the only main landmark. A WebGL stage with nothing on it but the cards: no captions, counters or icons.
  Drag to look around; the wheel zooms (75 % to 125 % of the default scale); double-click a card to outline it (picked); the picks are kept in localStorage by variant key.
  Every card of a row listed in curated.ts carries a small dot in its top-right corner (drawn on the card, not in the snapshot).
  Send (in the corner, while something is picked) records the picked screens and the row they came from on the preview server and clears the picks.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Block } from "@ui8kit/svelte-ui";
  import ui from "../../content/ui.json";
  import { CURATED_ROWS } from "../curated";
  import { skinBackgrounds } from "../engine/colors";
  import { rowFromTop } from "../engine/grid";
  import { Loader } from "../engine/loader";
  import { Panorama } from "../engine/panorama";
  import { wall } from "../engine/wall";
  import { cardsMode, discoveryBody, PICKS_KEY, picks, pickedCards, postPicks } from "../picks.svelte";
  import { SCREENS } from "../screens";
  import { variantKey } from "../taste";
  import { TASTES } from "../tastes";

  const MODE = cardsMode();
  const PICKS = PICKS_KEY[MODE];
  let stage: HTMLElement;

  function stageRef(node: HTMLElement) {
    stage = node;
  }

  onMount(() => {
    const isDark = () => document.documentElement.classList.contains("dark");
    const tastes = new Map(TASTES.map((t) => [t.id, t]));
    let saved: string[] = [];
    try { saved = JSON.parse(localStorage.getItem(PICKS) ?? "[]"); } catch { saved = []; }
    const pano: Panorama = new Panorama(stage, {
      onView: () => loader.resort(),
      onPick: () => {
        const keys = pano.pickedCards().map((i) => variantKey(variants[i]!));
        try { localStorage.setItem(PICKS, JSON.stringify(keys)); } catch { /* storage blocked */ }
        picks.count = MODE === "none" ? 0 : keys.length; // no Send button without ?cards=all|exclude
      },
    });
    const variants = wall(pano.cards, TASTES);
    const loader = new Loader(pano, variants, tastes, SCREENS);
    const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius")) || 0.625;
    pano.setRadiusPx(radius * parseFloat(getComputedStyle(document.documentElement).fontSize || "16"));
    if (MODE === "keep") pano.markCuratedRows(CURATED_ROWS.map((r) => r.row));
    const savedSet = new Set(saved);
    variants.forEach((v, i) => { if (savedSet.has(variantKey(v))) pano.togglePicked(i, true); });
    let sending = false;
    if (MODE !== "none") picks.send = async () => {
      if (sending) return;
      const slots = pano.pickedCards();
      const chosen = pickedCards(slots, (i) => ({ id: variants[i]!.screen, row: rowFromTop(pano.cards[i]!.row) }));
      if (!chosen.length) return;
      sending = true;
      const ok = await postPicks(discoveryBody(chosen, MODE === "exclude" ? "exclude" : "keep"));
      sending = false;
      // on failure the picks stay (and so does the button); on success only the cards that were sent are cleared
      if (ok) for (const i of slots) pano.togglePicked(i, false);
    };

    const applyTheme = () => {
      const dark = isDark();
      pano.setTheme(dark);
      const bg = skinBackgrounds(dark);
      variants.forEach((v, i) => pano.setPlaceholder(i, bg[v.skin]));
      loader.start(dark);
    };
    applyTheme();
    let last = isDark();
    const mo = new MutationObserver(() => { if (isDark() !== last) { last = isDark(); applyTheme(); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    (window as unknown as { __discovery: unknown }).__discovery = { pano, loader, variants };
    return () => { mo.disconnect(); picks.send = null; picks.count = 0; pano.dispose(); };
  });
</script>

<Block tag="main" id="main-content" class="discovery-stage" role="img" aria-label={ui.panorama.label} {@attach stageRef} />
