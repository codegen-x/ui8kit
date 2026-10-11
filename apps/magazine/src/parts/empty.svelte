<!--
  The empty state: no picks (opened directly, nothing stored). Only the sphere of screens, turning slowly (the Discovery
  panorama engine in search mode, one WebGL context), and one neutral hint. No collections, rows or placeholders.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Block } from "@ui8kit/svelte-ui";
  import ui from "../../content/ui.json";
  import { skinBackgrounds } from "@ui8kit/panorama/colors";
  import { Loader } from "@ui8kit/panorama/loader";
  import { Panorama } from "@ui8kit/panorama/panorama";
  import { wall } from "@ui8kit/panorama/wall";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import { TASTES } from "@ui8kit/taste-data/tastes";

  let stage: HTMLElement;
  const stageRef = (node: HTMLElement) => { stage = node; };

  onMount(() => {
    const isDark = () => document.documentElement.classList.contains("dark");
    const tastes = new Map(TASTES.map((t) => [t.id, t]));
    const pano: Panorama = new Panorama(stage, {
      onView: () => loader.resort(),
      onPick: (i, on) => { if (on) pano.togglePicked(i, false); }, // picking happens in Discovery; the sphere here is for looking
    });
    const variants = wall(pano.cards, TASTES);
    const loader = new Loader(pano, variants, tastes, SCREENS);
    const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--radius")) || 0.625;
    pano.setRadiusPx(radius * parseFloat(getComputedStyle(document.documentElement).fontSize || "16"));
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

    // a slow turn about the vertical axis (about 4 degrees a second), idle only: a drag or its inertia takes over, reduced motion keeps it still
    pano.setDrift(matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4);
    (window as unknown as { __magazine: unknown }).__magazine = { pano, loader, variants };
    return () => { mo.disconnect(); pano.dispose(); };
  });
</script>

<Block tag="main" id="main-content" class="discovery-stage" role="img" aria-label={ui.empty.stage} {@attach stageRef} />
<div class="mg-hint" data-testid="magazine-empty">
  <p>{ui.empty.hint}</p>
  <a class="mg-link" href="/discovery/?cards=recommend">{ui.empty.link}</a>
</div>
