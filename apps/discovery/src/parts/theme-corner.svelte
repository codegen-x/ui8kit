<!-- The corner, outside the panorama: the Send button while cards are picked, then the kit's theme button (NavActions with a theme label). -->
<script lang="ts">
  import { Block, NavActions } from "@codegen-x/svelte-compose";
  import { ui } from "@ui8kit/app-shared/content";
  import { toggleTheme } from "@ui8kit/app-shared/runtime/theme";
  import { cardsMode } from "../picks.svelte";
  import RecommendButton from "./recommend-button.svelte";
  import SendButton from "./send-button.svelte";

  const recommend = cardsMode() === "recommend";
</script>

<Block tag="header" class="discovery-corner">
  {#if recommend}
    <RecommendButton />
  {:else}
    <SendButton />
  {/if}
  <NavActions actions="none" themeLabel={ui.theme.toggle} ontheme={() => toggleTheme()} />
</Block>
