<!-- The global Theme sheet: one modal dialog (the kit Dialog, variant sheet) holding two panels flush side by side: the narrow
     Theme panel on the right and, when opened from it, the wide Design system panel on its left. On narrow screens the wide panel
     replaces the narrow one (Back returns). State: lib/global-theme.svelte.ts. -->
<script lang="ts">
  import { Dialog, Group } from "@codegen-x/svelte-compose";
  import { gtheme } from "../lib/global-theme.svelte";
  import DsPanel from "./ds-panel.svelte";
  import ThemePanel from "./theme-panel.svelte";

  // no reactive attributes on the Dialog itself: a re-spread of its attributes writes `open` again and closes the modal
  // the native dialog of the kit's Dialog (found by id: the primitive does not forward an element ref)
  $effect(() => {
    const dialog = document.getElementById("mg-theme-sheet") as HTMLDialogElement | null;
    if (!dialog) return;
    if (gtheme.open && !dialog.open) dialog.showModal();
    else if (!gtheme.open && dialog.open) dialog.close();
  });
</script>

<Dialog id="mg-theme-sheet" variant="sheet" size="lg" class="mg-sheet mg-tsheet" aria-labelledby="mg-theme-title" onclose={() => { gtheme.open = false; gtheme.wide = false; }} data-testid="theme-sheet">
  {#if gtheme.open}
    <Group gap="0" align="stretch" class="mg-tpanels" data-wide={gtheme.wide ? "1" : "0"}>
      {#if gtheme.wide}<DsPanel />{/if}
      <ThemePanel />
    </Group>
  {/if}
</Dialog>
