<!-- The theme control, outside the panorama: the kit's theme button (NavActions with a theme label) in a corner. -->
<script lang="ts">
  import { Block, NavActions } from "@ui8kit/svelte-ui";
  import { ui } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
</script>

<Block tag="header" class="discovery-corner">
  <NavActions actions="none" themeLabel={ui.theme.toggle} ontheme={() => toggleTheme()} />
</Block>
