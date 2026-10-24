<!-- The Filters sheet: a modal dialog on the side (the kit's Dialog, variant sheet). It opens on a copy of the current tune with
     every setting preselected; "Update feed" applies the copy, Cancel, Escape and Close drop it. -->
<script lang="ts">
  import { Box, Button, Dialog, Group, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { FONT_IDS, type FontId } from "@ui8kit/taste-data/font-ids";
  import { parseStyleKey, type StyleKey } from "@ui8kit/taste-data/picks";
  import { COMPOSITIONS, RADII, RECIPES, SKIN_IDS } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import { CHARACTERS, DENSITIES, TASKS, type Tune } from "../lib/feed";
  import { applyTune, tuning } from "../lib/tune.svelte";
  import FilterGroup from "./filter-group.svelte";
  import FilterSelect from "./filter-select.svelte";
  import { fontLabel, valueLabel } from "./labels";

  let { picks }: { picks: StyleKey[] } = $props();
  let draft = $state<Tune | null>(null);

  // the native dialog of the kit's Dialog (found by id: the primitive does not forward an element ref)
  $effect(() => {
    const dialog = document.getElementById("mg-filter-sheet") as HTMLDialogElement | null;
    if (!dialog) return;
    if (tuning.sheet && !dialog.open) { draft = $state.snapshot(tuning.tune); dialog.showModal(); }
    else if (!tuning.sheet && dialog.open) dialog.close();
  });

  const opts = (axis: keyof Tune, values: readonly (string | number)[]) => values.map((v) => ({ value: String(v), label: valueLabel(axis, String(v)) }));
  const fontPairs = $derived.by(() => {
    const keys = new Set<string>();
    for (const k of picks) { const p = parseStyleKey(k); if (p) keys.add(`${p.fonts.display}~${p.fonts.body}`); }
    for (const f of FONT_IDS) keys.add(`${f}~${f}`);
    return [...keys].map((v) => { const [display, body] = v.split("~") as [FontId, FontId]; return { value: v, label: fontLabel({ display, body }) }; });
  });
  const set = (patch: Partial<Tune>) => { if (draft) draft = { ...draft, ...patch }; };
  function update(): void { if (draft) applyTune(draft); tuning.sheet = false; }
  const G = ui.feed.axes;
</script>

<Dialog id="mg-filter-sheet" variant="sheet" size="lg" class="mg-sheet" aria-labelledby="mg-sheet-title" onclose={() => (tuning.sheet = false)} data-testid="filter-sheet">
  {#if draft}
    <Box class="mg-sheet-head">
      <Group gap="2" justify="between" align="center">
        <Title as={2} class="mg-h2" id="mg-sheet-title">{ui.feed.sheet.title}</Title>
        <Button variant="ghost" size="sm" onclick={() => (tuning.sheet = false)} data-testid="filter-cancel">{ui.feed.sheet.cancel}</Button>
      </Group>
      <Text class="mg-note">{ui.feed.sheet.note}</Text>
    </Box>
    <Stack gap="0" class="mg-sheet-body" data-testid="filter-body">
      <FilterGroup name="comp" legend={G.comp} multiple options={opts("comp", COMPOSITIONS)} selected={draft.comp} onchange={(v) => set({ comp: v as Tune["comp"] })} />
      <FilterGroup name="character" legend={G.character} multiple options={opts("character", CHARACTERS)} selected={draft.character} onchange={(v) => set({ character: v as Tune["character"] })} />
      <FilterGroup name="density" legend={G.density} multiple options={opts("density", DENSITIES)} selected={draft.density} onchange={(v) => set({ density: v as Tune["density"] })} />
      <FilterGroup name="skins" legend={G.skins} multiple options={opts("skins", SKIN_IDS)} selected={draft.skins} onchange={(v) => v.length && set({ skins: v as Tune["skins"] })} />
      <FilterSelect name="font" legend={G.font} options={fontPairs} value={`${draft.font.display}~${draft.font.body}`} onchange={(v) => { const [display, body] = v.split("~") as [FontId, FontId]; set({ font: { display, body } }); }} />
      <FilterGroup name="radius" legend={G.radius} multiple={false} options={opts("radius", RADII)} selected={[String(draft.radius)]} onchange={(v) => set({ radius: Number(v[0]) as Tune["radius"] })} />
      <FilterGroup name="task" legend={G.task} multiple={false} options={opts("task", TASKS)} selected={[draft.task]} onchange={(v) => set({ task: v[0] as Tune["task"] })} />
      <FilterGroup name="media" legend={G.media} multiple options={opts("media", RECIPES)} selected={draft.media} onchange={(v) => set({ media: v as Tune["media"] })} />
    </Stack>
    <Group gap="2" class="mg-sheet-foot">
      <Button variant="outline" onclick={() => (draft = $state.snapshot(tuning.base))} data-testid="filter-reset">{ui.feed.reset}</Button>
      <Button class="mg-grow" onclick={update} data-testid="filter-update">{ui.feed.sheet.update}</Button>
    </Group>
  {/if}
</Dialog>
