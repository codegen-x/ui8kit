<!--
  The panorama: the only main landmark. A WebGL stage with nothing on it but the cards: no captions, counters or icons.
  Drag to look around; the wheel zooms (75 % to 125 % of the default scale); double-click a card to outline it (picked); the picks are kept in localStorage by variant key.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Block } from "@ui8kit/svelte-ui";
  import ui from "../../content/ui.json";
  import { assign } from "../engine/assign";
  import { skinBackgrounds } from "../engine/colors";
  import { Loader } from "../engine/loader";
  import { Panorama } from "../engine/panorama";
  import { SCREENS } from "../screens";
  import { variantKey } from "../taste";
  import { TASTES } from "../tastes";

  const PICKS = "discovery-picked";
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
      },
    });
    const variants = assign(pano.cards, TASTES);
    const loader = new Loader(pano, variants, tastes, SCREENS);
    const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius")) || 0.625;
    pano.setRadiusPx(radius * parseFloat(getComputedStyle(document.documentElement).fontSize || "16"));
    const savedSet = new Set(saved);
    variants.forEach((v, i) => { if (savedSet.has(variantKey(v))) pano.togglePicked(i, true); });

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
    return () => { mo.disconnect(); pano.dispose(); };
  });
</script>

<Block tag="main" id="main-content" class="discovery-stage" role="img" aria-label={ui.panorama.label} {@attach stageRef} />
