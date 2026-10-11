<!--
  The sphere, one canvas, one WebGL context, in four states (plan/MAGAZINE.md §2):
    empty     no picks: the full-screen sphere turning slowly, nothing else (looking only; picks are made in Discovery)
    flying    arriving with picks: the sphere collapses into the header slot (CSS transform + clip-path of the stage; the camera backs out)
    ball      a small spinning ball of screens in the header, drawn at ~15 fps, paused with the tab; a button, nothing more
    expanding the ball grows back to the full sphere (the same flight, reversed)
    search    the full sphere with the picks outlined; double-click edits them; "Apply" recomputes the rows, "Cancel" keeps the old ones
  Reduced motion replaces the flights by a cross-fade. The canvas is moved by CSS only: no second context, the loader keeps filling cards the ball shows.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import ui from "../../content/ui.json";
  import { skinBackgrounds } from "@ui8kit/panorama/colors";
  import { Loader } from "@ui8kit/panorama/loader";
  import { Panorama } from "@ui8kit/panorama/panorama";
  import { wall } from "@ui8kit/panorama/wall";
  import { MIN_PICKS, type StyleKey } from "@ui8kit/taste-data/picks";
  import { variantKey } from "@ui8kit/taste-data/taste";
  import { TASTES } from "@ui8kit/taste-data/tastes";
  import { SCREENS } from "@ui8kit/taste-screens/screens";
  import { ctl, mag, savePicks, writePicksToUrl } from "../lib/state.svelte";

  let { arrive }: { arrive: boolean } = $props();

  let stage: HTMLElement;
  const stageRef = (node: HTMLElement) => { stage = node; };
  let draft = $state<StyleKey[]>([]);
  let barEl = $state<HTMLElement | null>(null);

  const FLY_MS = 800;
  const CLIP = 0.44; // the ball's clip circle, as a share of the stage height (the sphere fills about 0.875 of it)
  const BALL_PX = 56; // the ball's diameter in the header
  const BALL_SPIN = 24; // degrees a second
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  onMount(() => {
    const isDark = () => document.documentElement.classList.contains("dark");
    const tastes = new Map(TASTES.map((t) => [t.id, t]));
    let syncing = false;
    const pano: Panorama = new Panorama(stage, {
      onView: () => loader.resort(),
      onPick: (i, on) => {
        if (syncing) return;
        if (mag.phase !== "search") { if (on) pano.togglePicked(i, false); return; }
        if (on && pano.pickedCards().length > MIN_PICKS) { pano.togglePicked(i, false); return; } // an eleventh is not taken
        draft = pano.pickedCards().map((k) => variantKey(variants[k]!));
        mag.draft = draft.length;
      },
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
      if (mag.phase === "ball") pano.renderNow(); else loader.start(dark);
    };
    applyTheme();
    let last = isDark();
    const mo = new MutationObserver(() => { if (isDark() !== last) { last = isDark(); applyTheme(); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    const index = new Map<string, number>();
    variants.forEach((v, i) => { const k = variantKey(v); if (!index.has(k)) index.set(k, i); });
    /** outline exactly these styles (no events) */
    function outline(keys: readonly StyleKey[]): void {
      syncing = true;
      for (const i of pano.pickedCards()) pano.togglePicked(i, false);
      for (const k of keys) { const i = index.get(k); if (i !== undefined) pano.togglePicked(i, true); }
      syncing = false;
      draft = pano.pickedCards().map((k) => variantKey(variants[k]!));
      mag.draft = draft.length;
    }

    // ---- geometry of the ball: the stage keeps its full size; a transform and a clip circle show it as a ball over the header slot
    let currentScale = 1;
    const slot = (): HTMLElement | null => document.querySelector<HTMLElement>("[data-testid=ball]");
    function ballTransform(): string {
      const w = window.innerWidth, h = stage.offsetHeight || window.innerHeight;
      const r = slot()?.getBoundingClientRect();
      const cx = r ? r.left + r.width / 2 : w - 40, cy = r ? r.top + r.height / 2 : 28;
      const s = BALL_PX / (2 * CLIP * h);
      currentScale = s;
      return `translate(${cx - w / 2}px, ${cy - h / 2}px) scale(${s})`;
    }
    const clipFull = () => `circle(${Math.hypot(window.innerWidth, stage.offsetHeight || window.innerHeight) / 2 + 2}px at 50% 50%)`;
    const clipBall = () => `circle(${CLIP * (stage.offsetHeight || window.innerHeight)}px at 50% 50%)`;
    const setFrame = (ball: boolean) => {
      stage.style.transform = ball ? ballTransform() : "none";
      stage.style.clipPath = ball ? clipBall() : "none";
      if (!ball) currentScale = 1;
    };
    const renderScale = () => Math.max(0.05, Math.min(1, (BALL_PX * 4) / (2 * CLIP * (stage.offsetHeight || window.innerHeight))));

    let flight = 0; // generation of the running flight, so a new one cancels the old
    let anims: Animation[] = [];
    let raf = 0;
    /** move between the sphere (0) and the ball (1); resolves when done. Reduced motion cross-fades. */
    function fly(to: 0 | 1): Promise<void> {
      const id = ++flight;
      anims.forEach((a) => a.cancel()); anims = []; cancelAnimationFrame(raf);
      return new Promise((resolve) => {
        const finish = () => {
          cancelAnimationFrame(raf);
          if (id !== flight) return resolve();
          pano.setBall(to);
          setFrame(to === 1);
          stage.style.opacity = "";
          resolve();
        };
        if (reduced()) {
          const out = stage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
          anims.push(out);
          out.onfinish = () => {
            if (id !== flight) return resolve();
            pano.setBall(to); setFrame(to === 1);
            const inn = stage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "forwards" });
            anims.push(inn);
            inn.onfinish = () => { inn.cancel(); finish(); };
          };
          return;
        }
        const from = to === 1 ? "none" : ballTransform();
        const dest = to === 1 ? ballTransform() : "none";
        const a = stage.animate(
          [{ transform: from, clipPath: to === 1 ? clipFull() : clipBall() }, { transform: dest, clipPath: to === 1 ? clipBall() : clipFull() }],
          { duration: FLY_MS, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" },
        );
        anims.push(a);
        const step = () => {
          if (id !== flight || a.playState === "finished" || a.playState === "idle") return;
          const t = Math.min(1, Number(a.currentTime ?? 0) / FLY_MS); // follows the animation, so pausing it pauses the camera too
          pano.setBall(to === 1 ? ease(t) : 1 - ease(t));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        a.onfinish = () => { a.cancel(); finish(); };
      });
    }

    async function toBall(animated: boolean): Promise<void> {
      stage.style.pointerEvents = "none";
      stage.style.zIndex = "30";
      pano.setInteractive(false);
      mag.phase = "flying";
      outline([]);
      pano.setDrift(0);
      if (animated) await fly(1); else { pano.setBall(1); setFrame(true); }
      if (mag.phase !== "flying") return;
      pano.setRenderScale(renderScale());
      pano.setFps(15);
      pano.setDrift(reduced() ? 0 : BALL_SPIN);
      loader.resort(true); // the cards facing the ball first; what the cache has lands within moments, the loader runs on in the background
      mag.phase = "ball";
      pano.renderNow();
    }

    async function toSphere(): Promise<void> {
      if (mag.phase !== "ball") return;
      mag.phase = "expanding";
      pano.setFps(0);
      pano.setRenderScale(1);
      pano.setDrift(0);
      loader.start(isDark());
      outline(mag.picks);
      await fly(0);
      if (mag.phase !== "expanding") return;
      stage.style.zIndex = "";
      stage.style.pointerEvents = "";
      pano.setInteractive(true);
      mag.phase = "search";
      queueMicrotask(() => barEl?.querySelector<HTMLElement>("button")?.focus());
    }

    // the controls the template calls
    ctl.apply = () => {
      if (mag.phase !== "search" || draft.length !== MIN_PICKS) return;
      mag.picks = [...draft];
      savePicks(mag.picks);
      writePicksToUrl(mag.picks);
      void toBall(true).then(() => slot()?.focus());
    };
    ctl.cancel = () => { if (mag.phase === "search") void toBall(true).then(() => slot()?.focus()); };
    ctl.expand = () => { void toSphere(); };

    const onResize = () => { if (mag.phase === "ball") { setFrame(true); pano.setRenderScale(renderScale()); } };
    window.addEventListener("resize", onResize);

    if (mag.picks.length === 0) {
      // a slow turn about the vertical axis (about 4 degrees a second), idle only: a drag or its inertia takes over, reduced motion keeps it still
      pano.setDrift(reduced() ? 0 : 4);
    } else if (arrive) {
      pano.setInteractive(false);
      stage.style.pointerEvents = "none";
      // the full sphere for a beat (the cards load nearest first), then it flies into the header
      setTimeout(() => { if (mag.phase === "flying") void toBall(true); }, 700);
    } else {
      void toBall(false);
    }
    (window as unknown as { __magazine: unknown }).__magazine = {
      pano, loader, variants, ctl,
      state: () => ({ phase: mag.phase, ball: pano.getBall(), frames: pano.frames, picks: mag.picks.length, draft: draft.length, canvases: document.querySelectorAll("canvas").length }),
    };
    return () => { window.removeEventListener("resize", onResize); anims.forEach((a) => a.cancel()); cancelAnimationFrame(raf); mo.disconnect(); pano.dispose(); };
  });

  const searching = $derived(mag.phase === "search");
</script>

<svelte:window onkeydown={(e) => { if (e.key === "Escape" && mag.phase === "search") ctl.cancel(); }} />

<div class="discovery-stage mg-stage" data-testid="sphere" data-phase={mag.phase} role="img" aria-label={ui.empty.stage} {@attach stageRef}></div>

{#if searching}
  <div class="mg-bar" data-testid="search-bar" bind:this={barEl}>
    <p class="mg-bar-hint">{ui.search.hint}</p>
    <span class="mg-bar-count" role="status" data-testid="search-count">{draft.length}/{MIN_PICKS}</span>
    <button class="mg-btn mg-btn-primary" type="button" disabled={draft.length !== MIN_PICKS} onclick={() => ctl.apply()} data-testid="search-apply">{ui.search.apply}</button>
    <button class="mg-btn" type="button" onclick={() => ctl.cancel()} data-testid="search-cancel">{ui.search.cancel}</button>
  </div>
{/if}
