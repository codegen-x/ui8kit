<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Block } from '@codegen-x/svelte-compose';
  import TasteFrame from '@ui8kit/panorama/taste-frame.svelte';
  import { SCREENS } from '@ui8kit/taste-screens/screens';
  import { deckAt, type Deck } from '@ui8kit/taste-data/copy';
  import { parseStyleKey } from '@ui8kit/taste-data/picks';
  import { family } from '@ui8kit/taste-data/fonts';
  import type { FontPair, SkinId, Radius } from '@ui8kit/taste-data/taste';
  import catalog from '../../../../packages/taste-data/content/reference-catalog.v0.1.json';
  import common from '../../../../packages/taste-data/content/reference-copy.v0.1.json';
  const q = new URLSearchParams(location.search);
  const concept = catalog.concepts.find(c => c.id === (q.get('concept') ?? 'ref-c01'));
  const mode = q.get('mode') ?? 'authored';
  const variant = concept?.variants.find(v => v.axis === mode);
  const normalized = catalog.fixtures.comparison.styles.find(s => s.conceptId === concept?.id);
  const key = variant?.style.key ?? ((mode === 'normalized' || mode === 'long') ? normalized?.key : concept?.source.authoredStyle.key);
  const parts = key ? parseStyleKey(key) : null;
  const deck: Deck | null = concept ? (mode === 'long' ? {
    ...common,
    title: 'Build a thoughtful design direction that stays clear as your project and its content grow',
    accent: 'A deliberate choice, explained in enough detail to remain useful',
    lead: 'Compare structure, typography and visual emphasis before choosing a direction. This deliberately longer text checks whether a composition still makes room for the message, its supporting evidence and the next action on a narrow screen.',
    cta: 'Explore and compare this design direction',
    secondary: 'Read the full approach and supporting notes',
  } : mode === 'normalized' ? common : deckAt(concept.source.nativeDeckIndex)) : null;
  const narrow = q.get('probe') === 'narrow';
  const dark = q.get('theme') === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  onMount(async () => {
    await tick();
    if (!parts) return;
    await Promise.all([parts.fonts.display, parts.fonts.body].map(id => document.fonts.load(`600 24px "${family(id as FontPair['body'])}"`)));
    await document.fonts.ready;
    await new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done())));
    document.documentElement.dataset.captureReady = 'true';
  });
</script>

{#if concept && parts && deck}
  <Block tag="main" id="capture" data-concept={concept.id} data-key={key} data-mode={mode} data-probe={narrow ? 'narrow-reflow' : 'native-desktop'} class={narrow ? "narrow" : undefined}>
    <TasteFrame screen={SCREENS[parts.screen]!} {deck} skin={parts.skin as SkinId} fonts={parts.fonts as FontPair} radius={parts.radius as Radius} />
  </Block>
{:else}
  <Block tag="main"><p role="alert">Unknown reference concept or style.</p></Block>
{/if}

<style>
  :global(html), :global(body) { margin:0; padding:0; }
  :global(#capture) { width:1440px; height:1080px; }
  :global(#capture.narrow) { width:390px; height:844px; }
  /* A diagnostic width override, not an adaptation of the production screen. */
  :global(#capture.narrow .taste-frame) { width:390px; height:844px; }
</style>