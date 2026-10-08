<!-- The corner, outside the panorama: the Send button while cards are picked, then the kit's theme button (NavActions with a theme label). -->
<script lang="ts">
  import { Block, NavActions } from "@ui8kit/svelte-ui";
  import { ui } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import SendButton from "./send-button.svelte";
</script>

<Block tag="header" class="discovery-corner">
  <SendButton />
  <NavActions actions="none" themeLabel={ui.theme.toggle} ontheme={() => toggleTheme()} />
</Block>
