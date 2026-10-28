<!-- The global Theme sheet: one modal dialog (the kit Dialog, variant sheet) holding two panels flush side by side: the narrow Theme
     panel on the right and, when opened from it, one wide panel on its left: the Design system, the skin or font picker, or the palette (colour wheel). On narrow screens the wide panel replaces
     the narrow one (Back returns). The state is the app's (a ThemeController of @ui8kit/theme-model/controller: its storage key, its
     mode); the texts are the app's data. The Magazine and Stock render this one sheet. -->
<script lang="ts">
  import { Dialog, Group } from "@codegen-x/svelte-compose";
  import type { FontId } from "@ui8kit/taste-data/fonts";
  import type { ThemeController } from "@ui8kit/theme-model/controller";
  import DsPanel from "./ds-panel.svelte";
  import PalettePanel from "./palette-panel.svelte";
  import PickerPanel from "./picker-panel.svelte";
  import ThemePanel from "./theme-panel.svelte";
  import type { ThemeSheetText } from "./text";

  let { ctl, text, id, titleId, fallback, dismissible = false }: {
    ctl: ThemeController; text: ThemeSheetText;
    /** the id of the native dialog (the app may look it up) and of the narrow panel's heading, which names it */
    id: string; titleId: string;
    /** what the site shows where the theme sets nothing (the specimen's skin, font and radius) */
    fallback: { skin: string; font: FontId; radius: number };
    /** a click on the backdrop closes the sheet too (Esc and Close always do) */
    dismissible?: boolean;
  } = $props();

  // no reactive attributes on the Dialog itself: a re-spread of its attributes writes `open` again and closes the modal
  // the native dialog of the kit's Dialog (found by id: the primitive does not forward an element ref)
  $effect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    if (!dialog) return;
    if (ctl.open && !dialog.open) dialog.showModal();
    else if (!ctl.open && dialog.open) dialog.close();
  });
  function onclose(): void { ctl.open = false; ctl.wide = null; }
  function onclick(e: MouseEvent): void {
    if (!dismissible) return;
    const d = e.currentTarget as HTMLDialogElement;
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) ctl.open = false;
  }
</script>

<Dialog {id} variant="sheet" size="lg" class="ui8-theme-sheet" aria-labelledby={titleId} {onclose} {onclick} data-testid="theme-sheet">
  {#if ctl.open}
    <Group gap="0" align="stretch" class="ui8-theme-sheet-panels" data-wide={ctl.wide ? "1" : "0"}>
      {#if ctl.wide === "ds"}<DsPanel {ctl} {text} {fallback} />{:else if ctl.wide === "palette"}<PalettePanel {ctl} {text} />{:else if ctl.wide}<PickerPanel {ctl} {text} kind={ctl.wide} {fallback} />{/if}
      <ThemePanel {ctl} {text} {titleId} />
    </Group>
  {/if}
</Dialog>
